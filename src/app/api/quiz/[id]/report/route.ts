import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { streamReport } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const sessions = await db.select().from(quizSessions).where(eq(quizSessions.id, id)).limit(1);
  if (sessions.length === 0) {
    return new Response('Not Found', { status: 404 });
  }
  const session = sessions[0];

  // 已完成 → 直接返
  if (session.reportStatus === 'completed' && session.reportText) {
    const cached = session.reportText;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: cached })}\n\n`));
        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }

  // 标记为 streaming
  await db.update(quizSessions).set({ reportStatus: 'streaming' }).where(eq(quizSessions.id, id));

  let accumulated = '';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamReport(session.placements, session.quizMeta ?? null)) {
          accumulated += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }
        await db
          .update(quizSessions)
          .set({ reportText: accumulated, reportStatus: 'completed' })
          .where(eq(quizSessions.id, id));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (e) {
        console.error('stream report error:', e);
        await db
          .update(quizSessions)
          .set({ reportStatus: 'failed' })
          .where(eq(quizSessions.id, id));
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'stream-failed' })}\n\n`));
        controller.close();
      }
    },
    cancel() {
      // 用户关 tab — 已写部分留着, streaming 状态让重连能拉
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

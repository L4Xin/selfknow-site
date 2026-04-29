import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db/client';
import { quizSessions, type Placement, type QuizMeta } from '@/lib/db/schema';
import { classify } from '@/lib/classify';
import { hashIp } from '@/lib/ip-hash';
import { submitRatelimit } from '@/lib/ratelimit';
import { ACTIVITY_BY_ID } from '@/lib/activities';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const ipHash = hashIp(ip, process.env.IP_HASH_SALT || 'dev-salt');

  // Rate limit
  const { success } = await submitRatelimit.limit(ipHash);
  if (!success) {
    return NextResponse.json(
      { error: 'rate-limited', message: '认识自己急不来 — 一小时后再来一次?' },
      { status: 429 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const { placements, quiz_meta } = body as {
    placements?: unknown;
    quiz_meta?: unknown;
  };

  if (!Array.isArray(placements) || placements.length < 5) {
    return NextResponse.json({ error: 'too-few-placements' }, { status: 400 });
  }
  if (placements.length > 30) {
    return NextResponse.json({ error: 'too-many-placements' }, { status: 400 });
  }

  // Validate each placement field with per-item narrowing
  for (const item of placements) {
    const p = item as {
      activity_id?: unknown;
      passion?: unknown;
      confidence?: unknown;
    };
    if (
      typeof p.activity_id !== 'string' ||
      !ACTIVITY_BY_ID[p.activity_id] ||
      typeof p.passion !== 'number' ||
      p.passion < -1 ||
      p.passion > 1 ||
      typeof p.confidence !== 'number' ||
      p.confidence < -1 ||
      p.confidence > 1
    ) {
      return NextResponse.json(
        { error: 'invalid-placement', activity_id: p.activity_id },
        { status: 400 }
      );
    }
  }

  // Server-side classification (guards against client-side tampering)
  const typeId = classify(placements as Placement[]);

  const id = nanoid(10);

  try {
    await db.insert(quizSessions).values({
      id,
      placements: placements as Placement[],
      typeId,
      reportStatus: 'pending',
      ipHash,
      userAgent: req.headers.get('user-agent') || null,
      quizMeta: (quiz_meta as QuizMeta) ?? null,
    });
  } catch (e) {
    console.error('db insert failed:', e);
    return NextResponse.json({ error: 'db-error' }, { status: 500 });
  }

  return NextResponse.json({ id, type_id: typeId });
}

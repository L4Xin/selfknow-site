import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { TypeCardLive } from '@/components/result/TypeCardLive';
import { StreamingReport } from '@/components/result/StreamingReport';
import { ShareModal } from '@/components/result/ShareModal';
import type { TypeId } from '@/lib/types-data';

export const dynamic = 'force-dynamic';

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessions = await db.select().from(quizSessions).where(eq(quizSessions.id, id)).limit(1);
  if (sessions.length === 0) notFound();
  const session = sessions[0];

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <TypeCardLive typeId={session.typeId as TypeId} />
      <StreamingReport sessionId={session.id} />
      <ShareModal sessionId={session.id} typeId={session.typeId as TypeId} />
    </main>
  );
}

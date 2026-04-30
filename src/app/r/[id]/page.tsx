import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { TypeCardLive } from '@/components/result/TypeCardLive';
import { ShareModal } from '@/components/result/ShareModal';
import { TYPE_BY_ID, type TypeId } from '@/lib/types-data';

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
  const typeId = session.typeId as TypeId;
  const type = TYPE_BY_ID[typeId];

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <TypeCardLive typeId={typeId} />
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4 text-stone-700">关于你这个类型</h2>
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
            {type.descZh}
          </p>
        </div>
      </section>
      <ShareModal sessionId={session.id} typeId={typeId} />
    </main>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TypeCardLive } from '@/components/result/TypeCardLive';
import { ShareModal } from '@/components/result/ShareModal';
import { TYPE_BY_ID, TYPE_DEFINITIONS, type TypeId } from '@/lib/types-data';

export function generateStaticParams() {
  return TYPE_DEFINITIONS.map(t => ({ type: t.id }));
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: typeParam } = await params;
  const type = TYPE_BY_ID[typeParam as TypeId];
  if (!type) notFound();

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <TypeCardLive typeId={type.id} />
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4 text-stone-700">关于你这个类型</h2>
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
            {type.descZh}
          </p>
        </div>
      </section>
      <ShareModal typeId={type.id} />

      <div className="mt-10 pt-6 border-t border-stone-200 text-center">
        <Link
          href="/quiz"
          className="inline-block px-6 py-3 bg-stone-100 border border-stone-300 rounded text-stone-700 font-medium hover:bg-stone-200 transition"
        >
          🎯 我也来测一次
        </Link>
        <p className="mt-2 text-xs text-stone-400">朋友分享给你的?自己拖一次看你是哪种</p>
      </div>
    </main>
  );
}

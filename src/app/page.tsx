import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-6 py-20 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">认识自我</h1>
      <p className="text-lg text-stone-600 mb-12">
        把你日常的活动,拖到一张"热情-自信"地图上。
        AI 会基于你独特的摆放,生成一份只属于你的画像。
      </p>
      <Link
        href="/quiz"
        className="inline-block bg-stone-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-stone-700 transition"
      >
        开始 →
      </Link>
      <p className="mt-12 text-sm text-stone-500">
        ⏱ 3 分钟 · 🔒 完全匿名 · 📷 生成可分享的类型卡
      </p>
    </main>
  );
}

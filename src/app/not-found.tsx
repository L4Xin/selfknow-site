import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-6 py-20 max-w-md text-center">
      <div className="text-5xl mb-4">🌫️</div>
      <h1 className="text-2xl font-bold mb-3">这个画像不见了</h1>
      <p className="text-stone-600 mb-6">也许它从未存在,也许你的链接错了。</p>
      <Link href="/quiz" className="inline-block px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700">
        做一个新的 quiz
      </Link>
    </main>
  );
}

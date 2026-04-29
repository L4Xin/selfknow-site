'use client';

import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container mx-auto px-6 py-20 max-w-md text-center">
      <div className="text-5xl mb-4">😶</div>
      <h1 className="text-2xl font-bold mb-3">出了点小问题</h1>
      <p className="text-stone-600 mb-6">{error.message || '系统打了个嗝。'}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700">
          再试一次
        </button>
        <Link href="/" className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-100">
          回首页
        </Link>
      </div>
    </main>
  );
}

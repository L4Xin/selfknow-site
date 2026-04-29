import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '认识自我 · selfknow.site',
  description: '通过摆放题目认识自己。把活动放进热情-自信地图,看见你内在的画像。',
  openGraph: {
    title: '认识自我',
    description: '通过摆放题目认识自己',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-stone-50 text-stone-900 min-h-screen">{children}</body>
    </html>
  );
}

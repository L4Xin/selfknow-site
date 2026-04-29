// Server-only React component used by @vercel/og to render PNG.
// Inline styles only (Satori doesn't support Tailwind).

import type { TypeDef } from '@/lib/types-data';

type Props = {
  type: TypeDef;
  qrDataUrl: string;
  size: 'square' | 'wide';
};

export function TypeCardStatic({ type, qrDataUrl, size }: Props) {
  const isSquare = size === 'square';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isSquare ? 'column' : 'row',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${type.colorPri}, ${type.colorSec})`,
        color: 'white',
        fontFamily: 'NotoSansSC',
        padding: isSquare ? 80 : 60,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
        <div style={{ fontSize: isSquare ? 28 : 22, opacity: 0.7, letterSpacing: 4, marginBottom: 16 }}>
          认识自我
        </div>
        <div style={{ fontSize: isSquare ? 36 : 28, opacity: 0.7, marginBottom: 24 }}>
          你的认知地图
        </div>
        <div style={{ fontSize: isSquare ? 120 : 80, fontWeight: 700, letterSpacing: 8, marginBottom: 32 }}>
          {type.labelZh}
        </div>
        <div style={{ fontSize: isSquare ? 36 : 26, opacity: 0.85, fontStyle: 'italic' }}>
          &ldquo;{type.taglineZh}&rdquo;
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSquare ? 'flex-start' : 'flex-end',
        justifyContent: 'flex-end',
        gap: 12,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} width={isSquare ? 160 : 130} height={isSquare ? 160 : 130} alt="QR" style={{ borderRadius: 8 }} />
        <div style={{ fontSize: isSquare ? 22 : 18, opacity: 0.6 }}>selfknow.site</div>
      </div>
    </div>
  );
}

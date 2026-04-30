// Pre-generates 16 type-card PNGs (8 types × 2 sizes) into public/cards/.
// Runs at build time before next build. Reads NEXT_PUBLIC_SITE_URL for QR code.
//
// Usage:
//   tsx scripts/build-cards.tsx                  # dev iteration
//   npm run build                                # baked into build pipeline
//
// Why pre-generate: the static export has no /api/quiz/[id]/image route, so
// PNGs need to ship as static assets. Same Satori render as before, just at
// build time instead of request time.

import { ImageResponse } from '@vercel/og';
import QRCode from 'qrcode';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TYPE_DEFINITIONS } from '../src/lib/types-data';
import { TypeCardStatic } from '../src/components/result/TypeCardStatic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const SIZES = {
  square: { width: 1080, height: 1080 },
  wide:   { width: 1200, height: 630 },
} as const;

async function main() {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'noto-sans-sc-subset.woff');
  const fontBuf = await fs.readFile(fontPath);
  const fontData = fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength) as ArrayBuffer;

  const qrDataUrl = await QRCode.toDataURL(`${SITE_URL}/quiz`, { width: 200, margin: 1 });

  const outDir = path.join(process.cwd(), 'public', 'cards');
  await fs.mkdir(outDir, { recursive: true });

  console.log(`Pre-generating cards · QR target = ${SITE_URL}/quiz`);

  let total = 0;
  for (const type of TYPE_DEFINITIONS) {
    for (const sizeName of Object.keys(SIZES) as Array<keyof typeof SIZES>) {
      const dim = SIZES[sizeName];
      const img = new ImageResponse(
        TypeCardStatic({ type, qrDataUrl, size: sizeName }),
        {
          width: dim.width,
          height: dim.height,
          fonts: [{ name: 'NotoSansSC', data: fontData, weight: 700, style: 'normal' }],
        }
      );
      const buf = Buffer.from(await img.arrayBuffer());
      const outPath = path.join(outDir, `${type.id}-${sizeName}.png`);
      await fs.writeFile(outPath, buf);
      console.log(`  ✓ ${type.id}-${sizeName}.png  (${(buf.length / 1024).toFixed(1)}KB)`);
      total++;
    }
  }
  console.log(`Done. ${total} PNGs in ${path.relative(process.cwd(), outDir)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { ImageResponse } from 'next/og';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { TYPE_BY_ID, type TypeId } from '@/lib/types-data';
import { TypeCardStatic } from '@/components/result/TypeCardStatic';
import { Redis } from '@upstash/redis';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function loadFont(): Promise<ArrayBuffer> {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'noto-sans-sc-subset.woff');
  const buf = await fs.readFile(fontPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const sizeParam = url.searchParams.get('size') || 'square';
  if (sizeParam !== 'square' && sizeParam !== 'wide') {
    return new Response('Bad size', { status: 400 });
  }
  const size = sizeParam as 'square' | 'wide';

  // 查 type_id
  const sessions = await db
    .select({ typeId: quizSessions.typeId })
    .from(quizSessions)
    .where(eq(quizSessions.id, id))
    .limit(1);
  if (sessions.length === 0) return new Response('Not Found', { status: 404 });
  const typeId = sessions[0].typeId as TypeId;
  const type = TYPE_BY_ID[typeId];
  if (!type) return new Response('Bad type', { status: 500 });

  // 缓存 key = type_id × size (全站 16 张)
  const cacheKey = `card:${typeId}:${size}`;
  const cached = await redis.get<string>(cacheKey);
  if (cached) {
    const buf = Buffer.from(cached, 'base64');
    return new Response(new Uint8Array(buf), {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  }

  // QR (固定指 /quiz)
  const qrDataUrl = await QRCode.toDataURL(`${SITE_URL}/quiz`, { width: 200, margin: 1 });

  // Font
  const fontData = await loadFont();

  // Render
  const W = size === 'square' ? 1080 : 1200;
  const H = size === 'square' ? 1080 : 630;

  const img = new ImageResponse(
    <TypeCardStatic type={type} qrDataUrl={qrDataUrl} size={size} />,
    {
      width: W,
      height: H,
      fonts: [{ name: 'NotoSansSC', data: fontData, weight: 700, style: 'normal' }],
    }
  );

  const arrBuf = await img.arrayBuffer();
  const base64 = Buffer.from(arrBuf).toString('base64');
  await redis.set(cacheKey, base64, { ex: 60 * 60 * 24 * 30 });

  return new Response(arrBuf, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}

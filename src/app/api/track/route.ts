import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { shareEvents } from '@/lib/db/schema';
import { hashIp } from '@/lib/ip-hash';
import { trackRatelimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

const VALID_EVENTS = new Set([
  'image_downloaded',
  'qr_scanned',
  'replay_clicked',
  'report_viewed',
]);

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
       || req.headers.get('x-real-ip')
       || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const ipHash = hashIp(ip, process.env.IP_HASH_SALT || 'dev-salt');

  const { success } = await trackRatelimit.limit(ipHash);
  if (!success) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const { session_id, event_type, referrer } = body as {
    session_id?: unknown;
    event_type?: unknown;
    referrer?: unknown;
  };

  if (typeof session_id !== 'string' || typeof event_type !== 'string' || !VALID_EVENTS.has(event_type)) {
    return NextResponse.json({ error: 'invalid-event' }, { status: 400 });
  }

  try {
    await db.insert(shareEvents).values({
      sessionId: session_id,
      eventType: event_type,
      referrer: typeof referrer === 'string' ? referrer : null,
    });
  } catch (e) {
    console.error('track insert failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

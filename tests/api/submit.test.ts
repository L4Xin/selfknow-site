import { describe, it, expect, vi } from 'vitest';

// Mock db, ratelimit BEFORE importing route
vi.mock('@/lib/db/client', () => ({
  db: {
    insert: () => ({ values: async () => undefined }),
  },
}));

vi.mock('@/lib/ratelimit', () => ({
  submitRatelimit: { limit: async () => ({ success: true }) },
}));

// Now import after mocks
import { POST } from '@/app/api/quiz/submit/route';
import { NextRequest } from 'next/server';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/quiz/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/quiz/submit', () => {
  it('rejects fewer than 5 placements', async () => {
    const req = makeReq({ placements: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('too-few-placements');
  });

  it('rejects invalid activity_id', async () => {
    const placements = Array.from({ length: 5 }, () => ({
      activity_id: 'NOT-REAL',
      passion: 0.5, confidence: 0.5,
      first_placed_at_ms: 0, final_at_ms: 0, move_count: 0,
    }));
    const req = makeReq({ placements });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects out-of-range coords', async () => {
    const placements = Array.from({ length: 5 }, () => ({
      activity_id: 'writing',
      passion: 1.5, confidence: 0,
      first_placed_at_ms: 0, final_at_ms: 0, move_count: 0,
    }));
    const req = makeReq({ placements });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns id + type_id on valid submit', async () => {
    const placements = ['writing', 'coding', 'reading', 'music', 'travel'].map(id => ({
      activity_id: id,
      passion: 0.5, confidence: 0.5,
      first_placed_at_ms: 0, final_at_ms: 0, move_count: 0,
    }));
    const req = makeReq({ placements });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThanOrEqual(8);
    expect(typeof body.type_id).toBe('string');
  });
});

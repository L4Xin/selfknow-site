import { describe, it, expect } from 'vitest';
import { hashIp } from '@/lib/ip-hash';

describe('hashIp', () => {
  it('produces deterministic hash for same input', () => {
    const a = hashIp('1.2.3.4', 'salt-x');
    const b = hashIp('1.2.3.4', 'salt-x');
    expect(a).toBe(b);
  });

  it('produces different hash for different IP', () => {
    const a = hashIp('1.2.3.4', 'salt-x');
    const b = hashIp('5.6.7.8', 'salt-x');
    expect(a).not.toBe(b);
  });

  it('produces different hash for different salt', () => {
    const a = hashIp('1.2.3.4', 'salt-x');
    const b = hashIp('1.2.3.4', 'salt-y');
    expect(a).not.toBe(b);
  });

  it('returns 64-char hex string', () => {
    const h = hashIp('1.2.3.4', 'salt-x');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });
});

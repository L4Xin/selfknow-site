import { describe, it, expect } from 'vitest';
import { classify } from '@/lib/classify';
import type { Placement } from '@/lib/types';

function p(activity_id: string, passion: number, confidence: number): Placement {
  return { activity_id, passion, confidence };
}

describe('classify', () => {
  it('returns multi-explorer when spread is large', () => {
    const placements: Placement[] = [
      p('a', 0.9, 0.9),
      p('b', -0.9, -0.9),
      p('c', 0.9, -0.9),
      p('d', -0.9, 0.9),
    ];
    expect(classify(placements)).toBe('multi-explorer');
  });

  it('returns passion-leader when tightly clustered top-right', () => {
    const placements: Placement[] = [
      p('a', 0.7, 0.7),
      p('b', 0.75, 0.65),
      p('c', 0.8, 0.7),
      p('d', 0.72, 0.68),
    ];
    expect(classify(placements)).toBe('passion-leader');
  });

  it('returns hidden-spark when tightly clustered top-left', () => {
    const placements: Placement[] = [
      p('a', 0.7, -0.7),
      p('b', 0.65, -0.75),
      p('c', 0.7, -0.6),
      p('d', 0.68, -0.7),
    ];
    expect(classify(placements)).toBe('hidden-spark');
  });

  it('returns observer when tightly clustered bottom-left', () => {
    const placements: Placement[] = [
      p('a', -0.7, -0.7),
      p('b', -0.75, -0.65),
      p('c', -0.7, -0.6),
      p('d', -0.68, -0.7),
    ];
    expect(classify(placements)).toBe('observer');
  });

  it('returns comfort-expert when tightly clustered bottom-right', () => {
    const placements: Placement[] = [
      p('a', -0.7, 0.7),
      p('b', -0.75, 0.65),
      p('c', -0.7, 0.6),
      p('d', -0.68, 0.7),
    ];
    expect(classify(placements)).toBe('comfort-expert');
  });

  it('returns middle-ground for centered tight cluster', () => {
    const placements: Placement[] = [
      p('a', 0.05, 0.05),
      p('b', -0.05, 0.05),
      p('c', 0.05, -0.05),
      p('d', 0.0, 0.0),
    ];
    expect(classify(placements)).toBe('middle-ground');
  });

  it('returns passion-neutral for moderate-spread top-leaning', () => {
    const placements: Placement[] = [
      p('a', 0.5, 0.2),
      p('b', 0.6, -0.2),
      p('c', 0.55, 0.0),
      p('d', 0.5, 0.3),
    ];
    expect(classify(placements)).toBe('passion-neutral');
  });

  it('returns settling-down for moderate-spread bottom-leaning', () => {
    const placements: Placement[] = [
      p('a', -0.5, 0.2),
      p('b', -0.6, -0.2),
      p('c', -0.55, 0.0),
      p('d', -0.5, 0.3),
    ];
    expect(classify(placements)).toBe('settling-down');
  });
});

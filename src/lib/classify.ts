import type { Placement } from './db/schema';
import type { TypeId } from './types-data';

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

export function classify(placements: Placement[]): TypeId {
  if (placements.length === 0) return 'middle-ground';

  const passions = placements.map(p => p.passion);
  const confidences = placements.map(p => p.confidence);
  const cy = mean(passions);
  const cx = mean(confidences);
  const sx = stddev(confidences);
  const sy = stddev(passions);

  // 散得开 → 多面探索
  if (sx + sy > 0.55) return 'multi-explorer';

  // 收得紧 → 看主方位
  if (sx + sy < 0.18) {
    if (cx > 0.4 && cy > 0.4)   return 'passion-leader';
    if (cx < -0.4 && cy > 0.4)  return 'hidden-spark';
    if (cx > 0.4 && cy < -0.4)  return 'comfort-expert';
    if (cx < -0.4 && cy < -0.4) return 'observer';
    return 'middle-ground';
  }

  // 中等散布 → 看 y 主导
  if (cy > 0.4)  return 'passion-neutral';
  if (cy < -0.4) return 'settling-down';
  return 'middle-ground';
}

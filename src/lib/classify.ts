import type { Placement } from './types';
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

  // 极度散布 (4 个角各有点) → 多面探索
  if (sx + sy > 0.7) return 'multi-explorer';

  // 簇中心落在某个 corner → 直接判定 (不再要求紧簇)
  // 阈值 0.4 = 板子 70% 那条线 (passion=0.4 ⟹ yPct < 30%, 即上 30%)
  if (cx > 0.4 && cy > 0.4)   return 'passion-leader';
  if (cx < -0.4 && cy > 0.4)  return 'hidden-spark';
  if (cx > 0.4 && cy < -0.4)  return 'comfort-expert';
  if (cx < -0.4 && cy < -0.4) return 'observer';

  // 簇中心不在 corner → 看 y 主导
  if (cy > 0.4)  return 'passion-neutral';
  if (cy < -0.4) return 'settling-down';
  return 'middle-ground';
}

import type { Placement } from '../src/lib/db/schema';

// 高斯采样 (Box-Muller)
function gauss(mean: number, sd: number): number {
  const u1 = Math.random(), u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(-1, Math.min(1, mean + sd * z));
}

type ProfileShape = {
  name: string;
  weight: number;
  mean: { passion: number; confidence: number };
  spread: number;
};

const PROFILES: ProfileShape[] = [
  { name: 'eager-confident', weight: 15, mean: { passion: 0.6,  confidence: 0.5 },  spread: 0.15 },
  { name: 'eager-doubtful',  weight: 15, mean: { passion: 0.6,  confidence: -0.5 }, spread: 0.15 },
  { name: 'cool-expert',     weight: 10, mean: { passion: -0.5, confidence: 0.6 },  spread: 0.15 },
  { name: 'detached',        weight: 10, mean: { passion: -0.6, confidence: -0.5 }, spread: 0.15 },
  { name: 'all-over',        weight: 15, mean: { passion: 0,    confidence: 0 },    spread: 0.5  },
  { name: 'centered',        weight: 10, mean: { passion: 0,    confidence: 0 },    spread: 0.08 },
  { name: 'passion-mid',     weight: 10, mean: { passion: 0.5,  confidence: 0 },    spread: 0.25 },
  { name: 'settling',        weight: 15, mean: { passion: -0.5, confidence: 0 },    spread: 0.25 },
];

export function generateOneSample(): Placement[] {
  const totalW = PROFILES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * totalW;
  let chosen = PROFILES[0];
  for (const p of PROFILES) {
    r -= p.weight;
    if (r <= 0) { chosen = p; break; }
  }
  const n = 5 + Math.floor(Math.random() * 6);
  return Array.from({ length: n }, (_, i) => ({
    activity_id: `mock-${i}`,
    passion: gauss(chosen.mean.passion, chosen.spread),
    confidence: gauss(chosen.mean.confidence, chosen.spread),
    first_placed_at_ms: 0,
    final_at_ms: 0,
    move_count: 0,
  }));
}

export function generateSamples(n: number): Placement[][] {
  return Array.from({ length: n }, () => generateOneSample());
}

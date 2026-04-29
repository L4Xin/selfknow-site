import { classify } from '../src/lib/classify';
import { TYPE_DEFINITIONS } from '../src/lib/types-data';
import { generateSamples } from './generate-samples';

const N = 1000;
const samples = generateSamples(N);
const counts: Record<string, number> = Object.fromEntries(
  TYPE_DEFINITIONS.map(t => [t.id, 0])
);

for (const sample of samples) {
  const typeId = classify(sample);
  counts[typeId]++;
}

console.log(`\n=== Distribution over ${N} synthetic samples ===\n`);
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [typeId, count] of sorted) {
  const pct = (count / N * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(count / N * 50));
  console.log(`  ${typeId.padEnd(20)} ${count.toString().padStart(4)} (${pct.padStart(5)}%) ${bar}`);
}

const max = Math.max(...Object.values(counts));
const min = Math.min(...Object.values(counts));
const ratio = max / Math.max(min, 1);
console.log(`\nMax/min ratio: ${ratio.toFixed(1)}`);
console.log(ratio > 8 ? '⚠️  分布不均,考虑调阈值' : '✓ 分布合理');

const empty = Object.entries(counts).filter(([_, c]) => c === 0).map(([id]) => id);
if (empty.length > 0) {
  console.log(`⚠️  空类: ${empty.join(', ')}`);
}

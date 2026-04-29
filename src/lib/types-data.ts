export type TypeId =
  | 'passion-leader'
  | 'hidden-spark'
  | 'comfort-expert'
  | 'observer'
  | 'multi-explorer'
  | 'middle-ground'
  | 'passion-neutral'
  | 'settling-down';

export type TypeDef = {
  id: TypeId;
  labelZh: string;
  taglineZh: string;
  colorPri: string;
  colorSec: string;
  emoji: string;
};

export const TYPE_DEFINITIONS: TypeDef[] = [
  { id: 'passion-leader',   labelZh: '热情主导', taglineZh: '你是被点燃的人',         colorPri: '#f59e0b', colorSec: '#dc2626', emoji: '🔥' },
  { id: 'hidden-spark',     labelZh: '隐藏火种', taglineZh: '光还没亮起,但燃料已就位', colorPri: '#1e1b4b', colorSec: '#f97316', emoji: '✨' },
  { id: 'comfort-expert',   labelZh: '舒适专家', taglineZh: '扎根的人有最深的视野',    colorPri: '#166534', colorSec: '#84cc16', emoji: '🌳' },
  { id: 'observer',         labelZh: '观察者',   taglineZh: '你看世界,世界也在被你看见', colorPri: '#1e3a8a', colorSec: '#475569', emoji: '👁️' },
  { id: 'multi-explorer',   labelZh: '多面探索', taglineZh: '边界对你不是问题',        colorPri: '#ec4899', colorSec: '#8b5cf6', emoji: '🌈' },
  { id: 'middle-ground',    labelZh: '中间地带', taglineZh: '克制是一种被低估的力量',  colorPri: '#64748b', colorSec: '#94a3b8', emoji: '⚖️' },
  { id: 'passion-neutral',  labelZh: '热情中立', taglineZh: '温度刚好,不烫手',         colorPri: '#9f1239', colorSec: '#fb923c', emoji: '🌅' },
  { id: 'settling-down',    labelZh: '沉淀蓄势', taglineZh: '地下的根比地上的枝长',    colorPri: '#312e81', colorSec: '#fbbf24', emoji: '🌌' },
];

export const TYPE_BY_ID: Record<TypeId, TypeDef> = Object.fromEntries(
  TYPE_DEFINITIONS.map(t => [t.id, t])
) as Record<TypeId, TypeDef>;

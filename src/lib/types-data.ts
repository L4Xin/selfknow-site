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
  descZh: string;
  colorPri: string;
  colorSec: string;
  emoji: string;
};

export const TYPE_DEFINITIONS: TypeDef[] = [
  {
    id: 'passion-leader',
    labelZh: '热情主导',
    taglineZh: '你是被点燃的人',
    descZh: '你的能量分布偏向高热情区——把更多时间投到了让自己兴奋、有冲劲的事情上。这种人容易被新机会点燃,也容易把身边人带动起来。代价是节奏猛、回血时间短,容易在巅峰之后突然没电。建议给自己留出"低强度日",别让长期高输出把火烧穿。',
    colorPri: '#f59e0b', colorSec: '#dc2626', emoji: '🔥',
  },
  {
    id: 'hidden-spark',
    labelZh: '隐藏火种',
    taglineZh: '光还没亮起,但燃料已就位',
    descZh: '你把热情活动放进了"现在还做不到"的位置——意愿很清楚,只是眼下条件还没凑齐。这不是逃避,是在等一个能真正发力的时间窗。你心里其实知道想要什么,缺的是一次推门的契机。别把"再准备一下"拖成"再等等",最小可执行版本现在就能起步。',
    colorPri: '#1e1b4b', colorSec: '#f97316', emoji: '✨',
  },
  {
    id: 'comfort-expert',
    labelZh: '舒适专家',
    taglineZh: '扎根的人有最深的视野',
    descZh: '你把更多权重给了已经驾轻就熟的事——不是不思进取,而是清楚什么对自己稳定有效。深耕带来的是别人复制不了的手感和判断力。注意别让"舒适"变成"惯性",每隔一阵主动加一点点不熟的内容,会让你的专长越长越深而不是越长越窄。',
    colorPri: '#166534', colorSec: '#84cc16', emoji: '🌳',
  },
  {
    id: 'observer',
    labelZh: '观察者',
    taglineZh: '你看世界,世界也在被你看见',
    descZh: '你的活动分布偏向低能耗、内省取向——倾向用看、想、记录的方式参与世界。这让你对模式和细节比大多数人敏感。代价是有时候在"看清楚"和"动起来"之间会卡住,把分析当成了行动的替代品。把你看到的东西变成一句对外的话或一个动作,就会从观察者变成发起者。',
    colorPri: '#1e3a8a', colorSec: '#475569', emoji: '👁️',
  },
  {
    id: 'multi-explorer',
    labelZh: '多面探索',
    taglineZh: '边界对你不是问题',
    descZh: '你的能量铺得很开——多个方向都给出了非零的投入,跨度大、组合方式不寻常。这是典型的"通用型选手"画像,适合做枢纽和翻译者:把一个领域的方法搬到另一个领域。短期看不像专家,长期看你的可迁移性是别人没有的护城河。注意定期挑一两个方向适当深挖,避免永远停在表层。',
    colorPri: '#ec4899', colorSec: '#8b5cf6', emoji: '🌈',
  },
  {
    id: 'middle-ground',
    labelZh: '中间地带',
    taglineZh: '克制是一种被低估的力量',
    descZh: '你的选择普遍落在"不极端"的位置——既没有把热情拉满,也没把舒适堆死。这种平衡不是骑墙,是一种成本意识很清楚的策略:你在保留切换余地。代价是别人有时会觉得你"没那么投入"。其实你只是没把全部筹码压在一处——这在长期里往往跑得更稳。',
    colorPri: '#64748b', colorSec: '#94a3b8', emoji: '⚖️',
  },
  {
    id: 'passion-neutral',
    labelZh: '热情中立',
    taglineZh: '温度刚好,不烫手',
    descZh: '你对感兴趣的事保持稳定的投入,但不会让它吞掉所有时间——是那种"做喜欢的事但不被它绑架"的人。这种距离感反而让你能持续做下去,而不是三个月后燃尽离场。你比起爆发型的人,更容易把一件事做成长期资产。',
    colorPri: '#9f1239', colorSec: '#fb923c', emoji: '🌅',
  },
  {
    id: 'settling-down',
    labelZh: '沉淀蓄势',
    taglineZh: '地下的根比地上的枝长',
    descZh: '你目前更多投在"还做不到"那一侧——意识到了想做什么,但还在攒条件、攒能力、攒勇气。这是过渡期画像,不是终点。地面上看不到太多动静,地下其实在长根。给自己一个时间表(比如三个月),别让"准备"无限延期,等条件凑齐到 70% 就该出土了。',
    colorPri: '#312e81', colorSec: '#fbbf24', emoji: '🌌',
  },
];

export const TYPE_BY_ID: Record<TypeId, TypeDef> = Object.fromEntries(
  TYPE_DEFINITIONS.map(t => [t.id, t])
) as Record<TypeId, TypeDef>;

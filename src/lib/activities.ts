export type ActivityCategory = 'creative' | 'social' | 'physical' | 'introvert';

export type ActivityDef = {
  id: string;
  labelZh: string;
  iconPath: string;       // /icons/xxx.svg
  category: ActivityCategory;
};

export const ACTIVITIES: ActivityDef[] = [
  { id: 'writing',    labelZh: '写作',   iconPath: '/icons/writing.svg',    category: 'creative' },
  { id: 'coding',     labelZh: '写代码', iconPath: '/icons/coding.svg',     category: 'creative' },
  { id: 'painting',   labelZh: '画画',   iconPath: '/icons/painting.svg',   category: 'creative' },
  { id: 'music',      labelZh: '音乐',   iconPath: '/icons/music.svg',      category: 'creative' },
  { id: 'photography',labelZh: '摄影',   iconPath: '/icons/photography.svg',category: 'creative' },
  { id: 'dance',      labelZh: '舞蹈',   iconPath: '/icons/dance.svg',      category: 'physical' },
  { id: 'sports',     labelZh: '运动',   iconPath: '/icons/sports.svg',     category: 'physical' },
  { id: 'cooking',    labelZh: '烹饪',   iconPath: '/icons/cooking.svg',    category: 'physical' },
  { id: 'travel',     labelZh: '旅游',   iconPath: '/icons/travel.svg',     category: 'physical' },
  { id: 'speech',     labelZh: '演讲',   iconPath: '/icons/speech.svg',     category: 'social' },
  { id: 'debate',     labelZh: '辩论',   iconPath: '/icons/debate.svg',     category: 'social' },
  { id: 'party',      labelZh: '聚会',   iconPath: '/icons/party.svg',      category: 'social' },
  { id: 'reading',    labelZh: '阅读',   iconPath: '/icons/reading.svg',    category: 'introvert' },
  { id: 'study',      labelZh: '学习',   iconPath: '/icons/study.svg',      category: 'introvert' },
  { id: 'solitude',   labelZh: '独处',   iconPath: '/icons/solitude.svg',   category: 'introvert' },
  { id: 'gaming',     labelZh: '游戏',   iconPath: '/icons/gaming.svg',     category: 'introvert' },
];

export const ACTIVITY_BY_ID: Record<string, ActivityDef> = Object.fromEntries(
  ACTIVITIES.map(a => [a.id, a])
);

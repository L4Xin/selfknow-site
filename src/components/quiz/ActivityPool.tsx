'use client';

import { ACTIVITIES } from '@/lib/activities';
import { ActivityBlock } from './ActivityBlock';

type Props = {
  placedIds: Set<string>;
};

export function ActivityPool({ placedIds }: Props) {
  const available = ACTIVITIES.filter(a => !placedIds.has(a.id));
  return (
    <div className="bg-stone-100 border border-stone-200 rounded p-3 min-h-[280px]">
      <div className="text-xs text-stone-500 mb-2">活动池 (拖到地图)</div>
      <div className="flex flex-wrap gap-2">
        {available.map(a => (
          <ActivityBlock key={a.id} activity={a} placed={false} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { useDroppable } from '@dnd-kit/core';
import { useRef } from 'react';
import { ActivityBlock } from './ActivityBlock';
import { ACTIVITY_BY_ID } from '@/lib/activities';
import type { Placement } from '@/lib/db/schema';

type Props = {
  placements: Placement[];
  onRemove: (activityId: string) => void;
};

export function QuadrantBoard({ placements, onRemove }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'board' });
  const boardRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="text-xs text-stone-500 mb-2">把活动拖到对应位置 · 至少 5 个</div>
      <div
        ref={(node) => {
          setNodeRef(node);
          boardRef.current = node;
        }}
        data-board="true"
        className={`relative bg-stone-50 border-2 rounded w-full h-[400px] ${
          isOver ? 'border-stone-500 bg-stone-100' : 'border-stone-200'
        }`}
      >
        {/* 中线 */}
        <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-stone-300" />
        <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-stone-300" />
        {/* 轴标签 */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-stone-500 bg-stone-50 px-2">↑ 高热情</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-stone-500 bg-stone-50 px-2">↓ 低热情</div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-stone-500 bg-stone-50 px-2 [writing-mode:vertical-rl]">← 低自信</div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-stone-500 bg-stone-50 px-2 [writing-mode:vertical-rl]">高自信 →</div>

        {/* 已放置方块 */}
        {placements.map(p => {
          const activity = ACTIVITY_BY_ID[p.activity_id];
          if (!activity) return null;
          const leftPct = (p.confidence + 1) / 2 * 100;
          const topPct = (1 - (p.passion + 1) / 2) * 100;
          return (
            <div
              key={p.activity_id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <ActivityBlock
                activity={activity}
                placed={true}
                onRemove={() => onRemove(p.activity_id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

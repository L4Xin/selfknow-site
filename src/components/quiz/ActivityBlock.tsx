'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ActivityDef } from '@/lib/activities';

type Props = {
  activity: ActivityDef;
  placed: boolean;
  onRemove?: () => void;
};

export function ActivityBlock({ activity, placed, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { activity },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-grab select-none touch-none ${
        placed
          ? 'bg-stone-900 text-white'
          : 'bg-white border border-stone-300 text-stone-800'
      }`}
    >
      <span>{activity.labelZh}</span>
      {placed && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 text-white/70 hover:text-white"
          aria-label="移除"
        >
          ✕
        </button>
      )}
    </div>
  );
}

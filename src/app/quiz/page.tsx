'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ActivityPool } from '@/components/quiz/ActivityPool';
import { QuadrantBoard } from '@/components/quiz/QuadrantBoard';
import type { Placement } from '@/lib/db/schema';

const MIN_PLACEMENTS = 5;
const LS_KEY = 'selfknow.draft';

export default function QuizPage() {
  const router = useRouter();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const firstActionMsRef = useRef<number | null>(null);

  // 启动时从 localStorage 恢复
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPlacements(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(placements));
  }, [placements]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta, activatorEvent } = event;
    if (!over || over.id !== 'board') return;
    const activityId = active.id as string;

    const board = document.querySelector('[data-board="true"]') as HTMLElement | null;
    if (!board) return;
    const rect = board.getBoundingClientRect();

    const ae = activatorEvent as MouseEvent | TouchEvent;
    let clientX: number, clientY: number;
    if ('touches' in ae && (ae as TouchEvent).changedTouches?.[0]) {
      const t = (ae as TouchEvent).changedTouches[0];
      clientX = t.clientX + delta.x;
      clientY = t.clientY + delta.y;
    } else {
      const me = ae as MouseEvent;
      clientX = me.clientX + delta.x;
      clientY = me.clientY + delta.y;
    }
    const xPct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const yPct = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const confidence = xPct * 2 - 1;
    const passion = (1 - yPct) * 2 - 1;

    const now = Date.now();
    const tFromStart = now - startTimeRef.current;
    if (firstActionMsRef.current === null) {
      firstActionMsRef.current = tFromStart;
    }

    setPlacements(prev => {
      const existing = prev.find(p => p.activity_id === activityId);
      if (existing) {
        return prev.map(p =>
          p.activity_id === activityId
            ? { ...p, passion, confidence, final_at_ms: tFromStart, move_count: p.move_count + 1 }
            : p
        );
      }
      return [
        ...prev,
        {
          activity_id: activityId,
          passion,
          confidence,
          first_placed_at_ms: tFromStart,
          final_at_ms: tFromStart,
          move_count: 0,
        },
      ];
    });
  }

  function handleRemove(activityId: string) {
    setPlacements(prev => prev.filter(p => p.activity_id !== activityId));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placements,
          quiz_meta: {
            duration_ms: Date.now() - startTimeRef.current,
            first_action_ms: firstActionMsRef.current ?? 0,
            viewport: { w: window.innerWidth, h: window.innerHeight },
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
      }
      const { id } = await res.json();
      localStorage.removeItem(LS_KEY);
      router.push(`/r/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '提交失败');
      setSubmitting(false);
    }
  }

  const placedIds = new Set(placements.map(p => p.activity_id));
  const canSubmit = placements.length >= MIN_PLACEMENTS && !submitting;

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">热情 - 自信地图</h1>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
          <QuadrantBoard placements={placements} onRemove={handleRemove} />
          <ActivityPool placedIds={placedIds} />
        </div>
      </DndContext>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-stone-500">
          已放 {placements.length} 个 · {canSubmit ? '可提交' : `还差 ${MIN_PLACEMENTS - placements.length} 个`}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-stone-900 text-white px-6 py-3 rounded font-medium hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition"
        >
          {submitting ? '生成中...' : '提交,看我的画像 →'}
        </button>
      </div>
      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
    </main>
  );
}

'use client';
import type { TypeId } from '@/lib/types-data';

export function ShareModal({ sessionId, typeId }: { sessionId: string; typeId: TypeId }) {
  // T27 will replace with full version (iOS WeChat handling, modal, tracking).
  // Stub for T23 so /r/[id] page compiles.
  void typeId;
  return (
    <div className="mt-6 flex gap-3">
      <a
        href={`/api/quiz/${sessionId}/image?size=square`}
        download={`selfknow-${sessionId}.png`}
        className="px-4 py-2 bg-stone-900 text-white rounded text-sm hover:bg-stone-700"
      >
        下载方形 (微信)
      </a>
      <a
        href={`/api/quiz/${sessionId}/image?size=wide`}
        download={`selfknow-${sessionId}-wide.png`}
        className="px-4 py-2 border border-stone-300 rounded text-sm hover:bg-stone-100"
      >
        下载宽形 (Twitter)
      </a>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import type { TypeId } from '@/lib/types-data';
import { parseUA } from '@/lib/ua';

type Props = {
  typeId: TypeId;
};

export function ShareModal({ typeId }: Props) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<'square' | 'wide'>('square');
  const [needsLongPress, setNeedsLongPress] = useState(false);

  useEffect(() => {
    const ua = parseUA(navigator.userAgent);
    setNeedsLongPress(ua.needsLongPressHint);
  }, []);

  function openShare(s: 'square' | 'wide') {
    setSize(s);
    setOpen(true);
  }

  function handleDownload() {
    if (needsLongPress) return;
    const a = document.createElement('a');
    a.href = `/cards/${typeId}-${size}.png`;
    a.download = `selfknow-${typeId}-${size}.png`;
    a.click();
  }

  const imgUrl = `/cards/${typeId}-${size}.png`;
  const platformZh = size === 'square' ? '微信' : 'Twitter';

  return (
    <>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => openShare('square')}
          className="px-4 py-2 bg-stone-900 text-white rounded text-sm hover:bg-stone-700"
        >
          分享到微信
        </button>
        <button
          onClick={() => openShare('wide')}
          className="px-4 py-2 border border-stone-300 rounded text-sm hover:bg-stone-100"
        >
          分享到 Twitter
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-center">你的类型卡</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt="你的类型卡"
              className="w-full rounded mb-4"
              onLoad={handleDownload}
            />
            {needsLongPress ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded text-sm text-center">
                📱 长按图片 → 选择&ldquo;保存到相册&rdquo;,再到{platformZh}发布
              </div>
            ) : (
              <div className="text-sm text-stone-600 text-center">
                <p>图片已下载,保存后到{platformZh}发布即可。</p>
                <p className="mt-1 text-xs text-stone-400">没看到下载?右键图片&ldquo;另存为&rdquo;</p>
              </div>
            )}
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full px-4 py-2 border border-stone-300 rounded hover:bg-stone-100"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';

type Props = {
  sessionId: string;
};

type Status = 'streaming' | 'completed' | 'failed';

export function StreamingReport({ sessionId }: Props) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status>('streaming');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const url = `/api/quiz/${sessionId}/report`;
    const es = new EventSource(url);
    let acc = '';

    es.onmessage = (event) => {
      if (event.data === '[DONE]') {
        setStatus('completed');
        es.close();
        return;
      }
      try {
        const parsed = JSON.parse(event.data);
        acc += parsed.text;
        setText(acc);
      } catch {}
    };

    es.onerror = () => {
      setStatus('failed');
      es.close();
    };

    return () => es.close();
  }, [sessionId, retryKey]);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-stone-700">你的画像报告</h2>
      <div className="bg-white border border-stone-200 rounded-lg p-6 min-h-[200px]">
        {text && (
          <div className="text-stone-800 leading-relaxed whitespace-pre-wrap">
            {text}
            {status === 'streaming' && <span className="animate-pulse">▊</span>}
          </div>
        )}
        {!text && status === 'streaming' && (
          <div className="text-stone-400">正在为你生成画像...</div>
        )}
        {status === 'failed' && (
          <div className="text-amber-700">
            <p>画像还没出炉 — 系统打了个嗝。</p>
            <button
              onClick={() => { setText(''); setStatus('streaming'); setRetryKey(k => k + 1); }}
              className="mt-3 px-4 py-2 bg-amber-100 text-amber-900 rounded hover:bg-amber-200"
            >
              重新生成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

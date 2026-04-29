import { TYPE_BY_ID, type TypeId } from '@/lib/types-data';

type Props = {
  typeId: TypeId;
};

export function TypeCardLive({ typeId }: Props) {
  const t = TYPE_BY_ID[typeId];
  if (!t) return <div className="text-red-600">未知类型: {typeId}</div>;

  return (
    <div
      className="rounded-xl p-8 text-white shadow-lg flex flex-col items-center justify-center min-h-[260px]"
      style={{ background: `linear-gradient(135deg, ${t.colorPri}, ${t.colorSec})` }}
    >
      <div className="text-xs opacity-70 tracking-widest uppercase mb-2">认识自我</div>
      <div className="text-sm opacity-70 mb-2">你的认知地图</div>
      <div className="text-4xl font-bold tracking-wider mb-3">{t.labelZh}</div>
      <div className="text-base opacity-90 italic">&ldquo;{t.taglineZh}&rdquo;</div>
    </div>
  );
}

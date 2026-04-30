// 拖拽答题的 placement 数据结构。
// 静态站只需要这 3 个字段就能 classify;原先的 timing 字段是后端分析用的,删去。

export type Placement = {
  activity_id: string;
  passion: number;       // [-1, +1] · y 轴
  confidence: number;    // [-1, +1] · x 轴
};

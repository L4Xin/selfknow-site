# 认识自我 (selfknow.site) — 单题爆款 MVP 设计稿

**日期**: 2026-04-29
**作者**: 与 Claude (superpowers:brainstorming) 协作输出
**版本**: v1.0 (草案,待评审)
**状态**: ✅ 设计完成,待写实现计划

---

## 1. 背景与目标

### 1.1 产品愿景

把 LeetCode 形式套到自我认知测验上的网站。用户做"摆放型"互动题目,基于结果获得个人画像 + 可分享的类型卡。题目源自心理学经典著作。

### 1.2 商业野心

**起业 / 商业产品**。MVP 用于验证假设、收集真实流量数据,后续视情况拓展付费 / B 端 / 社区。

### 1.3 MVP 假设

> "如果我们把**一道**摆放型题目打磨到极致(交互、解析、分享体验),用户会主动把它分享到朋友圈/微信,并带来新流量。"

K(病毒系数)= 1 用户带 ≥ 0.5 个新用户 → 假设成立。

---

## 2. 范围

### 2.1 MVP 范围(v1)

- ✅ **1 道**核心 quiz: 热情-自信四象限活动摆放
- ✅ 8 个固定类型(用于分享卡 label + tagline)
- ✅ LLM 生成的 200-300 字个性化长报告(私享)
- ✅ 类型卡 PNG 下载(方形 + 宽形)
- ✅ 通用 QR 码(指向 quiz 入口,不含个性化追踪)
- ✅ 匿名持久化(quiz 结果可回访,无账号)
- ✅ 内置埋点 + Vercel Analytics 双轨监控
- ✅ iOS/微信"长按保存"兼容 modal

### 2.2 v1.5 后续

- 多 quiz 题型(排序、选择、匹配)
- 题库浏览 / 标签筛选 / 随机抽题
- 用户账号(可选邮箱绑定,不强制)
- 个性化二维码(追踪传播链路)
- LLM 续写(失败重试时从已生成位置接续)

### 2.3 v2 路线

- 评论 / UGC
- 内容运营后台(8 类文案、活动方块运营时编辑)
- 付费墙(完整版报告 / 历史画像追踪)
- B 端授权(企业内部测评)

### 2.4 明确不做

- 微信小程序(v1 走 H5)
- 国内云 + ICP 备案(默认 Vercel,海外/全球中文用户优先)
- 心理咨询服务 / 医疗建议(法律红线)

---

## 3. 系统架构

### 3.1 技术栈

| 层 | 选型 | 备注 |
|---|---|---|
| 前端框架 | Next.js 14+ App Router | React Server Components + 客户端拖拽 |
| 拖拽库 | `@dnd-kit/core` + `@dnd-kit/modifiers` | 现代,SSR 友好,移动端原生支持 |
| UI / 样式 | Tailwind CSS | 快速 + 类型卡组件复用 |
| 后端 | Next.js API Routes (Vercel Functions) | serverless,免运维 |
| 数据库 | Neon Postgres | serverless,免费 0.5GB 起步 |
| ORM | Drizzle ORM | 类型安全,迁移友好 |
| LLM | Anthropic Claude Sonnet 4.6 | 创意写作性价比最高 |
| 图片生成 | `@vercel/og` (Satori) | React JSX → PNG |
| QR 码 | `qrcode` (npm) | 服务端生成 base64 PNG |
| 缓存 | Vercel KV | 类型卡 PNG 永久缓存 |
| 限流 | `@upstash/ratelimit` | IP-based,~10 行配置 |
| 监控 | Vercel Analytics + Sentry | 流量 + 错误双轨 |
| 部署 | Vercel | git push 触发,免运维 |
| 域名 | `selfknow.site` | (待注册确认) |

### 3.2 架构图

```
┌─────────────────────────────────────────────────────┐
│              BROWSER (Next.js Pages)                │
│                                                     │
│   /            首页 · 介绍 + 开始按钮                │
│   /quiz        拖拽答题 (drag-drop interactive)      │
│   /r/[id]      结果页(类型卡 + 流式长报告)           │
│                                                     │
└────────────┬─────────────────┬──────────────────────┘
             │                 │
        POST submit      GET stream report
             │                 │
┌────────────▼─────────────────▼──────────────────────┐
│       NEXT.JS API ROUTES (Vercel Functions)         │
│                                                     │
│  POST /api/quiz/submit                              │
│     ↓ 入库 + 算 8 类 + 返回 id                       │
│  GET  /api/quiz/[id]/report   (SSE stream)          │
│     ↓ 拉拖拽数据 → 调 LLM → 流式回写                 │
│  GET  /api/quiz/[id]/image    (PNG)                 │
│     ↓ @vercel/og 渲染类型卡 + QR 码                  │
│  POST /api/track                                    │
│     ↓ 写 share_events                               │
│                                                     │
└────────────┬─────────────────┬──────────────────────┘
             │                 │
             ▼                 ▼
   ┌──────────────────┐  ┌──────────────────────┐
   │  Neon Postgres   │  │  Anthropic Claude    │
   │                  │  │  (Sonnet 4.6 stream) │
   │  · sessions      │  │                      │
   │  · activities    │  └──────────────────────┘
   │  · type_defs     │
   │  · share_events  │  ┌──────────────────────┐
   └──────────────────┘  │  Vercel KV (缓存)    │
                         │  · 16 张类型卡 PNG   │
                         └──────────────────────┘
```

### 3.3 关键约束

- **Vercel Function 超时**: 免费版 10s,付费 60s。LLM 报告必须流式
- **Neon 冷启动**: ~500ms 延迟,首次提交略慢
- **匿名 ID**: cookie + URL 持有,清 cookie / 换设备 = 丢失(v1 接受)
- **字体子集化**: Satori 不带 CJK,需提前裁剪思源黑体到 ~30KB

---

## 4. 数据模型

### 4.1 表结构

```sql
-- SEED · 静态(部署时灌,运行时只读)
CREATE TABLE activities (
  id          TEXT PRIMARY KEY,        -- 'writing', 'dance', ...
  label_zh    TEXT NOT NULL,
  icon_path   TEXT,
  category    TEXT                     -- 'creative' | 'social' | 'physical' | 'introvert'
);

-- SEED · 静态
CREATE TABLE type_definitions (
  id           TEXT PRIMARY KEY,        -- 'passion-leader', 'hidden-spark', ...
  label_zh     TEXT NOT NULL,           -- '热情主导'
  tagline_zh   TEXT NOT NULL,           -- '你是被点燃的人'
  color_pri    TEXT NOT NULL,           -- '#f59e0b'
  color_sec    TEXT NOT NULL,           -- '#dc2626'
  emoji        TEXT
);

-- CORE · 业务
CREATE TABLE quiz_sessions (
  id              TEXT PRIMARY KEY,                    -- nanoid(10)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  placements      JSONB NOT NULL,                      -- 见下方 schema
  type_id         TEXT NOT NULL REFERENCES type_definitions(id),
  report_text     TEXT,
  report_status   TEXT NOT NULL DEFAULT 'pending',    -- 'pending' | 'streaming' | 'completed' | 'failed'
  ip_hash         TEXT NOT NULL,                       -- sha256(ip + salt)
  user_agent      TEXT,
  quiz_meta       JSONB                                -- {duration_ms, first_action_ms, viewport}
);
CREATE INDEX idx_sessions_created ON quiz_sessions(created_at);
CREATE INDEX idx_sessions_type    ON quiz_sessions(type_id);

-- ANALYTICS · 埋点
CREATE TABLE share_events (
  id           BIGSERIAL PRIMARY KEY,
  session_id   TEXT NOT NULL REFERENCES quiz_sessions(id),
  event_type   TEXT NOT NULL,           -- 'image_downloaded' | 'qr_scanned' | 'replay_clicked' | 'report_viewed'
  referrer     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_session ON share_events(session_id, created_at);
CREATE INDEX idx_events_type    ON share_events(event_type, created_at);
```

### 4.2 `placements` jsonb schema

```typescript
type Placement = {
  activity_id: string;        // FK → activities.id
  passion: number;            // [-1, +1] 语义坐标 (高在 +1)
  confidence: number;         // [-1, +1] 语义坐标 (高在 +1)
  first_placed_at_ms: number; // 自 quiz 开始计时,首次落子的 ms
  final_at_ms: number;        // 最后一次移动 / 落定的 ms (从未移动则 = first_placed_at_ms)
  move_count: number;         // 拖拽调整次数 (0 = 一次到位,首次落子不算调整)
};

// quiz_sessions.placements 是 Placement[]
```

### 4.3 `quiz_meta` jsonb schema

```typescript
type QuizMeta = {
  duration_ms: number;          // 提交时距 quiz 开始的总时长
  first_action_ms: number;      // 第一次拖动起来前的犹豫时长
  viewport: { w: number, h: number };
  // 备注: 不存原始 IP,不存精确 timestamp,只存相对时长
};
```

### 4.4 设计决策

- **seed 表 vs admin-editable 表**: v1 走 seed(改 8 类文案 = git commit),v2 视运营频率改造
- **placements 用 jsonb 而不是子表**: 单次提交 ≤ 20 项,jsonb 读写更快,免 join
- **report 状态机**: pending → streaming → completed | failed,前端据此重连/重试
- **不存 user_id**: 完全匿名,v1 不引入账号体系
- **ip_hash**: sha256(ip + salt),不存原始 IP,合规友好

---

## 5. 拖拽答题(/quiz)

### 5.1 UX 流程

1. 用户点击首页"开始" → 跳 `/quiz`
2. 答题页布局: 主区四象限图(占 ~70%) + 右侧/下方活动池(12-20 个固定方块)
3. 用户从池中拖方块到象限内任意位置
4. 同一活动**只能放一个位置**(放第二次自动从原位置移走)
5. 已放方块可再拖 / 点 ✕ 移回池
6. **至少放 5 个**才能提交(否则按钮禁用 + 提示)
7. 没有时间限制(慢慢想是产品价值之一)
8. 点"提交,看我的画像 →" → POST `/api/quiz/submit`

### 5.2 坐标系

```
       (passion=+1)
            │
            │ Q4         Q1
            │  高热情      高热情
            │  低自信      高自信
   (-1)─────┼─────────── (+1)  (confidence)
            │  低热情      低热情
            │  低自信      高自信
            │ Q3         Q2
            │
       (passion=-1)
```

- X 轴 = 自信 (左低右高)
- Y 轴 = 热情 (下低上高)
- 中心 = 中性
- 范围 [-1, +1] 双向

### 5.3 移动端兼容

- `@dnd-kit/core` 原生支持 touch
- 点击/触摸方块开始拖,支持自动滚动(超出可视区时)
- 微信内置浏览器测试覆盖

---

## 6. 8 类分桶算法

### 6.1 算法逻辑

客户端 + 服务端各跑一次(冗余防作弊),取服务端结果为准:

```typescript
function classify(placements: Placement[]): TypeId {
  const xs = placements.map(p => p.confidence);
  const ys = placements.map(p => p.passion);
  const cx = mean(xs), cy = mean(ys);    // 重心
  const sx = stddev(xs), sy = stddev(ys); // 散布

  // 散得开 → 多面探索
  if (sx + sy > 0.55) return "multi-explorer";

  // 收得紧 → 看主方位
  if (sx + sy < 0.18) {
    if (cx > 0.4 && cy > 0.4)   return "passion-leader";  // Q1
    if (cx < -0.4 && cy > 0.4)  return "hidden-spark";    // Q4
    if (cx > 0.4 && cy < -0.4)  return "comfort-expert";  // Q2
    if (cx < -0.4 && cy < -0.4) return "observer";        // Q3
    return "middle-ground";
  }

  // 中等散布 → 看 y 轴主导
  if (cy > 0.4)  return "passion-neutral";
  if (cy < -0.4) return "settling-down";
  return "middle-ground";
}
```

### 6.2 8 类 type_definitions 种子数据

| id | label_zh | tagline_zh | color_pri | color_sec |
|---|---|---|---|---|
| `passion-leader` | 热情主导 | 你是被点燃的人 | `#f59e0b` | `#dc2626` |
| `hidden-spark` | 隐藏火种 | 光还没亮起,但燃料已就位 | `#1e1b4b` | `#f97316` |
| `comfort-expert` | 舒适专家 | 扎根的人有最深的视野 | `#166534` | `#84cc16` |
| `observer` | 观察者 | 你看世界,世界也在被你看见 | `#1e3a8a` | `#475569` |
| `multi-explorer` | 多面探索 | 边界对你不是问题 | `#ec4899` | `#8b5cf6` |
| `middle-ground` | 中间地带 | 克制是一种被低估的力量 | `#64748b` | `#94a3b8` |
| `passion-neutral` | 热情中立 | 温度刚好,不烫手 | `#9f1239` | `#fb923c` |
| `settling-down` | 沉淀蓄势 | 地下的根比地上的枝长 | `#312e81` | `#fbbf24` |

⚠️ **8 类命名是占位草案**,v1 上线前需要文案精修。

### 6.3 阈值校准

- v1 上线前: 写 Python 脚本生成 1000 个合成样本(假设各类人群分布)+ 20-50 真人样本,跑 classify(),调阈值到"8 类大致都有人,无任何类占 > 35%"
- 上线后每周看分布,持续微调

---

## 7. LLM 集成

### 7.1 提交 → 流式生成时序

```
用户点提交
  → POST /api/quiz/submit
    → INSERT row (status=pending)
    → classify() → type_id
    → UPDATE type_id
  ← {id, type_id}
跳 /r/[id]
  → 类型卡立即显示(从 type_id 查 type_definitions)
  → GET /api/quiz/[id]/report (SSE)
    → UPDATE status=streaming
    → Anthropic SDK stream
    → 边收边吐 SSE chunks
    ← UPDATE report_text + status=completed
    ← data: [DONE]
  → 长报告完整显示
  → 下载图片按钮亮起
```

### 7.2 模型选择

**Anthropic Claude Sonnet 4.6** — 单元报告写作的最佳性价比。

| 维度 | 评估 |
|---|---|
| 质量 | 创意写作能力强,中文细腻 |
| 速度 | 200-300 字 ~5-10s 流完 |
| 成本 | ~$0.01/单(input ~600 tok + output ~400 tok @ $3/$15 per M) |
| 接口 | 原生 streaming |

不选:
- Opus 4.7 — 4× 成本,价值场景是复杂推理,创意写作不需要
- Haiku 4.5 — 单价低但深度撑不起"商业产品"水准

**v1.5 优化路径**: 数据稳定后蒸馏到 Haiku,或按用户付费分级。

### 7.3 Prompt 结构

**SYSTEM**:
```
你是有心理学背景的认知顾问,擅长基于人对活动的态度推测内在画像。

任务: 根据用户在"热情-自信地图"上的活动摆放,生成一段 200-300 字的个人画像报告。

要求:
- 直接称"你",不用"该用户"
- 引用具体活动名来佐证判断,避免泛泛而谈
- 结构: 优势(1段) / 盲区(1段) / 建议(1段),不显式写小标题
- 语调温暖但有力量,避免鸡汤
- 自然引用一个心理学概念(心流 / 成长型心智 / 自我效能 / 内在动机...),来源可参考《心理学与生活》等经典,点到即止
- 不要说"你是XX型"(类型卡已经做了),不要重复"高热情低自信"等生硬表述
```

**USER**(模板):
```
活动地图 (热情/自信轴各从 -1 到 +1, 0 为中性):
- 写作    (热情: +0.65, 自信: +0.30, 调整 1 次)
- 写代码  (热情: +0.85, 自信: +0.40, 调整 0 次)
- 演讲    (热情: +0.70, 自信: -0.55, 调整 3 次) ← 反复犹豫
- ...
未放: 舞蹈, 旅游, 阅读, ...

总用时 38s · 第一次落子前犹豫 6s

输出约束:
- 用"几乎触顶/靠上/略上/居中/略下/靠下/几乎触底"描述位置,不引用数值
- 数据精度有限,关注大致方位与显著反差,不做微距比较
- 反复调整 ≥ 3 次的活动可以解读为"内在矛盾"
```

### 7.4 容错状态机

```
INSERT → pending
       ↓ classify done
streaming
       ↓ all chunks done           ↓ timeout 50s / 5xx / rate-limit
   completed                    failed
                                    ↓ user retry button
                                streaming → ...
```

| 场景 | 处理 |
|---|---|
| Vercel 超时 (60s) | 50s 主动 abort,标 `failed` |
| Claude 429 | 指数退避重试 2 次,仍失败标 `failed` |
| Claude 5xx | 同上 |
| 用户网络中断 | EventSource 自动重连;后端幂等(completed 直接返缓存,streaming 重新调 LLM 简化处理) |
| 用户关 tab 后重开 | `/r/[id]` 看 status,streaming 重连,completed 直接渲染 |

### 7.5 成本预估

| 量级 | 每天单数 | 月成本 (LLM) |
|---|---|---|
| 验证期 | 100 | ~$30 |
| 早期成功 | 1,000 | ~$300 |
| 爆款 | 10,000 | ~$3,000 |

阈值 $500/月 = 该考虑加广告 / 付费墙的临界点。

---

## 8. 类型卡 PNG 生成 + 下载分享

### 8.1 两种尺寸

| 尺寸 | 用途 | 优先级 |
|---|---|---|
| 1080×1080 方形 | 微信好友 / 朋友圈 / 小红书 | v1 必做 |
| 1200×630 宽形 | Twitter/X / Facebook / LinkedIn OG | v1 必做(免费送) |

### 8.2 渲染管线

```
GET /api/quiz/[id]/image?size=square|wide
   ↓ 1. 查 Vercel KV (key = `${type_id}:${size}`)
       命中 → 返 PNG
       miss ↓
   ↓ 2. 查 db: type_id → type_definition
   ↓ 3. 生成 QR 码 (qrcode 包 toDataURL,固定指向 https://selfknow.site/quiz)
   ↓ 4. @vercel/og 渲染 React JSX → PNG (加载思源黑体子集字体)
   ↓ 5. 写 KV (TTL 30 天,实际几乎永久缓存因为 type 固定)
   ↓ 返 PNG (Content-Type: image/png)
```

### 8.3 关键技术点

- **`@vercel/og`**: React JSX 模板,Satori 渲染,不写 Canvas
- **中文字体**: 思源黑体 (Noto Sans SC) 子集化到 ~30KB,build 时跑 fonttools 脚本生成 woff
- **QR 内容**: 固定指向 `https://selfknow.site/quiz`(通用入口,不个性化)
- **缓存策略**: key = `${type_id}:${size}`,**全站 16 张图共享**,KV 一杯水成本

### 8.4 下载 UX

结果页类型卡下方:
```
[下载方形(微信)]  [下载宽形(Twitter)]
```

**iOS / 微信浏览器特殊处理**(必做):
- UA 检测: `MicroMessenger` + iOS/Android
- 命中 → 弹全屏 modal: "长按图片 → 保存到相册"
- 桌面 → 直接 `<a download>` 触发下载,同时 modal 提示"也可以右键另存"

---

## 9. 错误处理

| 失败点 | 用户看到 | 关键设计 |
|---|---|---|
| 提交时 db 写失败 | "保存失败,数据已暂存" + 重提交按钮 | localStorage 缓存 placements,不让用户白做 |
| LLM 报告失败 | "画像还没出炉" + 重新生成按钮 | 类型卡照常显示,只长报告失败 |
| IP 限流 (>5/小时) | "认识自己急不来" + 分享 CTA | 把限流转成软推广 |
| /r/[id] 404 | "这个画像不见了" + 新做 quiz 链接 | 链接被改 / 数据清都走这里 |

**核心原则**: 错误信息温和、有出口、不甩锅。

---

## 10. 隐私 / 数据生命周期

| 数据 | 存多久 | 备注 |
|---|---|---|
| placements | 永久 | 匿名,无 PII |
| type_id | 永久 | 匿名 |
| report_text | 90 天后归档 | 报告大,长期占空间 |
| ip_hash | 30 天滑动 | 仅限流用 |
| user_agent | 30 天 | 错误诊断 |
| share_events | 永久 | 聚合分析 |
| cookie | 90 天 | 用户可清 |

**`/privacy` 页文案要点**:
1. 不存能找到你本人的任何信息(没邮箱/手机/姓名)
2. 拖拽是匿名 + 永久,用于聚合改进
3. 想删除画像 → 邮件联系 (v2 自助)

---

## 11. 限流

- **同 IP**: 1 小时 5 次,1 天 20 次
- **全站**: LLM 月预算 $50(可调),触顶熔断 → "系统维护中"页 + 邮件订阅入口
- **实现**: `@upstash/ratelimit` + Vercel KV,~10 行配置

---

## 12. 监控

### 12.1 产品指标(自建,SQL 直查)

埋点写入路径: 前端在关键事件(下载图、扫码进站、点重玩按钮、报告查看)触发 `POST /api/track`,后端写一行到 `share_events`。referrer 从 `document.referrer` 或 URL `?ref=` 解析。

- 每天/每周完成数
- 8 类分桶分布(看是否需要调阈值)
- 下载分享图比例 = 完成 → 下载
- QR 扫码引入比例 = 下载 → 后续新 session(referrer 解析)
- **病毒系数 K** = 每用户带来的新用户数
- 报告生成时长 P50/P95
- 报告失败率

### 12.2 技术指标(第三方)

- Vercel Analytics — 流量 / 来源 / 设备
- Sentry — 异常追踪 + Source Map
- Vercel Function 日志 — LLM 失败、慢查询
- Neon 慢查询 — DB 性能

### 12.3 告警阈值

- K < 0.5 一周 → 传播失败,需优化分享 UX
- 任一类占 > 35% → 算法偏,需调阈值
- 报告失败率 > 5% → LLM/网络问题
- LLM 月成本 > $40 → 接近熔断阈值

---

## 13. 测试策略

| 层 | 工具 | 重点 |
|---|---|---|
| 单元 | vitest | `classify()` 算法 — 用 200 个预生成样本回归 |
| 集成 | vitest + msw | `/api/quiz/submit` 端到端,mock LLM |
| E2E | Playwright | 拖拽交互,跑 desktop + mobile viewport |
| LLM | "健全性测试" | 长度区间 / 关键词出现 / 禁词不出现,不做严格断言 |

---

## 14. v1 上线前 Checklist (开放任务)

### 14.1 内容侧

- [ ] 8 类类型名 + 标语**精修**(占位草案 → 文案推敲)
- [ ] 12-20 个固定活动方块设计(名字 + 图标 + category)
- [ ] 阈值校准: 写合成样本脚本 + 跑分桶分布
- [ ] `/privacy` 文案
- [ ] 错误页 / 404 页 / 限流页文案
- [ ] iOS 微信 long-press modal 文案
- [ ] LLM prompt 微调 + sample 输出验收

### 14.2 设计侧

- [ ] 8 类类型卡视觉精修(配色已定,版式细节待落)
- [ ] 首页 / `/quiz` / `/r/[id]` Figma 高保真稿
- [ ] 字体子集化 build 脚本

### 14.3 运营侧

- [ ] 域名 `selfknow.site` 注册
- [ ] Vercel / Neon / Anthropic / Sentry / Upstash 账号开通
- [ ] LLM 月预算配置 + 熔断告警

---

## 15. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| K 系数不达 0.5 | 传播假设失败 | 上线即开始迭代分享 UX,A/B 标语 / 类型卡版式 |
| LLM 输出质量不稳 | 用户信任受损 | sample 验收 + 关键词审核 + 失败重试 |
| 阈值调不到均匀 | 某类无人或某类过多 | 上线前合成样本调,上线后真实数据周迭代 |
| iOS 微信下载体验 | 砍掉 25% iPhone 微信用户传播 | v1 必做 long-press modal |
| 中文字体加载慢 | 类型卡渲染超时 | 字体子集化到 30KB 内 |
| 心理学专业度被质疑 | 商业可信度受损 | LLM 引用经典著作 + 后期请心理学顾问审 |

---

## 16. 设计稿到这里结束

**下一步**: 此 spec 通过用户审阅后,调用 `superpowers:writing-plans` 输出实现计划。

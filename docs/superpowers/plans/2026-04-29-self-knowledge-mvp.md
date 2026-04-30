# 认识自我 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 selfknow.site 单题爆款 MVP — 一道热情-自信四象限拖拽 quiz,生成 8 类固定类型卡(可下载分享)+ LLM 200-300 字个性化长报告(SSE 流式),匿名持久化,iOS/微信下载兼容。

**Architecture:** Next.js 14 App Router 全栈一体,Vercel Functions 跑 API + LLM 流,Neon Postgres 存匿名 quiz 数据,@vercel/og 渲染类型卡 PNG,@dnd-kit 处理拖拽,Vercel KV 缓存 16 张固定类型卡图。

**Tech Stack:** Next.js 14 / TypeScript / Tailwind CSS / Drizzle ORM / Neon Postgres / Anthropic Claude SDK (Sonnet 4.6) / @vercel/og / @dnd-kit/core / qrcode / @upstash/ratelimit / nanoid / vitest / Playwright

**Spec reference:** `docs/superpowers/specs/2026-04-29-self-knowledge-mvp-design.md`

**Engineer profile note:** 实现者熟悉 C++/Lua/Python 游戏引擎开发,web 全栈是新主战场。每个任务的代码块给完整文件,命令给绝对路径,约定俗成的 web 模式(npm 命令、env 变量、git 流程)有简短说明。

---

## File Structure

执行前会创建以下结构。每个文件**单一职责**,大文件后面拆。

```
D:\selfknow\
├── docs/superpowers/
│   ├── specs/2026-04-29-self-knowledge-mvp-design.md   (已存在)
│   └── plans/2026-04-29-self-knowledge-mvp.md          (本文档)
├── src/
│   ├── app/                                       # Next.js App Router
│   │   ├── layout.tsx                             # 全站 layout
│   │   ├── page.tsx                               # /  首页
│   │   ├── quiz/page.tsx                          # /quiz  拖拽答题
│   │   ├── r/[id]/page.tsx                        # /r/[id]  结果页
│   │   ├── privacy/page.tsx                       # /privacy
│   │   ├── error.tsx                              # 全局错误兜底
│   │   ├── not-found.tsx                          # 404
│   │   └── api/
│   │       ├── quiz/
│   │       │   ├── submit/route.ts                # POST 提交
│   │       │   └── [id]/
│   │       │       ├── report/route.ts            # GET SSE 流报告
│   │       │       └── image/route.tsx            # GET PNG
│   │       └── track/route.ts                     # POST 埋点
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuadrantBoard.tsx                  # 四象限主区
│   │   │   ├── ActivityPool.tsx                   # 活动池
│   │   │   ├── ActivityBlock.tsx                  # 单个方块
│   │   │   └── SubmitButton.tsx                   # 提交按钮 + 校验
│   │   └── result/
│   │       ├── TypeCardLive.tsx                   # 结果页类型卡(浏览器渲染)
│   │       ├── TypeCardStatic.tsx                 # PNG 渲染用类型卡(server-only)
│   │       ├── StreamingReport.tsx                # SSE 流式报告渲染
│   │       └── ShareModal.tsx                     # 下载 modal + iOS 长按提示
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts                          # Drizzle schema
│   │   │   ├── client.ts                          # Neon 连接
│   │   │   └── seed.ts                            # 灌 seed 数据
│   │   ├── classify.ts                            # 8 类分桶算法
│   │   ├── llm.ts                                 # Anthropic 客户端 + prompt
│   │   ├── ratelimit.ts                           # Upstash 限流配置
│   │   ├── ip-hash.ts                             # sha256(ip + salt)
│   │   ├── activities.ts                          # 16 个固定活动 (TS const)
│   │   ├── types-data.ts                          # 8 个类型定义 (TS const)
│   │   └── ua.ts                                  # WeChat / iOS 检测
│   └── styles/globals.css
├── public/
│   ├── fonts/noto-sans-sc-subset.woff             # 子集化思源黑体
│   ├── icons/                                     # 16 个活动 SVG 图标
│   └── favicon.ico
├── scripts/
│   ├── subset-font.py                             # 字体子集化
│   ├── generate-samples.ts                        # 1000 个合成 placement 样本
│   └── calibrate.ts                               # 跑 classify 看分布
├── tests/
│   ├── lib/
│   │   ├── classify.test.ts
│   │   └── ip-hash.test.ts
│   ├── api/
│   │   └── submit.test.ts
│   └── e2e/quiz-flow.spec.ts                      # Playwright
├── drizzle/                                       # 自动生成的迁移文件
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
├── package.json
├── .env.local.example
├── .env.local                                     # gitignore (本地)
├── .gitignore
└── README.md
```

---

## Phase 1 · Foundation

### Task 1: 项目初始化 + Git

**Files:**
- Create: `D:\selfknow\package.json` (via npm command)
- Create: `D:\selfknow\.gitignore`
- Create: `D:\selfknow\README.md`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd D:/selfknow
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir=false --eslint --no-import-alias
```

(回车采用默认。`.` 表示当前目录,`--src-dir=false` 我们手动建 src,`--no-import-alias` 用 `@/` 默认。)

如果提示目录非空,允许覆盖(因为有 docs 文件夹)。

- [ ] **Step 2: 验证基础项目能跑**

```bash
cd D:/selfknow
npm run dev
```

打开 http://localhost:3000,应该看到 Next.js 默认欢迎页。Ctrl+C 停掉。

- [ ] **Step 3: 初始化 git**

```bash
cd D:/selfknow
git init
git add .
git commit -m "feat: initial Next.js 14 + TS + Tailwind project"
```

- [ ] **Step 4: 补 .gitignore**

确认 `.gitignore` 包含以下行(create-next-app 默认会生成大部分,缺什么补什么):

```
# Already there from create-next-app:
node_modules/
.next/
.env*.local
.vercel
*.tsbuildinfo

# Add manually:
.superpowers/
```

`.superpowers/` 是 brainstorming 工具的运行时缓存,不入仓。

- [ ] **Step 5: 提交 .gitignore**

```bash
cd D:/selfknow
git add .gitignore
git commit -m "chore: ignore .superpowers cache"
```

---

### Task 2: 安装核心依赖

**Files:** modify `D:\selfknow\package.json` (via npm install)

- [ ] **Step 1: 安装运行时依赖**

```bash
cd D:/selfknow
npm install drizzle-orm @neondatabase/serverless @anthropic-ai/sdk @vercel/og @dnd-kit/core @dnd-kit/modifiers qrcode nanoid @upstash/ratelimit @upstash/redis
```

- [ ] **Step 2: 安装开发依赖**

```bash
cd D:/selfknow
npm install -D drizzle-kit vitest @vitest/ui @types/qrcode @playwright/test tsx dotenv
```

- [ ] **Step 3: 验证安装无错**

```bash
cd D:/selfknow
npm ls drizzle-orm @anthropic-ai/sdk @dnd-kit/core
```

预期: 三个包都在,无 UNMET DEPENDENCY 警告。

- [ ] **Step 4: 提交**

```bash
cd D:/selfknow
git add package.json package-lock.json
git commit -m "feat: install runtime + dev dependencies"
```

---

### Task 3: 配置 vitest + Playwright + Drizzle

**Files:**
- Create: `D:\selfknow\vitest.config.ts`
- Create: `D:\selfknow\playwright.config.ts`
- Create: `D:\selfknow\drizzle.config.ts`
- Modify: `D:\selfknow\package.json` (scripts)

- [ ] **Step 1: 写 vitest 配置**

文件: `D:\selfknow\vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 2: 写 Playwright 配置**

文件: `D:\selfknow\playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: 写 Drizzle 配置**

文件: `D:\selfknow\drizzle.config.ts`

```typescript
import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

- [ ] **Step 4: 在 package.json 加 scripts**

打开 `D:\selfknow\package.json`,把 `"scripts"` 字段替换成:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:seed": "tsx src/lib/db/seed.ts",
  "calibrate": "tsx scripts/calibrate.ts"
},
```

- [ ] **Step 5: Playwright 浏览器**

```bash
cd D:/selfknow
npx playwright install chromium webkit
```

(安装 ~150MB,需要几分钟。)

- [ ] **Step 6: 提交**

```bash
cd D:/selfknow
git add vitest.config.ts playwright.config.ts drizzle.config.ts package.json
git commit -m "chore: configure vitest, playwright, drizzle"
```

---

### Task 4: 环境变量模板

**Files:**
- Create: `D:\selfknow\.env.local.example`
- Create: `D:\selfknow\.env.local`

- [ ] **Step 1: 写 .env.local.example**

文件: `D:\selfknow\.env.local.example`

```bash
# Neon Postgres - 从 https://console.neon.tech 拿
DATABASE_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"

# Anthropic - 从 https://console.anthropic.com 拿
ANTHROPIC_API_KEY="sk-ant-..."

# Upstash Redis (限流) - 从 https://console.upstash.com 拿
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# IP 哈希盐 - 随便起,但部署后不要改 (改了 = 限流计数全清)
IP_HASH_SALT="some-random-string-min-32-chars-long-please"

# 站点 URL (类型卡 QR 码用)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 2: 复制成 .env.local 并填占位**

```bash
cd D:/selfknow
cp .env.local.example .env.local
```

打开 `.env.local`,填假值或真值:
- 真要跑 = 去 Neon/Anthropic/Upstash 注册账号拿 key
- 暂时占位 = 用 `IP_HASH_SALT="dev-only-salt-do-not-use-in-prod-12345"`,其余 key 暂留 placeholder

⚠️ `.env.local` 已被 .gitignore,不会被提交。

- [ ] **Step 3: 提交模板**

```bash
cd D:/selfknow
git add .env.local.example
git commit -m "feat: add env template"
```

---

## Phase 2 · Database & Seed Data

### Task 5: Drizzle Schema

**Files:**
- Create: `D:\selfknow\src\lib\db\schema.ts`

- [ ] **Step 1: 写 schema**

文件: `D:\selfknow\src\lib\db\schema.ts`

```typescript
import { pgTable, text, jsonb, timestamp, bigserial, index } from 'drizzle-orm/pg-core';

// SEED · 静态
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  labelZh: text('label_zh').notNull(),
  iconPath: text('icon_path'),
  category: text('category'),
});

export const typeDefinitions = pgTable('type_definitions', {
  id: text('id').primaryKey(),
  labelZh: text('label_zh').notNull(),
  taglineZh: text('tagline_zh').notNull(),
  colorPri: text('color_pri').notNull(),
  colorSec: text('color_sec').notNull(),
  emoji: text('emoji'),
});

// CORE · 业务
export type Placement = {
  activity_id: string;
  passion: number;       // [-1, +1]
  confidence: number;    // [-1, +1]
  first_placed_at_ms: number;
  final_at_ms: number;
  move_count: number;
};

export type QuizMeta = {
  duration_ms: number;
  first_action_ms: number;
  viewport: { w: number; h: number };
};

export const quizSessions = pgTable('quiz_sessions', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  placements: jsonb('placements').$type<Placement[]>().notNull(),
  typeId: text('type_id').notNull().references(() => typeDefinitions.id),
  reportText: text('report_text'),
  reportStatus: text('report_status').notNull().default('pending'),  // 'pending' | 'streaming' | 'completed' | 'failed'
  ipHash: text('ip_hash').notNull(),
  userAgent: text('user_agent'),
  quizMeta: jsonb('quiz_meta').$type<QuizMeta>(),
}, (table) => ({
  createdIdx: index('idx_sessions_created').on(table.createdAt),
  typeIdx: index('idx_sessions_type').on(table.typeId),
}));

// ANALYTICS · 埋点
export const shareEvents = pgTable('share_events', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  sessionId: text('session_id').notNull().references(() => quizSessions.id),
  eventType: text('event_type').notNull(),  // 'image_downloaded' | 'qr_scanned' | 'replay_clicked' | 'report_viewed'
  referrer: text('referrer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index('idx_events_session').on(table.sessionId, table.createdAt),
  typeIdx: index('idx_events_type').on(table.eventType, table.createdAt),
}));

export type QuizSession = typeof quizSessions.$inferSelect;
export type NewQuizSession = typeof quizSessions.$inferInsert;
export type TypeDefinition = typeof typeDefinitions.$inferSelect;
export type Activity = typeof activities.$inferSelect;
```

- [ ] **Step 2: 写 db 客户端**

文件: `D:\selfknow\src\lib\db\client.ts`

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: 生成迁移文件**

```bash
cd D:/selfknow
npm run db:generate
```

预期: `drizzle/` 下出现 `0000_xxx.sql` 等文件。

- [ ] **Step 4: 提交 schema + 迁移**

```bash
cd D:/selfknow
git add src/lib/db/ drizzle/
git commit -m "feat: drizzle schema for sessions, type_defs, activities, share_events"
```

---

### Task 6: 静态数据 (8 类型 + 16 活动)

**Files:**
- Create: `D:\selfknow\src\lib\types-data.ts`
- Create: `D:\selfknow\src\lib\activities.ts`

- [ ] **Step 1: 写 8 类型定义**

文件: `D:\selfknow\src\lib\types-data.ts`

```typescript
export type TypeId =
  | 'passion-leader'
  | 'hidden-spark'
  | 'comfort-expert'
  | 'observer'
  | 'multi-explorer'
  | 'middle-ground'
  | 'passion-neutral'
  | 'settling-down';

export type TypeDef = {
  id: TypeId;
  labelZh: string;
  taglineZh: string;
  colorPri: string;
  colorSec: string;
  emoji: string;
};

export const TYPE_DEFINITIONS: TypeDef[] = [
  { id: 'passion-leader',   labelZh: '热情主导', taglineZh: '你是被点燃的人',         colorPri: '#f59e0b', colorSec: '#dc2626', emoji: '🔥' },
  { id: 'hidden-spark',     labelZh: '隐藏火种', taglineZh: '光还没亮起,但燃料已就位', colorPri: '#1e1b4b', colorSec: '#f97316', emoji: '✨' },
  { id: 'comfort-expert',   labelZh: '舒适专家', taglineZh: '扎根的人有最深的视野',    colorPri: '#166534', colorSec: '#84cc16', emoji: '🌳' },
  { id: 'observer',         labelZh: '观察者',   taglineZh: '你看世界,世界也在被你看见', colorPri: '#1e3a8a', colorSec: '#475569', emoji: '👁️' },
  { id: 'multi-explorer',   labelZh: '多面探索', taglineZh: '边界对你不是问题',        colorPri: '#ec4899', colorSec: '#8b5cf6', emoji: '🌈' },
  { id: 'middle-ground',    labelZh: '中间地带', taglineZh: '克制是一种被低估的力量',  colorPri: '#64748b', colorSec: '#94a3b8', emoji: '⚖️' },
  { id: 'passion-neutral',  labelZh: '热情中立', taglineZh: '温度刚好,不烫手',         colorPri: '#9f1239', colorSec: '#fb923c', emoji: '🌅' },
  { id: 'settling-down',    labelZh: '沉淀蓄势', taglineZh: '地下的根比地上的枝长',    colorPri: '#312e81', colorSec: '#fbbf24', emoji: '🌌' },
];

export const TYPE_BY_ID: Record<TypeId, TypeDef> = Object.fromEntries(
  TYPE_DEFINITIONS.map(t => [t.id, t])
) as Record<TypeId, TypeDef>;
```

- [ ] **Step 2: 写 16 个活动**

文件: `D:\selfknow\src\lib\activities.ts`

```typescript
export type ActivityCategory = 'creative' | 'social' | 'physical' | 'introvert';

export type ActivityDef = {
  id: string;
  labelZh: string;
  iconPath: string;       // /icons/xxx.svg
  category: ActivityCategory;
};

export const ACTIVITIES: ActivityDef[] = [
  { id: 'writing',    labelZh: '写作',   iconPath: '/icons/writing.svg',    category: 'creative' },
  { id: 'coding',     labelZh: '写代码', iconPath: '/icons/coding.svg',     category: 'creative' },
  { id: 'painting',   labelZh: '画画',   iconPath: '/icons/painting.svg',   category: 'creative' },
  { id: 'music',      labelZh: '音乐',   iconPath: '/icons/music.svg',      category: 'creative' },
  { id: 'photography',labelZh: '摄影',   iconPath: '/icons/photography.svg',category: 'creative' },
  { id: 'dance',      labelZh: '舞蹈',   iconPath: '/icons/dance.svg',      category: 'physical' },
  { id: 'sports',     labelZh: '运动',   iconPath: '/icons/sports.svg',     category: 'physical' },
  { id: 'cooking',    labelZh: '烹饪',   iconPath: '/icons/cooking.svg',    category: 'physical' },
  { id: 'travel',     labelZh: '旅游',   iconPath: '/icons/travel.svg',     category: 'physical' },
  { id: 'speech',     labelZh: '演讲',   iconPath: '/icons/speech.svg',     category: 'social' },
  { id: 'debate',     labelZh: '辩论',   iconPath: '/icons/debate.svg',     category: 'social' },
  { id: 'party',      labelZh: '聚会',   iconPath: '/icons/party.svg',      category: 'social' },
  { id: 'reading',    labelZh: '阅读',   iconPath: '/icons/reading.svg',    category: 'introvert' },
  { id: 'study',      labelZh: '学习',   iconPath: '/icons/study.svg',      category: 'introvert' },
  { id: 'solitude',   labelZh: '独处',   iconPath: '/icons/solitude.svg',   category: 'introvert' },
  { id: 'gaming',     labelZh: '游戏',   iconPath: '/icons/gaming.svg',     category: 'introvert' },
];

export const ACTIVITY_BY_ID: Record<string, ActivityDef> = Object.fromEntries(
  ACTIVITIES.map(a => [a.id, a])
);
```

⚠️ `/public/icons/*.svg` 还没建,后面 Task 19 处理(暂时图标缺失页面也能跑,只是显示空白)。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/lib/types-data.ts src/lib/activities.ts
git commit -m "feat: 8 type definitions + 16 activity blocks (placeholder copy)"
```

---

### Task 7: Seed 脚本

**Files:**
- Create: `D:\selfknow\src\lib\db\seed.ts`

- [ ] **Step 1: 写 seed 脚本**

文件: `D:\selfknow\src\lib\db\seed.ts`

```typescript
import 'dotenv/config';
import { db } from './client';
import { activities, typeDefinitions } from './schema';
import { TYPE_DEFINITIONS } from '../types-data';
import { ACTIVITIES } from '../activities';

async function seed() {
  console.log('Seeding type_definitions...');
  // upsert: insert or update
  for (const t of TYPE_DEFINITIONS) {
    await db
      .insert(typeDefinitions)
      .values({
        id: t.id,
        labelZh: t.labelZh,
        taglineZh: t.taglineZh,
        colorPri: t.colorPri,
        colorSec: t.colorSec,
        emoji: t.emoji,
      })
      .onConflictDoUpdate({
        target: typeDefinitions.id,
        set: {
          labelZh: t.labelZh,
          taglineZh: t.taglineZh,
          colorPri: t.colorPri,
          colorSec: t.colorSec,
          emoji: t.emoji,
        },
      });
  }
  console.log(`  ✓ ${TYPE_DEFINITIONS.length} types seeded`);

  console.log('Seeding activities...');
  for (const a of ACTIVITIES) {
    await db
      .insert(activities)
      .values({
        id: a.id,
        labelZh: a.labelZh,
        iconPath: a.iconPath,
        category: a.category,
      })
      .onConflictDoUpdate({
        target: activities.id,
        set: {
          labelZh: a.labelZh,
          iconPath: a.iconPath,
          category: a.category,
        },
      });
  }
  console.log(`  ✓ ${ACTIVITIES.length} activities seeded`);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: 跑迁移 + seed (需要真实 Neon URL)**

```bash
cd D:/selfknow
npm run db:push     # 把 schema 推到 Neon (无需迁移文件,直接 sync)
npm run db:seed
```

预期输出:
```
Seeding type_definitions...
  ✓ 8 types seeded
Seeding activities...
  ✓ 16 activities seeded
Seed complete.
```

⚠️ 如果 Neon 没注册,跳过这步;后面 Task 12 写 API 时会跑通。或者用本地 Postgres docker 临时跑测试。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/lib/db/seed.ts
git commit -m "feat: seed script for types + activities (idempotent upsert)"
```

---

## Phase 3 · Classification Algorithm (TDD)

### Task 8: classify() 算法 + 单元测试

**Files:**
- Create: `D:\selfknow\src\lib\classify.ts`
- Create: `D:\selfknow\tests\lib\classify.test.ts`

- [ ] **Step 1: 写失败测试**

文件: `D:\selfknow\tests\lib\classify.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { classify } from '@/lib/classify';
import type { Placement } from '@/lib/db/schema';

function p(activity_id: string, passion: number, confidence: number): Placement {
  return { activity_id, passion, confidence, first_placed_at_ms: 0, final_at_ms: 0, move_count: 0 };
}

describe('classify', () => {
  it('returns multi-explorer when spread is large', () => {
    const placements: Placement[] = [
      p('a', 0.9, 0.9),
      p('b', -0.9, -0.9),
      p('c', 0.9, -0.9),
      p('d', -0.9, 0.9),
    ];
    expect(classify(placements)).toBe('multi-explorer');
  });

  it('returns passion-leader when tightly clustered top-right', () => {
    const placements: Placement[] = [
      p('a', 0.7, 0.7),
      p('b', 0.75, 0.65),
      p('c', 0.8, 0.7),
      p('d', 0.72, 0.68),
    ];
    expect(classify(placements)).toBe('passion-leader');
  });

  it('returns hidden-spark when tightly clustered top-left', () => {
    const placements: Placement[] = [
      p('a', 0.7, -0.7),
      p('b', 0.65, -0.75),
      p('c', 0.7, -0.6),
      p('d', 0.68, -0.7),
    ];
    expect(classify(placements)).toBe('hidden-spark');
  });

  it('returns observer when tightly clustered bottom-left', () => {
    const placements: Placement[] = [
      p('a', -0.7, -0.7),
      p('b', -0.75, -0.65),
      p('c', -0.7, -0.6),
      p('d', -0.68, -0.7),
    ];
    expect(classify(placements)).toBe('observer');
  });

  it('returns comfort-expert when tightly clustered bottom-right', () => {
    const placements: Placement[] = [
      p('a', -0.7, 0.7),
      p('b', -0.75, 0.65),
      p('c', -0.7, 0.6),
      p('d', -0.68, 0.7),
    ];
    expect(classify(placements)).toBe('comfort-expert');
  });

  it('returns middle-ground for centered tight cluster', () => {
    const placements: Placement[] = [
      p('a', 0.05, 0.05),
      p('b', -0.05, 0.05),
      p('c', 0.05, -0.05),
      p('d', 0.0, 0.0),
    ];
    expect(classify(placements)).toBe('middle-ground');
  });

  it('returns passion-neutral for moderate-spread top-leaning', () => {
    const placements: Placement[] = [
      p('a', 0.5, 0.2),
      p('b', 0.6, -0.2),
      p('c', 0.55, 0.0),
      p('d', 0.5, 0.3),
    ];
    expect(classify(placements)).toBe('passion-neutral');
  });

  it('returns settling-down for moderate-spread bottom-leaning', () => {
    const placements: Placement[] = [
      p('a', -0.5, 0.2),
      p('b', -0.6, -0.2),
      p('c', -0.55, 0.0),
      p('d', -0.5, 0.3),
    ];
    expect(classify(placements)).toBe('settling-down');
  });
});
```

- [ ] **Step 2: 跑测试,确认全失败**

```bash
cd D:/selfknow
npm test -- classify
```

预期: 8 个测试全 FAIL,错误是 "classify is not defined" 或类似。

- [ ] **Step 3: 实现 classify()**

文件: `D:\selfknow\src\lib\classify.ts`

```typescript
import type { Placement } from './db/schema';
import type { TypeId } from './types-data';

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

export function classify(placements: Placement[]): TypeId {
  if (placements.length === 0) return 'middle-ground';

  const passions = placements.map(p => p.passion);
  const confidences = placements.map(p => p.confidence);
  const cy = mean(passions);
  const cx = mean(confidences);
  const sx = stddev(confidences);
  const sy = stddev(passions);

  // 散得开 → 多面探索
  if (sx + sy > 0.55) return 'multi-explorer';

  // 收得紧 → 看主方位
  if (sx + sy < 0.18) {
    if (cx > 0.4 && cy > 0.4)   return 'passion-leader';
    if (cx < -0.4 && cy > 0.4)  return 'hidden-spark';
    if (cx > 0.4 && cy < -0.4)  return 'comfort-expert';
    if (cx < -0.4 && cy < -0.4) return 'observer';
    return 'middle-ground';
  }

  // 中等散布 → 看 y 主导
  if (cy > 0.4)  return 'passion-neutral';
  if (cy < -0.4) return 'settling-down';
  return 'middle-ground';
}
```

- [ ] **Step 4: 跑测试,确认全通过**

```bash
cd D:/selfknow
npm test -- classify
```

预期: 8 个测试全 PASS。

- [ ] **Step 5: 提交**

```bash
cd D:/selfknow
git add src/lib/classify.ts tests/lib/classify.test.ts
git commit -m "feat: classify() algorithm + 8 type unit tests"
```

---

### Task 9: 阈值校准脚本

**Files:**
- Create: `D:\selfknow\scripts\generate-samples.ts`
- Create: `D:\selfknow\scripts\calibrate.ts`

- [ ] **Step 1: 写样本生成器**

文件: `D:\selfknow\scripts\generate-samples.ts`

```typescript
import type { Placement } from '../src/lib/db/schema';

// 高斯采样 (Box-Muller)
function gauss(mean: number, sd: number): number {
  const u1 = Math.random(), u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(-1, Math.min(1, mean + sd * z));
}

type ProfileShape = {
  name: string;
  weight: number;        // 出现概率权重
  mean: { passion: number; confidence: number };
  spread: number;
};

const PROFILES: ProfileShape[] = [
  { name: 'eager-confident',   weight: 15, mean: { passion: 0.6,  confidence: 0.5 },  spread: 0.15 },
  { name: 'eager-doubtful',    weight: 15, mean: { passion: 0.6,  confidence: -0.5 }, spread: 0.15 },
  { name: 'cool-expert',       weight: 10, mean: { passion: -0.5, confidence: 0.6 },  spread: 0.15 },
  { name: 'detached',          weight: 10, mean: { passion: -0.6, confidence: -0.5 }, spread: 0.15 },
  { name: 'all-over',          weight: 15, mean: { passion: 0,    confidence: 0 },    spread: 0.5 },
  { name: 'centered',          weight: 10, mean: { passion: 0,    confidence: 0 },    spread: 0.08 },
  { name: 'passion-mid',       weight: 10, mean: { passion: 0.5,  confidence: 0 },    spread: 0.25 },
  { name: 'settling',          weight: 15, mean: { passion: -0.5, confidence: 0 },    spread: 0.25 },
];

export function generateOneSample(): Placement[] {
  // 按权重选 profile
  const totalW = PROFILES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * totalW;
  let chosen = PROFILES[0];
  for (const p of PROFILES) {
    r -= p.weight;
    if (r <= 0) { chosen = p; break; }
  }
  // 生成 5-10 个 placement
  const n = 5 + Math.floor(Math.random() * 6);
  return Array.from({ length: n }, (_, i) => ({
    activity_id: `mock-${i}`,
    passion: gauss(chosen.mean.passion, chosen.spread),
    confidence: gauss(chosen.mean.confidence, chosen.spread),
    first_placed_at_ms: 0,
    final_at_ms: 0,
    move_count: 0,
  }));
}

export function generateSamples(n: number): Placement[][] {
  return Array.from({ length: n }, () => generateOneSample());
}
```

- [ ] **Step 2: 写 calibrate 脚本**

文件: `D:\selfknow\scripts\calibrate.ts`

```typescript
import { classify } from '../src/lib/classify';
import { TYPE_DEFINITIONS } from '../src/lib/types-data';
import { generateSamples } from './generate-samples';

const N = 1000;
const samples = generateSamples(N);
const counts: Record<string, number> = Object.fromEntries(
  TYPE_DEFINITIONS.map(t => [t.id, 0])
);

for (const sample of samples) {
  const typeId = classify(sample);
  counts[typeId]++;
}

console.log(`\n=== Distribution over ${N} synthetic samples ===\n`);
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [typeId, count] of sorted) {
  const pct = (count / N * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(count / N * 50));
  console.log(`  ${typeId.padEnd(20)} ${count.toString().padStart(4)} (${pct.padStart(5)}%) ${bar}`);
}

const max = Math.max(...Object.values(counts));
const min = Math.min(...Object.values(counts));
const ratio = max / Math.max(min, 1);
console.log(`\nMax/min ratio: ${ratio.toFixed(1)}`);
console.log(ratio > 8 ? '⚠️  分布不均,考虑调阈值' : '✓ 分布合理');

const empty = Object.entries(counts).filter(([_, c]) => c === 0).map(([id]) => id);
if (empty.length > 0) {
  console.log(`⚠️  空类: ${empty.join(', ')}`);
}
```

- [ ] **Step 3: 跑校准看分布**

```bash
cd D:/selfknow
npm run calibrate
```

预期: 看到 8 类分布。如果有空类或某类 > 35%,把 `src/lib/classify.ts` 里的阈值(`0.55`, `0.18`, `0.4`)调一调,重跑直到分布合理。**这一步是手工迭代**,大约 15-30 分钟。

- [ ] **Step 4: 提交**

```bash
cd D:/selfknow
git add scripts/generate-samples.ts scripts/calibrate.ts
git commit -m "feat: synthetic sample generator + threshold calibration script"
```

---

## Phase 4 · Helper Libraries

### Task 10: IP 哈希 + UA 检测

**Files:**
- Create: `D:\selfknow\src\lib\ip-hash.ts`
- Create: `D:\selfknow\src\lib\ua.ts`
- Create: `D:\selfknow\tests\lib\ip-hash.test.ts`

- [ ] **Step 1: 写 ip-hash 测试**

文件: `D:\selfknow\tests\lib\ip-hash.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { hashIp } from '@/lib/ip-hash';

describe('hashIp', () => {
  it('produces deterministic hash for same input', () => {
    const a = hashIp('1.2.3.4', 'salt-x');
    const b = hashIp('1.2.3.4', 'salt-x');
    expect(a).toBe(b);
  });

  it('produces different hash for different IP', () => {
    const a = hashIp('1.2.3.4', 'salt-x');
    const b = hashIp('5.6.7.8', 'salt-x');
    expect(a).not.toBe(b);
  });

  it('produces different hash for different salt', () => {
    const a = hashIp('1.2.3.4', 'salt-x');
    const b = hashIp('1.2.3.4', 'salt-y');
    expect(a).not.toBe(b);
  });

  it('returns 64-char hex string', () => {
    const h = hashIp('1.2.3.4', 'salt-x');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

- [ ] **Step 2: 跑确认失败**

```bash
cd D:/selfknow
npm test -- ip-hash
```

预期: 4 个 FAIL。

- [ ] **Step 3: 实现 hashIp**

文件: `D:\selfknow\src\lib\ip-hash.ts`

```typescript
import crypto from 'crypto';

export function hashIp(ip: string, salt: string): string {
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}
```

- [ ] **Step 4: 跑确认通过**

```bash
cd D:/selfknow
npm test -- ip-hash
```

预期: 4 PASS。

- [ ] **Step 5: 写 UA 检测**

文件: `D:\selfknow\src\lib\ua.ts`

```typescript
export type UAInfo = {
  isWeChat: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  // 是否需要"长按保存"提示(iOS 微信和部分 Android 微信)
  needsLongPressHint: boolean;
};

export function parseUA(ua: string): UAInfo {
  const isWeChat = /MicroMessenger/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const needsLongPressHint = isWeChat && isMobile;
  return { isWeChat, isIOS, isAndroid, isMobile, needsLongPressHint };
}
```

- [ ] **Step 6: 提交**

```bash
cd D:/selfknow
git add src/lib/ip-hash.ts src/lib/ua.ts tests/lib/ip-hash.test.ts
git commit -m "feat: ip-hash + UA detection (WeChat/iOS/mobile)"
```

---

### Task 11: 限流配置

**Files:**
- Create: `D:\selfknow\src\lib\ratelimit.ts`

- [ ] **Step 1: 写限流模块**

文件: `D:\selfknow\src\lib\ratelimit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 单例 Redis 客户端
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// 提交 quiz: 每 IP 每小时 5 次,每天 20 次 (取严)
export const submitRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:submit',
});

// 报告生成 (重新生成按钮): 每 session 每小时 3 次
export const reportRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'rl:report',
});

// 埋点: 宽松点,每 IP 每分钟 60 次
export const trackRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:track',
});
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/lib/ratelimit.ts
git commit -m "feat: upstash ratelimit (submit / report / track)"
```

---

## Phase 5 · Quiz UI

### Task 12: 首页 + layout

**Files:**
- Modify: `D:\selfknow\src\app\layout.tsx`
- Modify: `D:\selfknow\src\app\page.tsx`
- Modify: `D:\selfknow\src\app\globals.css`

- [ ] **Step 1: 改 layout**

文件: `D:\selfknow\src\app\layout.tsx` (替换全部内容)

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '认识自我 · selfknow.site',
  description: '通过摆放题目认识自己。把活动放进热情-自信地图,看见你内在的画像。',
  openGraph: {
    title: '认识自我',
    description: '通过摆放题目认识自己',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-stone-50 text-stone-900 min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: 改首页**

文件: `D:\selfknow\src\app\page.tsx` (替换全部内容)

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-6 py-20 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">认识自我</h1>
      <p className="text-lg text-stone-600 mb-12">
        把你日常的活动,拖到一张"热情-自信"地图上。
        AI 会基于你独特的摆放,生成一份只属于你的画像。
      </p>
      <Link
        href="/quiz"
        className="inline-block bg-stone-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-stone-700 transition"
      >
        开始 →
      </Link>
      <p className="mt-12 text-sm text-stone-500">
        ⏱ 3 分钟 · 🔒 完全匿名 · 📷 生成可分享的类型卡
      </p>
    </main>
  );
}
```

- [ ] **Step 3: 跑确认能起**

```bash
cd D:/selfknow
npm run dev
```

打开 http://localhost:3000,应该看到首页。点"开始"会 404(因为 /quiz 还没建,下个 Task)。

- [ ] **Step 4: 提交**

```bash
cd D:/selfknow
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: home page + global layout"
```

---

### Task 13: ActivityBlock 组件

**Files:**
- Create: `D:\selfknow\src\components\quiz\ActivityBlock.tsx`

- [ ] **Step 1: 写组件**

文件: `D:\selfknow\src\components\quiz\ActivityBlock.tsx`

```typescript
'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ActivityDef } from '@/lib/activities';

type Props = {
  activity: ActivityDef;
  placed: boolean;        // 是否已经在板上 (深色样式)
  onRemove?: () => void;  // 已放置时的 ✕ 移除回调
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
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/components/quiz/ActivityBlock.tsx
git commit -m "feat: ActivityBlock draggable component"
```

---

### Task 14: ActivityPool 组件

**Files:**
- Create: `D:\selfknow\src\components\quiz\ActivityPool.tsx`

- [ ] **Step 1: 写组件**

文件: `D:\selfknow\src\components\quiz\ActivityPool.tsx`

```typescript
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
      <div className="text-xs text-stone-500 mb-2">活动池 (拖到右侧地图)</div>
      <div className="flex flex-wrap gap-2">
        {available.map(a => (
          <ActivityBlock key={a.id} activity={a} placed={false} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/components/quiz/ActivityPool.tsx
git commit -m "feat: ActivityPool — shows available undragged blocks"
```

---

### Task 15: QuadrantBoard 组件 (drop target)

**Files:**
- Create: `D:\selfknow\src\components\quiz\QuadrantBoard.tsx`

- [ ] **Step 1: 写组件**

文件: `D:\selfknow\src\components\quiz\QuadrantBoard.tsx`

```typescript
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
          // passion/confidence ∈ [-1, +1] → 像素坐标 (上=高 passion → top 小)
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
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/components/quiz/QuadrantBoard.tsx
git commit -m "feat: QuadrantBoard — drop target with placed blocks rendering"
```

---

### Task 16: /quiz 页面 (拖拽逻辑总装)

**Files:**
- Create: `D:\selfknow\src\app\quiz\page.tsx`

- [ ] **Step 1: 写 page**

文件: `D:\selfknow\src\app\quiz\page.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ActivityPool } from '@/components/quiz/ActivityPool';
import { QuadrantBoard } from '@/components/quiz/QuadrantBoard';
import { ACTIVITY_BY_ID } from '@/lib/activities';
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

  // 启动时从 localStorage 恢复(防意外刷新丢数据)
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPlacements(parsed);
      } catch {}
    }
  }, []);

  // placements 变化时存到 localStorage
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

    // 计算落点的 [-1, +1] 坐标
    // dnd-kit 的 over 是 droppable 节点。我们查 data-board 元素的 rect
    const board = document.querySelector('[data-board="true"]') as HTMLElement | null;
    if (!board) return;
    const rect = board.getBoundingClientRect();

    // activatorEvent 是 PointerEvent / MouseEvent / TouchEvent;取最终位置
    const ae = activatorEvent as MouseEvent | TouchEvent;
    let clientX: number, clientY: number;
    if ('touches' in ae && ae.changedTouches?.[0]) {
      clientX = ae.changedTouches[0].clientX + delta.x;
      clientY = ae.changedTouches[0].clientY + delta.y;
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
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const { id } = await res.json();
      localStorage.removeItem(LS_KEY);
      router.push(`/r/${id}`);
    } catch (e: any) {
      setError(e.message || '提交失败');
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
```

- [ ] **Step 2: 跑 dev,手动测试拖拽**

```bash
cd D:/selfknow
npm run dev
```

打开 http://localhost:3000/quiz,应该:
- ✓ 看到右侧 16 个活动方块、左侧四象限
- ✓ 拖拽方块到象限,出现深色块,池里消失
- ✓ 拖板上的块到新位置,会更新位置
- ✓ 点已放置块的 ✕ 回池
- ✓ 放够 5 个,提交按钮可点(点击会失败因为 API 还没建)
- ✓ 刷新页面,placements 还在(从 localStorage)

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/app/quiz/page.tsx
git commit -m "feat: /quiz page with drag-drop, localStorage backup, submit handler"
```

---

## Phase 6 · API Endpoints

### Task 17: POST /api/quiz/submit

**Files:**
- Create: `D:\selfknow\src\app\api\quiz\submit\route.ts`

- [ ] **Step 1: 写 API**

文件: `D:\selfknow\src\app\api\quiz\submit\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { classify } from '@/lib/classify';
import { hashIp } from '@/lib/ip-hash';
import { submitRatelimit } from '@/lib/ratelimit';
import { ACTIVITY_BY_ID } from '@/lib/activities';

export const runtime = 'nodejs';

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
       || req.headers.get('x-real-ip')
       || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const ipHash = hashIp(ip, process.env.IP_HASH_SALT || 'dev-salt');

  // 限流
  const { success } = await submitRatelimit.limit(ipHash);
  if (!success) {
    return NextResponse.json(
      { error: 'rate-limited', message: '认识自己急不来 — 一小时后再来一次?' },
      { status: 429 }
    );
  }

  // 解析 body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const { placements, quiz_meta } = body;
  if (!Array.isArray(placements) || placements.length < 5) {
    return NextResponse.json({ error: 'too-few-placements' }, { status: 400 });
  }
  if (placements.length > 30) {
    return NextResponse.json({ error: 'too-many-placements' }, { status: 400 });
  }

  // 校验 placements 字段
  for (const p of placements) {
    if (
      !p.activity_id || !ACTIVITY_BY_ID[p.activity_id] ||
      typeof p.passion !== 'number' || p.passion < -1 || p.passion > 1 ||
      typeof p.confidence !== 'number' || p.confidence < -1 || p.confidence > 1
    ) {
      return NextResponse.json({ error: 'invalid-placement', activity_id: p.activity_id }, { status: 400 });
    }
  }

  // 服务端再算一次分类(防客户端篡改)
  const typeId = classify(placements);

  const id = nanoid(10);

  try {
    await db.insert(quizSessions).values({
      id,
      placements,
      typeId,
      reportStatus: 'pending',
      ipHash,
      userAgent: req.headers.get('user-agent') || null,
      quizMeta: quiz_meta || null,
    });
  } catch (e) {
    console.error('db insert failed:', e);
    return NextResponse.json({ error: 'db-error' }, { status: 500 });
  }

  return NextResponse.json({ id, type_id: typeId });
}
```

- [ ] **Step 2: 手动测试**(需要 Neon 已 seed)

```bash
cd D:/selfknow
npm run dev
```

新开一个 terminal:
```bash
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"placements":[{"activity_id":"writing","passion":0.6,"confidence":0.4,"first_placed_at_ms":1000,"final_at_ms":1000,"move_count":0},{"activity_id":"coding","passion":0.7,"confidence":0.5,"first_placed_at_ms":1500,"final_at_ms":1500,"move_count":0},{"activity_id":"reading","passion":0.5,"confidence":0.3,"first_placed_at_ms":2000,"final_at_ms":2000,"move_count":0},{"activity_id":"music","passion":0.6,"confidence":0.4,"first_placed_at_ms":2500,"final_at_ms":2500,"move_count":0},{"activity_id":"travel","passion":0.5,"confidence":0.5,"first_placed_at_ms":3000,"final_at_ms":3000,"move_count":0}],"quiz_meta":{"duration_ms":5000,"first_action_ms":1000,"viewport":{"w":1920,"h":1080}}}'
```

预期: `{"id":"xxxxx","type_id":"passion-leader"}` (或其他类型)

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/app/api/quiz/submit/route.ts
git commit -m "feat: POST /api/quiz/submit — validate, classify, persist, return id"
```

---

### Task 18: LLM 客户端 + Prompt builder

**Files:**
- Create: `D:\selfknow\src\lib\llm.ts`

- [ ] **Step 1: 写 LLM 模块**

文件: `D:\selfknow\src\lib\llm.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { Placement } from './db/schema';
import { ACTIVITY_BY_ID } from './activities';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `你是有心理学背景的认知顾问,擅长基于人对活动的态度推测内在画像。

任务: 根据用户在"热情-自信地图"上的活动摆放,生成一段 200-300 字的个人画像报告。

要求:
- 直接称"你",不用"该用户"
- 引用具体活动名来佐证判断,避免泛泛而谈
- 结构: 优势(1段) / 盲区(1段) / 建议(1段),不显式写小标题,段落自然过渡
- 语调温暖但有力量,避免鸡汤
- 自然引用一个心理学概念(心流 / 成长型心智 / 自我效能 / 内在动机...),来源可参考《心理学与生活》等经典,点到即止
- 不要说"你是XX型"(类型卡已经做了),不要重复"高热情低自信"等生硬表述`;

function buildUserMessage(placements: Placement[], quizMeta: any): string {
  // 按象限分组
  const placedActivities = placements.map(p => {
    const a = ACTIVITY_BY_ID[p.activity_id];
    const moveNote = p.move_count >= 3 ? ' ← 反复犹豫' : '';
    return `- ${a?.labelZh || p.activity_id}  (热情: ${p.passion >= 0 ? '+' : ''}${p.passion.toFixed(2)}, 自信: ${p.confidence >= 0 ? '+' : ''}${p.confidence.toFixed(2)}, 调整 ${p.move_count} 次)${moveNote}`;
  }).join('\n');

  const placedIds = new Set(placements.map(p => p.activity_id));
  const unplaced = Object.values(ACTIVITY_BY_ID)
    .filter(a => !placedIds.has(a.id))
    .map(a => a.labelZh)
    .join(', ');

  const durationS = quizMeta?.duration_ms ? Math.round(quizMeta.duration_ms / 1000) : '?';
  const hesitationS = quizMeta?.first_action_ms ? Math.round(quizMeta.first_action_ms / 1000) : '?';

  return `活动地图 (热情/自信轴各从 -1 到 +1, 0 为中性):
${placedActivities}
未放: ${unplaced}

总用时 ${durationS}s · 第一次落子前犹豫 ${hesitationS}s

输出约束:
- 用"几乎触顶/靠上/略上/居中/略下/靠下/几乎触底"描述位置,不引用数值
- 数据精度有限,关注大致方位与显著反差,不做微距比较
- 反复调整 ≥ 3 次的活动可以解读为"内在矛盾"`;
}

export async function* streamReport(placements: Placement[], quizMeta: any): AsyncGenerator<string> {
  const userMsg = buildUserMessage(placements, quizMeta);

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMsg }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/lib/llm.ts
git commit -m "feat: Anthropic Claude client + streaming prompt builder"
```

---

### Task 19: GET /api/quiz/[id]/report (SSE)

**Files:**
- Create: `D:\selfknow\src\app\api\quiz\[id]\report\route.ts`

- [ ] **Step 1: 写 SSE endpoint**

文件: `D:\selfknow\src\app\api\quiz\[id]\report\route.ts`

```typescript
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { streamReport } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const sessions = await db.select().from(quizSessions).where(eq(quizSessions.id, id)).limit(1);
  if (sessions.length === 0) {
    return new Response('Not Found', { status: 404 });
  }
  const session = sessions[0];

  // 已完成 → 直接返
  if (session.reportStatus === 'completed' && session.reportText) {
    const cached = session.reportText;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: cached })}\n\n`));
        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }

  // 标记为 streaming
  await db.update(quizSessions).set({ reportStatus: 'streaming' }).where(eq(quizSessions.id, id));

  let accumulated = '';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamReport(session.placements, session.quizMeta)) {
          accumulated += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }
        // 完成 → 写库
        await db
          .update(quizSessions)
          .set({ reportText: accumulated, reportStatus: 'completed' })
          .where(eq(quizSessions.id, id));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (e) {
        console.error('stream report error:', e);
        await db
          .update(quizSessions)
          .set({ reportStatus: 'failed' })
          .where(eq(quizSessions.id, id));
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'stream-failed' })}\n\n`));
        controller.close();
      }
    },
    cancel() {
      // 用户关 tab — 已经写了的部分留着,标 streaming 让重连能拉到
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',  // 关 nginx 缓冲
    },
  });
}
```

- [ ] **Step 2: 手动测试 (需要真 Neon + Anthropic key)**

先用 submit 拿一个 id,然后:
```bash
curl -N http://localhost:3000/api/quiz/<your-id>/report
```

(`-N` = 不缓冲,直接输出 SSE chunks)

预期: 看到 `data: {"text":"你..."} \n\n` 一段段流出来。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/app/api/quiz/\[id\]/report/route.ts
git commit -m "feat: GET /api/quiz/[id]/report — SSE stream from Claude"
```

---

### Task 20: POST /api/track

**Files:**
- Create: `D:\selfknow\src\app\api\track\route.ts`

- [ ] **Step 1: 写 endpoint**

文件: `D:\selfknow\src\app\api\track\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { shareEvents } from '@/lib/db/schema';
import { hashIp } from '@/lib/ip-hash';
import { trackRatelimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

const VALID_EVENTS = new Set([
  'image_downloaded',
  'qr_scanned',
  'replay_clicked',
  'report_viewed',
]);

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
       || req.headers.get('x-real-ip')
       || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const ipHash = hashIp(ip, process.env.IP_HASH_SALT || 'dev-salt');

  const { success } = await trackRatelimit.limit(ipHash);
  if (!success) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const { session_id, event_type, referrer } = body;
  if (!session_id || !event_type || !VALID_EVENTS.has(event_type)) {
    return NextResponse.json({ error: 'invalid-event' }, { status: 400 });
  }

  try {
    await db.insert(shareEvents).values({
      sessionId: session_id,
      eventType: event_type,
      referrer: referrer || null,
    });
  } catch (e) {
    // 埋点失败不影响主流程,仅 log
    console.error('track insert failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/app/api/track/route.ts
git commit -m "feat: POST /api/track — anonymous share event logging"
```

---

## Phase 7 · Result Page + Streaming Report

### Task 21: TypeCardLive 组件 (浏览器渲染)

**Files:**
- Create: `D:\selfknow\src\components\result\TypeCardLive.tsx`

- [ ] **Step 1: 写组件**

文件: `D:\selfknow\src\components\result\TypeCardLive.tsx`

```typescript
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
      <div className="text-base opacity-90 italic">"{t.taglineZh}"</div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/components/result/TypeCardLive.tsx
git commit -m "feat: TypeCardLive — browser-rendered type card"
```

---

### Task 22: StreamingReport 组件

**Files:**
- Create: `D:\selfknow\src\components\result\StreamingReport.tsx`

- [ ] **Step 1: 写组件**

文件: `D:\selfknow\src\components\result\StreamingReport.tsx`

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/components/result/StreamingReport.tsx
git commit -m "feat: StreamingReport — SSE consumer with retry on fail"
```

---

### Task 23: /r/[id] 结果页

**Files:**
- Create: `D:\selfknow\src\app\r\[id]\page.tsx`

- [ ] **Step 1: 写 page**

文件: `D:\selfknow\src\app\r\[id]\page.tsx`

```typescript
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { TypeCardLive } from '@/components/result/TypeCardLive';
import { StreamingReport } from '@/components/result/StreamingReport';
import { ShareModal } from '@/components/result/ShareModal';
import type { TypeId } from '@/lib/types-data';

export const dynamic = 'force-dynamic';

export default async function ResultPage({ params }: { params: { id: string } }) {
  const sessions = await db.select().from(quizSessions).where(eq(quizSessions.id, params.id)).limit(1);
  if (sessions.length === 0) notFound();
  const session = sessions[0];

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <TypeCardLive typeId={session.typeId as TypeId} />
      <StreamingReport sessionId={session.id} />
      <ShareModal sessionId={session.id} typeId={session.typeId as TypeId} />
    </main>
  );
}
```

(ShareModal 在下个 task 写,这里先 import 占位 — 跑会编译错。Task 25 写完 ShareModal 后能跑。)

- [ ] **Step 2: 暂时 stub ShareModal 让能编译**

文件: `D:\selfknow\src\components\result\ShareModal.tsx`

```typescript
'use client';
import type { TypeId } from '@/lib/types-data';

export function ShareModal({ sessionId, typeId }: { sessionId: string; typeId: TypeId }) {
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
```

- [ ] **Step 3: 跑 dev,测试完整流程**

```bash
cd D:/selfknow
npm run dev
```

走流程: / → 开始 → /quiz → 拖 5 个 → 提交 → /r/[id] → 看到类型卡 + 流式报告。

下载按钮会 404 (image API 还没写,Task 27)。

- [ ] **Step 4: 提交**

```bash
cd D:/selfknow
git add src/app/r/\[id\]/page.tsx src/components/result/ShareModal.tsx
git commit -m "feat: /r/[id] result page (type card + streaming report + share stub)"
```

---

## Phase 8 · Type Card PNG Generation

### Task 24: 字体子集化

**Files:**
- Create: `D:\selfknow\scripts\subset-font.py`
- Create: `D:\selfknow\public\fonts\noto-sans-sc-subset.woff` (生成产物)

- [ ] **Step 1: 写子集化脚本**

文件: `D:\selfknow\scripts\subset-font.py`

```python
"""
Subset Noto Sans SC to only the chars we need for type cards.

Usage:
  pip install fonttools brotli
  # 下载 NotoSansSC-Bold.otf 到 scripts/ (https://fonts.google.com/noto/specimen/Noto+Sans+SC)
  python scripts/subset-font.py
"""
import sys
from pathlib import Path
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

# 需要保留的字符 — 8 类名 + 标语 + 站点名 + 数字 + ASCII 标点
CHARS = set()

# 8 类型名 + 标语
LABELS = [
    "热情主导", "你是被点燃的人",
    "隐藏火种", "光还没亮起，但燃料已就位",
    "舒适专家", "扎根的人有最深的视野",
    "观察者", "你看世界，世界也在被你看见",
    "多面探索", "边界对你不是问题",
    "中间地带", "克制是一种被低估的力量",
    "热情中立", "温度刚好，不烫手",
    "沉淀蓄势", "地下的根比地上的枝长",
]
for s in LABELS:
    CHARS.update(s)

# 站点名 + 通用
CHARS.update("认识自我")
CHARS.update("你的认知地图")
CHARS.update("selfknow.site")
CHARS.update("0123456789")
CHARS.update(".,;:!?'\"-—()/")

print(f"Subset: {len(CHARS)} chars")
print(f"Sample: {''.join(sorted(CHARS)[:30])}...")

src = Path(__file__).parent / "NotoSansSC-Bold.otf"
if not src.exists():
    print(f"ERROR: {src} not found.")
    print(f"Download from: https://fonts.google.com/noto/specimen/Noto+Sans+SC")
    sys.exit(1)

dst = Path(__file__).parent.parent / "public" / "fonts" / "noto-sans-sc-subset.woff"
dst.parent.mkdir(parents=True, exist_ok=True)

font = TTFont(str(src))
options = Options(flavor="woff")
sub = Subsetter(options=options)
sub.populate(text="".join(CHARS))
sub.subset(font)
font.flavor = "woff"
font.save(str(dst))

src_size = src.stat().st_size
dst_size = dst.stat().st_size
print(f"Done: {src_size//1024}KB → {dst_size//1024}KB ({dst_size*100//src_size}%)")
print(f"  Output: {dst}")
```

- [ ] **Step 2: 跑子集化**

```bash
cd D:/selfknow
# 下载 NotoSansSC-Bold.otf 到 scripts/ (从 https://fonts.google.com/noto/specimen/Noto+Sans+SC)

# 用全路径 python (按用户偏好避免 store 弹窗)
/c/Users/liaoshixin/AppData/Local/Programs/Python/Python312/python -m pip install fonttools brotli
/c/Users/liaoshixin/AppData/Local/Programs/Python/Python312/python scripts/subset-font.py
```

预期: `public/fonts/noto-sans-sc-subset.woff` ~30KB 文件。

- [ ] **Step 3: 提交脚本 + 字体产物**

```bash
cd D:/selfknow
git add scripts/subset-font.py public/fonts/noto-sans-sc-subset.woff
git commit -m "feat: font subsetting script + Noto Sans SC subset (~30KB)"
```

⚠️ NotoSansSC-Bold.otf 不入仓(太大),改 8 类文案后重跑。

---

### Task 25: TypeCardStatic (PNG 渲染用 React 组件)

**Files:**
- Create: `D:\selfknow\src\components\result\TypeCardStatic.tsx`

- [ ] **Step 1: 写组件**

文件: `D:\selfknow\src\components\result\TypeCardStatic.tsx`

```typescript
// Server-only component used by @vercel/og to render PNG.
// Uses inline styles only (Satori doesn't support Tailwind).

import type { TypeDef } from '@/lib/types-data';

type Props = {
  type: TypeDef;
  qrDataUrl: string;
  size: 'square' | 'wide';
};

export function TypeCardStatic({ type, qrDataUrl, size }: Props) {
  const isSquare = size === 'square';
  const W = isSquare ? 1080 : 1200;
  const H = isSquare ? 1080 : 630;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isSquare ? 'column' : 'row',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${type.colorPri}, ${type.colorSec})`,
        color: 'white',
        fontFamily: 'NotoSansSC',
        padding: isSquare ? 80 : 60,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
        <div style={{ fontSize: isSquare ? 28 : 22, opacity: 0.7, letterSpacing: 4, marginBottom: 16 }}>
          认识自我
        </div>
        <div style={{ fontSize: isSquare ? 36 : 28, opacity: 0.7, marginBottom: 24 }}>
          你的认知地图
        </div>
        <div style={{ fontSize: isSquare ? 120 : 80, fontWeight: 700, letterSpacing: 8, marginBottom: 32 }}>
          {type.labelZh}
        </div>
        <div style={{ fontSize: isSquare ? 36 : 26, opacity: 0.85, fontStyle: 'italic' }}>
          "{type.taglineZh}"
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSquare ? 'flex-start' : 'flex-end',
        justifyContent: 'flex-end',
        gap: 12,
      }}>
        <img src={qrDataUrl} width={isSquare ? 160 : 130} height={isSquare ? 160 : 130} style={{ borderRadius: 8 }} />
        <div style={{ fontSize: isSquare ? 22 : 18, opacity: 0.6 }}>selfknow.site</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/components/result/TypeCardStatic.tsx
git commit -m "feat: TypeCardStatic — server-only React component for PNG render"
```

---

### Task 26: GET /api/quiz/[id]/image

**Files:**
- Create: `D:\selfknow\src\app\api\quiz\[id]\image\route.tsx`

- [ ] **Step 1: 写 image route**

文件: `D:\selfknow\src\app\api\quiz\[id]\image\route.tsx`

```typescript
import { ImageResponse } from 'next/og';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';
import { db } from '@/lib/db/client';
import { quizSessions } from '@/lib/db/schema';
import { TYPE_BY_ID, type TypeId } from '@/lib/types-data';
import { TypeCardStatic } from '@/components/result/TypeCardStatic';
import { Redis } from '@upstash/redis';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function loadFont(): Promise<ArrayBuffer> {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'noto-sans-sc-subset.woff');
  const buf = await fs.readFile(fontPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const size = (url.searchParams.get('size') as 'square' | 'wide') || 'square';
  if (size !== 'square' && size !== 'wide') {
    return new Response('Bad size', { status: 400 });
  }

  // 查 type_id
  const sessions = await db.select({ typeId: quizSessions.typeId }).from(quizSessions).where(eq(quizSessions.id, params.id)).limit(1);
  if (sessions.length === 0) return new Response('Not Found', { status: 404 });
  const typeId = sessions[0].typeId as TypeId;
  const type = TYPE_BY_ID[typeId];
  if (!type) return new Response('Bad type', { status: 500 });

  // 缓存 key = type_id × size (全站 16 张)
  const cacheKey = `card:${typeId}:${size}`;
  const cached = await redis.get<string>(cacheKey);
  if (cached) {
    const buf = Buffer.from(cached, 'base64');
    return new Response(buf, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  }

  // 生成 QR 码 (固定指 /quiz)
  const qrDataUrl = await QRCode.toDataURL(`${SITE_URL}/quiz`, { width: 200, margin: 1 });

  // 生成字体
  const fontData = await loadFont();

  // 渲染
  const W = size === 'square' ? 1080 : 1200;
  const H = size === 'square' ? 1080 : 630;

  const img = new ImageResponse(
    <TypeCardStatic type={type} qrDataUrl={qrDataUrl} size={size} />,
    {
      width: W,
      height: H,
      fonts: [{ name: 'NotoSansSC', data: fontData, weight: 700, style: 'normal' }],
    }
  );

  // 写缓存 (PNG → base64 → KV)
  const arrBuf = await img.arrayBuffer();
  const base64 = Buffer.from(arrBuf).toString('base64');
  await redis.set(cacheKey, base64, { ex: 60 * 60 * 24 * 30 });  // 30 天 TTL

  return new Response(arrBuf, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
```

- [ ] **Step 2: 测试**

启动 dev,跑过一个 quiz 拿到 id,浏览器访问:
```
http://localhost:3000/api/quiz/<id>/image?size=square
http://localhost:3000/api/quiz/<id>/image?size=wide
```

预期: 看到带类型卡的 PNG 图。

⚠️ 第一次请求可能慢 (~1-2s),第二次秒回(KV 缓存)。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/app/api/quiz/\[id\]/image/route.tsx
git commit -m "feat: GET /api/quiz/[id]/image — PNG with QR + KV cache"
```

---

## Phase 9 · Share Modal + iOS WeChat Handling

### Task 27: 完整版 ShareModal

**Files:**
- Modify: `D:\selfknow\src\components\result\ShareModal.tsx`

- [ ] **Step 1: 替换 ShareModal**

文件: `D:\selfknow\src\components\result\ShareModal.tsx` (替换全部)

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { TypeId } from '@/lib/types-data';
import { parseUA } from '@/lib/ua';

type Props = {
  sessionId: string;
  typeId: TypeId;
};

export function ShareModal({ sessionId, typeId }: Props) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<'square' | 'wide'>('square');
  const [needsLongPress, setNeedsLongPress] = useState(false);

  useEffect(() => {
    const ua = parseUA(navigator.userAgent);
    setNeedsLongPress(ua.needsLongPressHint);
  }, []);

  function track(eventType: string) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, event_type: eventType }),
    }).catch(() => {});
  }

  function openShare(s: 'square' | 'wide') {
    setSize(s);
    setOpen(true);
  }

  function handleDownload() {
    track('image_downloaded');
    if (needsLongPress) return;  // iOS 微信不走 download
    const a = document.createElement('a');
    a.href = `/api/quiz/${sessionId}/image?size=${size}`;
    a.download = `selfknow-${typeId}-${size}.png`;
    a.click();
  }

  const imgUrl = `/api/quiz/${sessionId}/image?size=${size}`;

  return (
    <>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => openShare('square')}
          className="px-4 py-2 bg-stone-900 text-white rounded text-sm hover:bg-stone-700"
        >
          下载方形 (微信)
        </button>
        <button
          onClick={() => openShare('wide')}
          className="px-4 py-2 border border-stone-300 rounded text-sm hover:bg-stone-100"
        >
          下载宽形 (Twitter)
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
            <img
              src={imgUrl}
              alt="你的类型卡"
              className="w-full rounded mb-4"
              onLoad={handleDownload}
            />
            {needsLongPress ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded text-sm text-center">
                📱 长按图片 → 选择"保存到相册"
              </div>
            ) : (
              <div className="text-sm text-stone-600 text-center">
                <p>已开始下载。</p>
                <p className="mt-1 text-xs text-stone-400">没下载?右键图片"另存为"</p>
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
```

- [ ] **Step 2: 测试**

启动 dev,走完一个 quiz 到 /r/[id],点下载按钮 → 弹 modal → 桌面应该自动触发下载;手机模拟器下应该显示长按提示。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/components/result/ShareModal.tsx
git commit -m "feat: ShareModal with iOS WeChat long-press handling + download tracking"
```

---

## Phase 10 · Misc Pages + Error Handling

### Task 28: 隐私页

**Files:**
- Create: `D:\selfknow\src\app\privacy\page.tsx`

- [ ] **Step 1: 写隐私页**

文件: `D:\selfknow\src\app\privacy\page.tsx`

```typescript
export const metadata = { title: '隐私政策 · 认识自我' };

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-2xl prose prose-stone">
      <h1>隐私政策</h1>
      <p className="text-stone-600">最后更新: 2026-04-29</p>

      <h2>三句话版本</h2>
      <ol>
        <li>我们<strong>不存能找到你本人的任何信息</strong>(没邮箱、手机、姓名)。</li>
        <li>你的拖拽数据是<strong>匿名 + 永久</strong>的,我们用聚合数据来改进 quiz。</li>
        <li>想删除你的画像,把分享链接发邮件给我们 (<a href="mailto:hi@selfknow.site">hi@selfknow.site</a>),我们手工删。</li>
      </ol>

      <h2>详细说明</h2>
      <h3>我们存什么</h3>
      <ul>
        <li>你拖拽放置的活动 + 坐标(永久,匿名)</li>
        <li>你被分到的 8 类标签(永久,匿名)</li>
        <li>AI 生成的画像报告文本(90 天后归档)</li>
        <li>访问 IP 的哈希(30 天,仅用于限流防滥用)</li>
        <li>浏览器 UA(30 天,仅用于错误诊断)</li>
        <li>你点击下载/扫码等行为(永久,聚合分析用)</li>
      </ul>

      <h3>我们不存什么</h3>
      <ul>
        <li>你的邮箱、手机、姓名、生日等任何身份信息</li>
        <li>原始 IP 地址(只存哈希)</li>
        <li>跨站点的浏览行为</li>
      </ul>

      <h3>第三方服务</h3>
      <p>我们使用 Vercel(网站托管)、Neon(数据库)、Anthropic(AI 模型)、Upstash(限流)。这些服务可能会处理你的请求数据,详见各自隐私政策。</p>

      <h3>cookie</h3>
      <p>我们用一个 session cookie 帮你记住自己的画像链接(90 天有效期)。你可以随时清除浏览器 cookie 删除它。</p>
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add src/app/privacy/page.tsx
git commit -m "feat: privacy policy page"
```

---

### Task 29: 错误页 + 404

**Files:**
- Create: `D:\selfknow\src\app\error.tsx`
- Create: `D:\selfknow\src\app\not-found.tsx`

- [ ] **Step 1: 写错误兜底**

文件: `D:\selfknow\src\app\error.tsx`

```typescript
'use client';

import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container mx-auto px-6 py-20 max-w-md text-center">
      <div className="text-5xl mb-4">😶</div>
      <h1 className="text-2xl font-bold mb-3">出了点小问题</h1>
      <p className="text-stone-600 mb-6">{error.message || '系统打了个嗝。'}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700">
          再试一次
        </button>
        <Link href="/" className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-100">
          回首页
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 写 404**

文件: `D:\selfknow\src\app\not-found.tsx`

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-6 py-20 max-w-md text-center">
      <div className="text-5xl mb-4">🌫️</div>
      <h1 className="text-2xl font-bold mb-3">这个画像不见了</h1>
      <p className="text-stone-600 mb-6">也许它从未存在,也许你的链接错了。</p>
      <Link href="/quiz" className="inline-block px-4 py-2 bg-stone-900 text-white rounded hover:bg-stone-700">
        做一个新的 quiz
      </Link>
    </main>
  );
}
```

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add src/app/error.tsx src/app/not-found.tsx
git commit -m "feat: error page + 404 page"
```

---

## Phase 11 · Tests + Polish

### Task 30: API submit 集成测试

**Files:**
- Create: `D:\selfknow\tests\api\submit.test.ts`

- [ ] **Step 1: 写测试**

文件: `D:\selfknow\tests\api\submit.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/quiz/submit/route';
import { NextRequest } from 'next/server';

// Mock db & ratelimit
vi.mock('@/lib/db/client', () => ({
  db: {
    insert: () => ({ values: async () => undefined }),
  },
}));

vi.mock('@/lib/ratelimit', () => ({
  submitRatelimit: { limit: async () => ({ success: true }) },
}));

function makeReq(body: any): NextRequest {
  return new NextRequest('http://localhost/api/quiz/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/quiz/submit', () => {
  it('rejects fewer than 5 placements', async () => {
    const req = makeReq({ placements: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('too-few-placements');
  });

  it('rejects invalid activity_id', async () => {
    const placements = Array.from({ length: 5 }, (_, i) => ({
      activity_id: 'NOT-REAL',
      passion: 0.5, confidence: 0.5,
      first_placed_at_ms: 0, final_at_ms: 0, move_count: 0,
    }));
    const req = makeReq({ placements });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects out-of-range coords', async () => {
    const placements = Array.from({ length: 5 }, () => ({
      activity_id: 'writing',
      passion: 1.5, confidence: 0,
      first_placed_at_ms: 0, final_at_ms: 0, move_count: 0,
    }));
    const req = makeReq({ placements });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns id + type_id on valid submit', async () => {
    const placements = ['writing', 'coding', 'reading', 'music', 'travel'].map(id => ({
      activity_id: id,
      passion: 0.5, confidence: 0.5,
      first_placed_at_ms: 0, final_at_ms: 0, move_count: 0,
    }));
    const req = makeReq({ placements });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThanOrEqual(8);
    expect(typeof body.type_id).toBe('string');
  });
});
```

- [ ] **Step 2: 跑测试**

```bash
cd D:/selfknow
npm test -- submit
```

预期: 4 PASS。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add tests/api/submit.test.ts
git commit -m "test: integration tests for /api/quiz/submit"
```

---

### Task 31: E2E 拖拽流程测试

**Files:**
- Create: `D:\selfknow\tests\e2e\quiz-flow.spec.ts`

- [ ] **Step 1: 写 E2E**

文件: `D:\selfknow\tests\e2e\quiz-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Quiz flow', () => {
  test('home → quiz page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '认识自我' })).toBeVisible();
    await page.getByRole('link', { name: /开始/ }).click();
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByText(/把活动拖到对应位置/)).toBeVisible();
  });

  test('submit button disabled until 5 placements', async ({ page }) => {
    await page.goto('/quiz');
    const submitBtn = page.getByRole('button', { name: /提交/ });
    await expect(submitBtn).toBeDisabled();
  });

  test('renders 16 activity blocks in pool', async ({ page }) => {
    await page.goto('/quiz');
    // 每个 activity 都有一个 draggable 元素 (cursor-grab class)
    // 用文本匹配做粗略校验
    const labels = ['写作', '写代码', '画画', '音乐', '摄影', '舞蹈', '运动', '烹饪',
                    '旅游', '演讲', '辩论', '聚会', '阅读', '学习', '独处', '游戏'];
    for (const label of labels) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });
});
```

⚠️ 拖拽真实交互的 Playwright 测试比较复杂(`page.dragAndDrop` 需要精确选择器,而且 dnd-kit 内部对 mouse 事件的解析有时序要求),v1 先做基础渲染测试,完整拖拽 E2E 留 v1.5。

- [ ] **Step 2: 跑 E2E**

```bash
cd D:/selfknow
npm run test:e2e
```

预期: 3 PASS (跨 desktop-chrome 和 mobile-safari 都跑)。

- [ ] **Step 3: 提交**

```bash
cd D:/selfknow
git add tests/e2e/quiz-flow.spec.ts
git commit -m "test: e2e basic quiz flow (page loads + activity rendering)"
```

---

### Task 32: README

**Files:**
- Modify: `D:\selfknow\README.md`

- [ ] **Step 1: 写 README**

文件: `D:\selfknow\README.md` (覆盖 create-next-app 默认)

```markdown
# 认识自我 · selfknow.site

LeetCode-for-self-knowledge 的 MVP — 通过拖拽答题生成个人画像。

## Stack

Next.js 14 / TypeScript / Tailwind / Drizzle / Neon Postgres / Anthropic Claude / @vercel/og / @dnd-kit

## Setup

```bash
npm install
cp .env.local.example .env.local
# 填上 DATABASE_URL / ANTHROPIC_API_KEY / KV_REST_API_URL / KV_REST_API_TOKEN / IP_HASH_SALT
npm run db:push       # 把 schema 推到 Neon
npm run db:seed       # 灌 seed 数据 (8 类型 + 16 活动)
npm run dev           # http://localhost:3000
```

## Useful commands

- `npm test` — 单元测试
- `npm run test:e2e` — E2E 测试 (Playwright)
- `npm run calibrate` — 跑 1000 个合成样本看 8 类分桶分布
- `npm run db:generate` — 改 schema 后生成迁移

## Deploy

Vercel 一键部署。需要在 Vercel dashboard 配:
- 所有 .env.local 里的环境变量(`NEXT_PUBLIC_SITE_URL` 改成 prod 域名)
- Neon Postgres / Upstash Redis 连上
- Vercel KV Integration(也用 Upstash)

## Docs

- [设计稿](docs/superpowers/specs/2026-04-29-self-knowledge-mvp-design.md)
- [实现计划](docs/superpowers/plans/2026-04-29-self-knowledge-mvp.md)
```

- [ ] **Step 2: 提交**

```bash
cd D:/selfknow
git add README.md
git commit -m "docs: README with setup, commands, deploy notes"
```

---

## Phase 12 · Deploy + Open Items

### Task 33: 部署到 Vercel

**Files:** N/A (config in Vercel dashboard)

- [ ] **Step 1: 注册 / 登录 Vercel**

`https://vercel.com` — 用 GitHub 账号登录。

- [ ] **Step 2: 推 git repo 到 GitHub**

```bash
cd D:/selfknow
git remote add origin https://github.com/<your-user>/selfknow-site.git
git push -u origin main
```

- [ ] **Step 3: Vercel Import**

Dashboard → Add New → Project → Import GitHub repo。

- [ ] **Step 4: 配环境变量**

Vercel project → Settings → Environment Variables,加:
- `DATABASE_URL` (Neon)
- Anthropic 凭据(二选一,跟 `.env.local.example` 一致):
  - **官方直连**: `ANTHROPIC_API_KEY` (`sk-ant-...`)
  - **代理/中转**: `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` (Bearer token)
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Upstash;或装 Vercel KV integration 自动注入)
- `IP_HASH_SALT` (32+ 字符随机字符串)
- `NEXT_PUBLIC_SITE_URL` = `https://selfknow.site` (你的 prod 域名)

- [ ] **Step 5: 触发部署 + 验证**

Vercel 会自动 build。Build 完成后访问分配的 `*.vercel.app` 域名。

走一遍 / → 开始 → /quiz → 拖 5 个 → 提交 → 看类型卡 + 报告 → 下载图。

如果某步失败,看 Vercel Function 日志诊断。

- [ ] **Step 6: 绑定自定义域名**

注册 `selfknow.site` (Cloudflare / Porkbun / Namecheap),按 Vercel 提示加 DNS 记录。

---

### Task 34: 上线前 checklist (内容侧)

**这些不是代码任务,是产品上线前**必做**的内容工作。**

- [ ] 8 类类型名 + 标语精修(`src/lib/types-data.ts` 现在是占位草案)
- [ ] 16 个活动方块图标设计 + 放到 `public/icons/*.svg` (现在缺图标,UI 仍能跑但没图)
- [ ] 跑 `npm run calibrate` 调阈值 (`src/lib/classify.ts` 阈值);找 20-50 真人 mock 数据补充
- [ ] LLM prompt 微调(在 `src/lib/llm.ts` 跑几十次 sample 看输出质量)
- [ ] 监控接入: Vercel Analytics 自动开;Sentry 单独装
- [ ] LLM 月预算告警(Anthropic Console → Usage Limits)
- [ ] 隐私页文案律审(如果想上线运营)

---

## Self-Review

### Spec Coverage Check

逐节对照 spec → plan task:

| Spec § | 覆盖任务 |
|---|---|
| 1 背景目标 | (无需代码) |
| 2 范围 | Plan 锁定 v1,其他不做 |
| 3.1 技术栈 | Task 1, 2, 3 |
| 3.2 架构图 | 整体 plan 实现 |
| 3.3 关键约束 | Task 19 (流式)、Task 24 (字体子集) |
| 4.1 表结构 | Task 5 |
| 4.2 placements | Task 5 (Placement type) + Task 16 (前端坐标转换) |
| 4.3 quiz_meta | Task 5 + Task 16 |
| 5 拖拽 UX | Task 12-16 |
| 6.1 算法 | Task 8 |
| 6.2 类型种子 | Task 6 |
| 6.3 阈值校准 | Task 9 |
| 7.1 时序 | Task 17 + 19 + 23 |
| 7.2 模型选择 | Task 18 |
| 7.3 Prompt | Task 18 |
| 7.4 容错 | Task 19 + 22 |
| 7.5 成本 | (运维,无代码) |
| 8.1 两尺寸 | Task 25 + 26 |
| 8.2 渲染管线 | Task 26 |
| 8.3 字体 / QR | Task 24 + 26 |
| 8.4 下载 UX | Task 27 |
| 9 错误处理 | Task 17, 19, 22, 27, 29 |
| 10 隐私 | Task 28 |
| 11 限流 | Task 11 + 17 + 20 |
| 12 监控 | Task 20 + Task 33 (Vercel/Sentry 接入) |
| 13 测试 | Task 8, 10, 30, 31 |
| 14 上线 checklist | Task 34 |
| 15 风险表 | (运营,无代码) |

✅ 全覆盖。

### Placeholder Scan

✅ 所有任务都有具体代码、命令、预期结果。无 "TBD" / "implement later" / "similar to Task N"。

### Type Consistency

- `Placement` 类型在 schema.ts 定义,所有用到的地方(classify, llm, submit, quiz page)都从 `@/lib/db/schema` 导入 ✓
- `TypeId` 在 types-data.ts 定义,所有用到的地方导入 ✓
- API 端点参数命名一致: 用 snake_case (`activity_id`, `quiz_meta`) 跟 db 一致;TS 内部 camelCase ✓

### Scope Check

✅ 单一 MVP,所有任务围绕"单题爆款"假设。v1.5 / v2 在 spec §2 已分隔,plan 不触碰。

---

## Plan complete and saved to `D:\selfknow\docs\superpowers\plans\2026-04-29-self-knowledge-mvp.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. 适合 34 个任务这种规模,每个任务单独 review,中间能及时发现问题。

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. 适合小任务集,这种规模在单会话里跑完会很重。

Which approach?

# 认识自我 · selfknow.site

LeetCode-for-self-knowledge MVP — 通过拖拽答题生成个人画像。

## Stack

Next.js 16 / TypeScript / Tailwind v4 / Drizzle ORM / Neon Postgres / @vercel/og / @dnd-kit / Upstash Redis (限流 + KV)

> 注: `@vercel/og` 是 PNG 渲染库,不绑定 Vercel 平台,任何 Node runtime 都能跑。

## Setup

```bash
npm install
cp .env.local.example .env.local
# 填上 DATABASE_URL / KV_REST_API_URL / KV_REST_API_TOKEN / IP_HASH_SALT / NEXT_PUBLIC_SITE_URL
npm run db:push        # 把 schema 推到 Neon
npm run db:seed        # 灌 seed 数据 (8 类型 + 16 活动)
npm run dev            # http://localhost:3000
```

## Useful commands

- `npm test` — 单元测试 (vitest)
- `npm run test:e2e` — E2E 测试 (Playwright)
- `npm run calibrate` — 跑 1000 个合成样本看 8 类分桶分布
- `npm run db:generate` — 改 schema 后生成迁移

## 字体子集化

Type card PNG 用思源黑体子集 (~30KB)。改 8 类文案后重跑:

```bash
# 下载 NotoSansSC-Bold.otf 从 https://fonts.google.com/noto/specimen/Noto+Sans+SC
# 放到 scripts/NotoSansSC-Bold.otf
pip install fonttools brotli
python scripts/subset-font.py
# 产物: public/fonts/noto-sans-sc-subset.woff
```

## Deploy (Cloudflare Workers)

通过 `@opennextjs/cloudflare` 把 Next.js 编译成 Cloudflare Worker + 静态 assets。

### 一次性设置 (本地 CLI 路径)

```bash
npx wrangler login           # 浏览器授权 Cloudflare 账号
npm run cf:deploy            # build + deploy 到 Workers
```

第一次 deploy 完成后,Cloudflare 会给你一个 `<worker-name>.<account>.workers.dev` URL。

### 配 Environment Variables

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Variables:
- `DATABASE_URL` (Neon)
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Upstash)
- `IP_HASH_SALT` (32+ 字符随机串)
- `NEXT_PUBLIC_SITE_URL` = 你的部署域名

> `NEXT_PUBLIC_*` 是 build 时内联到客户端 bundle 的,改了要重 deploy。

### Git 自动部署 (可选)

Dashboard → Workers & Pages → Create → Connect to Git → 选 repo:
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`

### 关键文件

- `wrangler.jsonc` — Worker 配置 (compatibility flags, assets binding)
- `open-next.config.ts` — OpenNext build 配置 (默认即可)
- `public/_headers` — 静态资源缓存策略

## Docs

- [设计稿](docs/superpowers/specs/2026-04-29-self-knowledge-mvp-design.md)
- [实现计划](docs/superpowers/plans/2026-04-29-self-knowledge-mvp.md)

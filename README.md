# 认识自我 · selfknow.site

LeetCode-for-self-knowledge MVP — 通过拖拽答题生成个人画像。

## Stack

Next.js 16 / TypeScript / Tailwind v4 / Drizzle ORM / Neon Postgres / Anthropic Claude (Sonnet 4.6) / @vercel/og / @dnd-kit / Upstash Redis (限流 + KV)

## Setup

```bash
npm install
cp .env.local.example .env.local
# 填上 DATABASE_URL / ANTHROPIC_API_KEY / KV_REST_API_URL / KV_REST_API_TOKEN / IP_HASH_SALT
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

## Deploy

Vercel 一键部署。Dashboard 里配:
- 所有 .env.local 里的环境变量
- `NEXT_PUBLIC_SITE_URL` 改成 prod 域名
- Neon Postgres / Upstash Redis 连上 (用 Vercel integrations 自动注入也行)

## Docs

- [设计稿](docs/superpowers/specs/2026-04-29-self-knowledge-mvp-design.md)
- [实现计划](docs/superpowers/plans/2026-04-29-self-knowledge-mvp.md)

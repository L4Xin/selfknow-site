# 认识自我 · selfknow.site

LeetCode-for-self-knowledge MVP — 通过拖拽答题生成个人画像。

**纯静态站**:8 类聚类完全在客户端跑(`classify` 是纯函数),16 张类型卡 PNG 在 build 时预生成,无后端、无数据库、无 LLM。可部署到任何静态托管。

## Stack

Next.js 16 (static export) / TypeScript / Tailwind v4 / @vercel/og (build 时渲染 PNG) / @dnd-kit / qrcode

## Setup

```bash
npm install
cp .env.local.example .env.local
# 编辑 .env.local 把 NEXT_PUBLIC_SITE_URL 设成你的部署 URL
npm run dev               # http://localhost:3000
```

## Useful commands

- `npm run build:cards` — 单独跑 PNG 预生成 (修了类型卡设计后用)
- `npm run build` — build:cards + next build (产出在 `out/`)
- `npm test` — 单元测试 (vitest)
- `npm run test:e2e` — E2E 测试 (Playwright)
- `npm run calibrate` — 跑 1000 个合成样本看 8 类分桶分布

## 字体子集化

Type card PNG 用思源黑体子集 (~30KB)。改 8 类文案后重跑:

```bash
# 下载 NotoSansSC-Bold.otf 从 https://fonts.google.com/noto/specimen/Noto+Sans+SC
# 放到 scripts/NotoSansSC-Bold.otf
pip install fonttools brotli
python scripts/subset-font.py
# 产物: public/fonts/noto-sans-sc-subset.woff
```

## Deploy (Netlify, 国内可访问)

### 一次性设置
1. https://app.netlify.com → GitHub 登录
2. **Add new site** → **Import an existing project** → 选 `L4Xin/selfknow-site` repo
3. Build 配置:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
4. **Site configuration → Environment variables** 加 `NEXT_PUBLIC_SITE_URL` = 你的 Netlify URL (`*.netlify.app` 或自定义域名)
5. **Deploy site**

### 改了 NEXT_PUBLIC_SITE_URL 必须 redeploy
QR 码是 build 时烧进 PNG 的。改了 URL 要 push 一次 commit 或在 Netlify 控制台 **Trigger deploy**。

### 为什么走 Netlify 而不是 Cloudflare/Vercel
Netlify 的纯静态站 CDN 在中国大陆**实测可用且稳定**(亲测验证),不依赖被 GFW 屏蔽的 `*.workers.dev` / `*.vercel.app`。

## Docs

- [设计稿](docs/superpowers/specs/2026-04-29-self-knowledge-mvp-design.md)
- [实现计划](docs/superpowers/plans/2026-04-29-self-knowledge-mvp.md)

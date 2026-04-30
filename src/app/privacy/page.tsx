export const metadata = { title: '隐私政策 · 认识自我' };

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-2xl prose prose-stone">
      <h1 className="text-3xl font-bold mb-3">隐私政策</h1>
      <p className="text-stone-600 mb-8">最后更新: 2026-04-29</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">三句话版本</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>我们<strong>不存能找到你本人的任何信息</strong>(没邮箱、手机、姓名)。</li>
        <li>你的拖拽数据是<strong>匿名 + 永久</strong>的,我们用聚合数据来改进 quiz。</li>
        <li>想删除你的画像,把分享链接发邮件给我们 (<a href="mailto:hi@selfknow.site" className="underline">hi@selfknow.site</a>),我们手工删。</li>
      </ol>

      <h2 className="text-xl font-semibold mt-8 mb-3">详细说明</h2>

      <h3 className="font-semibold mt-6 mb-2">我们存什么</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>你拖拽放置的活动 + 坐标(永久,匿名)</li>
        <li>你被分到的 8 类标签(永久,匿名)</li>
        <li>访问 IP 的哈希(30 天,仅用于限流防滥用)</li>
        <li>浏览器 UA(30 天,仅用于错误诊断)</li>
        <li>你点击下载/扫码等行为(永久,聚合分析用)</li>
      </ul>

      <h3 className="font-semibold mt-6 mb-2">我们不存什么</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>邮箱、手机、姓名、生日等任何身份信息</li>
        <li>原始 IP 地址(只存哈希)</li>
        <li>跨站点的浏览行为</li>
      </ul>

      <h3 className="font-semibold mt-6 mb-2">第三方服务</h3>
      <p>使用 Cloudflare(托管)、Neon(数据库)、Upstash(限流)。这些服务可能会处理你的请求数据,详见各自隐私政策。</p>

      <h3 className="font-semibold mt-6 mb-2">cookie</h3>
      <p>用一个 session cookie 帮你记住自己的画像链接(90 天有效期)。你可以随时清除浏览器 cookie 删除它。</p>
    </main>
  );
}

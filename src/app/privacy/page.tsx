export const metadata = { title: '隐私政策 · 认识自我' };

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-2xl prose prose-stone">
      <h1 className="text-3xl font-bold mb-3">隐私政策</h1>
      <p className="text-stone-600 mb-8">最后更新: 2026-04-30</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">一句话版本</h2>
      <p>本站是<strong>纯静态网站</strong>,所有计算在你浏览器里完成,我们不收集任何数据。</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">详细说明</h2>

      <h3 className="font-semibold mt-6 mb-2">我们不存什么</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>你拖拽的活动、坐标、答题结果——全部留在你浏览器本地,不上传服务器</li>
        <li>邮箱、手机、姓名、IP 等任何身份信息</li>
        <li>分享/下载/扫码等点击行为</li>
        <li>cookie 也不种(只有 localStorage 在你本地存草稿,可随时清浏览器数据删除)</li>
      </ul>

      <h3 className="font-semibold mt-6 mb-2">第三方服务</h3>
      <p>使用 Netlify(静态托管)。访问站点时 Netlify 会按其常规策略接收 HTTP 请求(IP、UA),详见 Netlify 隐私政策。除此之外无其他第三方服务。</p>

      <h3 className="font-semibold mt-6 mb-2">为什么这样设计</h3>
      <p>因为 quiz 算法是纯函数,完全可以在浏览器里跑。把后端去掉之后,合规和隐私问题一并解决,我们也少操心。</p>
    </main>
  );
}

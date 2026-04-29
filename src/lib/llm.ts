import Anthropic from '@anthropic-ai/sdk';
import type { Placement, QuizMeta } from './db/schema';
import { ACTIVITY_BY_ID } from './activities';

// 三种 auth 任选其一:
//   官方直连:    ANTHROPIC_API_KEY  (sk-ant-...)
//   代理/中转:   ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN (Bearer)
// SDK 会自动忽略 undefined 字段,优先用 authToken (如果同时设置)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  authToken: process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

const SYSTEM_PROMPT = `你是有心理学背景的认知顾问,擅长基于人对活动的态度推测内在画像。

任务: 根据用户在"热情-自信地图"上的活动摆放,生成一段 200-300 字的个人画像报告。

要求:
- 直接称"你",不用"该用户"
- 引用具体活动名来佐证判断,避免泛泛而谈
- 结构: 优势(1段) / 盲区(1段) / 建议(1段),不显式写小标题,段落自然过渡
- 语调温暖但有力量,避免鸡汤
- 自然引用一个心理学概念(心流 / 成长型心智 / 自我效能 / 内在动机...),来源可参考《心理学与生活》等经典,点到即止
- 不要说"你是XX型"(类型卡已经做了),不要重复"高热情低自信"等生硬表述`;

function buildUserMessage(placements: Placement[], quizMeta: QuizMeta | null): string {
  const placedActivities = placements.map(p => {
    const a = ACTIVITY_BY_ID[p.activity_id];
    const moveNote = p.move_count >= 3 ? ' ← 反复犹豫' : '';
    const passionStr = (p.passion >= 0 ? '+' : '') + p.passion.toFixed(2);
    const confStr = (p.confidence >= 0 ? '+' : '') + p.confidence.toFixed(2);
    return `- ${a?.labelZh || p.activity_id}  (热情: ${passionStr}, 自信: ${confStr}, 调整 ${p.move_count} 次)${moveNote}`;
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

export async function* streamReport(placements: Placement[], quizMeta: QuizMeta | null): AsyncGenerator<string> {
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

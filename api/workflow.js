// /api/workflow.js — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { picture, position } = req.body || {};
  if (!picture || !position) {
    return res.status(400).json({ error: 'MISSING_PARAMS', message: 'picture 与 position 必填' });
  }

  const COZE_API_KEY     = process.env.COZE_API_KEY;
  const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID;
  const COZE_SPACE_ID    = process.env.COZE_SPACE_ID;
  const DEMO_MODE        = process.env.DEMO_MODE === 'true';

  if (!COZE_API_KEY || !COZE_WORKFLOW_ID || !COZE_SPACE_ID) {
    return res.status(500).json({
      error: 'CONFIG_MISSING',
      message: '缺少 COZE_API_KEY / COZE_WORKFLOW_ID / COZE_SPACE_ID 环境变量'
    });
  }

  try {
    const cozeResp = await fetch("https://api.coze.cn/open_api/v2/workflow/execute", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: COZE_WORKFLOW_ID,
        space_id: COZE_SPACE_ID,
        parameters: { picture, position }
      })
    });

    const text = await cozeResp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    const msg = (data?.message || data?.msg || data?.error || '').toString().toLowerCase();
    const depleted =
      cozeResp.status === 402 ||
      cozeResp.status === 429 ||
      msg.includes('token has been depleted') ||
      msg.includes('quota') ||
      msg.includes('balance');

    if (!cozeResp.ok || depleted) {
      if (DEMO_MODE) {
        return res.status(200).json({
          output: '🌳 演示数据：黄杨（Buxus），常绿灌木。\n🍃 状态：叶色偏黄，可能缺肥。\n🌱 养护：每周浇水 1–2 次；每月施肥一次；适当遮阴。',
          debug: { depleted: true, note: 'DEMO_MODE 为 true，返回演示结果', upstream: data }
        });
      }
      return res.status(503).json({
        error: 'COZE_TOKEN_DEPLETED',
        message: '服务暂时不可用：AI 额度已用尽，请稍后重试。',
        upstream: data
      });
    }

    // 解析输出
    let output = '';
    if (data?.data) {
      try {
        const inner = JSON.parse(data.data);
        output = inner.output || inner.final_solution || '';
      } catch {
        output = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
      }
    }
    if (!output) output = data?.output || data?.final_solution || '';

    return res.status(200).json({
      output,
      debug_url: data?.debug_url || '',
      raw: data
    });
  } catch (err) {
    return res.status(500).json({
      error: 'WORKFLOW_PROXY_ERROR',
      message: err?.message || '调用 Coze 失败',
    });
  }
}

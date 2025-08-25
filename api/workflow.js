// /api/workflow.js  — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { picture, position } = req.body || {};
  if (!picture || !position) {
    return res.status(400).json({ error: 'MISSING_PARAMS', message: 'picture 与 position 必填' });
  }

  const COZE_API_KEY     = process.env.COZE_API_KEY;
  const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID;   // 你的 workflow_id
  const COZE_SPACE_ID    = process.env.COZE_SPACE_ID;      // 你的 space_id
  const DEMO_MODE        = process.env.DEMO_MODE === 'true';

  if (!COZE_API_KEY || !COZE_WORKFLOW_ID || !COZE_SPACE_ID) {
    return res.status(500).json({
      error: 'CONFIG_MISSING',
      message: '缺少 COZE_API_KEY / COZE_WORKFLOW_ID / COZE_SPACE_ID 环境变量'
    });
  }

  const cozeUrl = 'https://api.coze.com/open_api/v2/workflow/execute';

  try {
    const cozeResp = await fetch(cozeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: COZE_WORKFLOW_ID,
        space_id: COZE_SPACE_ID,
        parameters: {
          picture,
          position
        }
      })
    });

    // 某些情况下 Coze 会 200 但 data 里是错误；也可能 4xx/5xx
    const text = await cozeResp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    // 额度用尽的典型表现：HTTP 400/402/429，或 message 内含关键字
    const msg = (data?.message || data?.msg || data?.error || '').toString().toLowerCase();
    const depleted =
      cozeResp.status === 402 ||
      cozeResp.status === 429 ||
      msg.includes('token has been depleted') ||
      msg.includes('insufficient') ||
      msg.includes('quota') ||
      msg.includes('balance');

    if (!cozeResp.ok || depleted) {
      // 开启 DEMO_MODE 时返回演示数据兜底，避免前端页面“挂”掉
      if (DEMO_MODE) {
        return res.status(200).json({
          output:
            '🌳 植物身份：黄杨（Buxus），常绿灌木，耐修剪、耐阴。\n' +
            '🍃 当前状态：叶色偏黄，日晒偏强或缺肥所致；整体长势尚可。\n' +
            '🌱 养护建议：\n' +
            '• 浇水：每周 1–2 次，每次 300–500 ml，见干见湿。\n' +
            '• 光照：日照 4–6 小时；正午遮阴 30–50%。\n' +
            '• 施肥：生长季每月一次缓释肥 5–8 g/株。\n' +
            '• 修剪：2–3 个月轻剪一次，去黄叶、弱枝。\n' +
            '• 病虫：每月巡检 1 次，发现介壳虫/红蜘蛛即喷药处理。',
          debug: { depleted: true, note: 'DEMO_MODE 为 true，返回演示结果', upstream: data }
        });
      }

      return res.status(503).json({
        error: 'COZE_TOKEN_DEPLETED',
        message:
          '服务暂时不可用：第三方 AI 额度已用尽，请稍后重试或联系管理员补充额度。',
        upstream: data
      });
    }

    // Coze 成功返回
    // 你之前的工作流通常是 { code:0, data:"{\"output\":\"...\"}", debug_url:"..." }
    // 做几层兼容解析：
    let output = '';
    if (data?.data) {
      try {
        const inner = JSON.parse(data.data); // data.data 是字符串化 JSON
        output = inner.output || inner.final_solution || '';
      } catch {
        // 如果 data.data 不是 JSON 字符串，直接当文本用
        output = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
      }
    }
    if (!output) {
      // 兜底尝试常见字段
      output =
        data?.output ||
        data?.final_solution ||
        data?.result ||
        '';
    }

    if (!output) {
      return res.status(200).json({
        output: '',
        note: 'Coze 返回成功但 output 为空，请检查工作流的“输出节点”是否正确绑定。',
        raw: data
      });
    }

    return res.status(200).json({
      output,
      debug_url: data?.debug_url || '',
      raw: data
    });
  } catch (err) {
    // 网络/解析等意外错误
    return res.status(500).json({
      error: 'WORKFLOW_PROXY_ERROR',
      message: err?.message || '调用 Coze 失败',
    });
  }
}

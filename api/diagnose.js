// api/diagnose.js
import fetch from 'node-fetch';

export const config = {
  // Vercel 默认不需要特别配置，这里保留为示例
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 解析 body（index.html 以 application/json 发送）
    const { image, city } = req.body || {};

    if (!image || !city) {
      return res.status(400).json({ error: 'Missing image or city in request body' });
    }

    // 从环境变量读取你的 Coze 工作流 URL 和 Token（在 Vercel 设置）
    const COZE_WORKFLOW_URL = process.env.COZE_WORKFLOW_URL; // e.g. https://www.coze.cn/....
    const COZE_TOKEN = process.env.COZE_TOKEN; // 你的 secret token

    if (!COZE_WORKFLOW_URL || !COZE_TOKEN) {
      console.error('Missing COZE_WORKFLOW_URL or COZE_TOKEN env vars');
      return res.status(500).json({ error: 'Server not configured: COZE_WORKFLOW_URL or COZE_TOKEN missing' });
    }

    // --- 把请求转发到 Coze 工作流（示例采用 JSON POST） ---
    // 注意：我不知道你的工作流精确接受什么格式。如果它需要 multipart/form-data
    // 你需要把下面的请求体改成 form-data（使用 form-data 包生成）。
    // 下面的方式是把 image (data URL) 和 city 以 JSON 发送。
    const payload = {
      image,  // data URL: "data:image/jpeg;base64,....."
      city
    };

    const cozeResp = await fetch(COZE_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      // timeout etc. could be added if needed
    });

    // 如果后端返回非 2xx，抓取文本并返回 JSON（保证始终返回 JSON）
    if (!cozeResp.ok) {
      const text = await cozeResp.text();
      console.error('Coze workflow returned error:', cozeResp.status, text);
      return res.status(cozeResp.status).json({ error: 'Coze workflow error', details: text });
    }

    // 尝试解析 JSON；如果不是 JSON，也捕获并返回文本
    let cozeBody;
    try {
      cozeBody = await cozeResp.json();
    } catch (err) {
      const txt = await cozeResp.text();
      console.error('Coze returned non-JSON response:', txt);
      return res.status(500).json({ error: 'Coze returned non-JSON', details: txt });
    }

    // --- 这里你可以根据 Coze 的返回结构抽取我们想要给前端的字段 ---
    // 假设 cozeBody 里包含 { diagnosis: "...", extra: ... }
    // 如果你的工作流返回不同结构，请根据实际替换下面内容。
    return res.status(200).json({ success: true, coze: cozeBody });

  } catch (err) {
    console.error('Unhandled server error:', err && (err.stack || err.message || err));
    return res.status(500).json({ error: 'Internal server error', details: err && (err.message || String(err)) });
  }
}

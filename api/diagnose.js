// api/diagnose.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Only POST allowed' }));
  }

  // 读取原始请求体（避免不同运行环境下的自动解析差异）
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let body;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { imageBase64 } = body;
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

  // 请在 Vercel Dashboard 的 Environment Variables 中设置 COZE_TOKEN
  const COZE_TOKEN = process.env.COZE_TOKEN;
  if (!COZE_TOKEN) {
    return res.status(500).json({ error: 'Server not configured: missing COZE_TOKEN' });
  }

  try {
    // 调用 Coze 工作流（如果 Coze 要求的是 image URL 而非 base64，这里可能需要改为先上传图床）
    const resp = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: '7533122299790131236',
        parameters: {
          // 我们把 base64 直接传过去，工作流里的开始节点需要能接收 base64 字符串
          image_base64: imageBase64
        }
      })
    });

    const data = await resp.json();
    const statusCode = resp.ok ? 200 : 500;
    return res.status(statusCode).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Failed to call Coze', details: err.message });
  }
}

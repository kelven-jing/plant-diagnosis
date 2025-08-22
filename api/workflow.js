export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' });
  }

  try {
    const { position, picture } = req.body;

    const payload = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      space_id: process.env.COZE_SPACE_ID,
      parameters: { position, picture }
    };

    const response = await fetch('https://api.coze.com/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 直接把原始响应返回给前端
    return res.status(200).json({ raw: data });

  } catch (err) {
    console.error("workflow error:", err);
    return res.status(500).json({ error: err.message });
  }
}

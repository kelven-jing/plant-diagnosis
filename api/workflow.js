export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' });
  }

  try {
    const { position, picture } = req.body;

    const payload = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      parameters: {
        position,
        picture
      }
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
    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || 'Coze 调用失败');
    }

    let output = data.data?.output || data.data?.description || '无返回数据';
    return res.status(200).json({ output });
  } catch (err) {
    console.error("workflow error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' });
  }

  try {
    const { position, picture } = req.body;

    const payload = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      space_id: process.env.COZE_SPACE_ID,   // ✅ 必须带上
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

    // 灵活解析
    let outputText = '无返回数据';
    if (data.data) {
      if (data.data.output) {
        outputText = data.data.output;
      } else if (data.data.description) {
        outputText = data.data.description;
      } else if (typeof data.data === 'string') {
        outputText = data.data;
      } else if (Array.isArray(data.data) && data.data.length > 0) {
        outputText = data.data[0];
      }
    }

    return res.status(200).json({ output: outputText, raw: data });
  } catch (err) {
    console.error("workflow error:", err);
    return res.status(500).json({ error: err.message });
  }
}

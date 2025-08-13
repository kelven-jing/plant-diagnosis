export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, position } = req.body;

    if (!imageUrl || !position) {
      return res.status(400).json({ error: '缺少图片或位置信息' });
    }

    const response = await fetch(
      `https://api.coze.com/open_api/v2/workflow/run?workflow_id=${process.env.COZE_WORKFLOW_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: {
            picture: imageUrl, // 必须和 Coze 中字段名一致
            position: position // 必须和 Coze 中字段名一致
          }
        })
      }
    );

    // 尝试解析 Coze 响应
    const data = await response.json().catch(async () => {
      const text = await response.text();
      return { error: '非 JSON 响应', raw: text };
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Coze API 错误', details: data });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
}

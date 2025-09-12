export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { position, imageUrl } = req.body || {};
  if (!position || !imageUrl) {
    return res.status(400).json({ error: '缺少参数' });
  }

  try {
    const payload = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      space_id: process.env.COZE_SPACE_ID,
      parameters: {
        position: position,
        picture_url: imageUrl
      }
    };

    const cozeRes = await fetch(process.env.COZE_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await cozeRes.json();
    if (data.code !== 0) {
      throw new Error(data.msg || `Coze 错误 code=${data.code}`);
    }

    return res.status(200).json({ result: data.data?.output || '成功' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

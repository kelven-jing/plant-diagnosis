export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // 调用 Coze 工作流 API
    const response = await fetch("https://api.coze.cn/open_api/v2/workflow/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`
      },
      body: JSON.stringify({
        space_id: process.env.COZE_SPACE_ID, // ✅ 必须加
        workflow_id: process.env.COZE_WORKFLOW_ID, // ✅ 必须加
        parameters: {
          image: imageBase64
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

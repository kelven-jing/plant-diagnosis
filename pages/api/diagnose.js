export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, position } = req.body;

    // 检查必要参数
    if (!image || !position) {
      return res.status(400).json({ error: "缺少图片或位置信息" });
    }

    const response = await fetch("https://api.coze.cn/v1/workflow/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
      },
      body: JSON.stringify({
        workflow_id: process.env.COZE_WORKFLOW_ID,
        space_id: process.env.COZE_SPACE_ID, // 新增空间ID
        parameters: {
          picture: image,
          position: position
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Diagnose API error:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
}

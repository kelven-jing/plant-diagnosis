export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    // 从环境变量读取配置
    const apiKey = process.env.COZE_API_KEY;
    const workflowId = process.env.COZE_WORKFLOW_ID;
    const spaceId = process.env.COZE_SPACE_ID;

    if (!apiKey || !workflowId || !spaceId) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    // 直接用 Next.js 自带 fetch（避免 node-fetch ESM 报错）
    const response = await fetch("https://api.coze.com/open_api/v2/workflow/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        space_id: spaceId,
        parameters: {
          image_url: imageUrl,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Diagnosis error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

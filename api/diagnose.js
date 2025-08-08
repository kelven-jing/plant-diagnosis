import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, city } = req.body;

  if (!image || !city) {
    return res.status(400).json({ error: "Missing image or city data" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }

  try {
    const response = await fetch('https://gemini-api.example.com/diagnose', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: image, city: city })
    });

    // 检查 API 返回的状态
    if (!response.ok) {
      const errorResponse = await response.text(); // 获取 API 返回的错误信息（文本格式）
      console.error("API 错误返回：", errorResponse); // 打印错误内容
      return res.status(response.status).json({ error: "API 调用失败", details: errorResponse });
    }

    // 成功返回诊断信息
    const result = await response.json();
    return res.status(200).json({ diagnosis: result.diagnosis });
  } catch (error) {
    // 捕获并打印错误
    console.error("请求出错：", error.message);
    return res.status(500).json({ error: "内部服务器错误", details: error.message });
  }
}

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

    // 如果返回结果不是 2xx 状态码，强制返回 JSON 错误
    if (!response.ok) {
      const errorResponse = await response.text(); // 获取返回的错误信息（可能是非 JSON）
      console.error("API调用失败，返回内容：", errorResponse); // 打印返回内容
      return res.status(response.status).json({ error: "API 调用失败", details: errorResponse });
    }

    const result = await response.json(); // 解析返回的 JSON
    return res.status(200).json({ diagnosis: result.diagnosis });
  } catch (error) {
    // 打印错误详情，帮助排查问题
    console.error("请求出错：", error.message);
    return res.status(500).json({ error: "Internal error", details: error.message });
  }
}

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

    const result = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: result.message });
    }

    // 如果没有错误，返回诊断结果
    return res.status(200).json({ diagnosis: result.diagnosis });
  } catch (error) {
    // 捕获任何错误并返回 JSON 格式的错误信息
    return res.status(500).json({ error: "Internal error", details: error.message });
  }
}

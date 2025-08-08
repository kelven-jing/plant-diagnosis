import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const formData = new FormData();
  formData.append("image", req.body.image);

  // 从环境变量读取 API Key
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
      body: JSON.stringify({ image: req.body.image })
    });

    const result = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: result.message });
    }

    res.status(200).json({ diagnosis: result.diagnosis });
  } catch (error) {
    return res.status(500).json({ error: "Internal error", details: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' });
  }

  try {
    const { position, picture } = req.body;

    const payload = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      space_id: process.env.COZE_SPACE_ID,
      parameters: { position, picture }
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

    let outputText = '无返回数据';

    if (typeof data.data === 'string') {
      try {
        const inner = JSON.parse(data.data);

        // 🚩 支持多种字段名
        if (inner.output) {
          outputText = inner.output;
        } else if (inner.final_solution) {
          outputText = inner.final_solution;
        } else {
          // 万一以后变了，干脆把整个 JSON 打出来
          outputText = JSON.stringify(inner, null, 2);
        }

      } catch (e) {
        console.warn("二次解析失败:", e);
      }
    }

    return res.status(200).json({ output: outputText });

  } catch (err) {
    console.error("workflow error:", err);
    return res.status(500).json({ error: err.message });
  }
}

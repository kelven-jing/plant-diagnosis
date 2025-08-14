// pages/api/diagnose.js
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("🚀 [v3.0] API 接收到请求");

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const position = fields.position?.[0] || "";
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    console.log("📌 收到字段：", fields);
    console.log("📌 文件信息：", file);

    // 转成 base64
    const fileBuffer = fs.readFileSync(file.filepath);
    const base64Data = `data:${file.mimetype};base64,${fileBuffer.toString("base64")}`;

    // 调用 Coze API
    const cozeRes = await fetch("https://api.coze.cn/open_api/workflow/execute", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: process.env.COZE_WORKFLOW_ID,
        space_id: process.env.COZE_SPACE_ID,
        execute_mode: 2,
        parameters: {
          picture: base64Data,
          position: position,
        },
      }),
    });

    const cozeData = await cozeRes.json();
    console.log("📦 Coze 返回：", cozeData);

    res.status(200).json(cozeData);
  } catch (err) {
    console.error("❌ 处理出错：", err);
    res.status(500).json({ error: err.message });
  }
}

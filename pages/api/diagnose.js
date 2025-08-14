import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析表单
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log("📌 收到字段:", fields);
    console.log("📌 收到文件:", files);

    // 确保文件路径存在
    const imageFile = files.image?.[0] || files.image || files["图片"];
    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ error: "未收到有效的图片文件" });
    }

    // 读取文件并转 Base64
    const imageData = fs.readFileSync(imageFile.filepath, { encoding: "base64" });

    // 调用 Coze API
    const cozeResponse = await fetch("https://api.coze.cn/v1/workflow/run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        space_id: process.env.COZE_SPACE_ID,
        workflow_id: process.env.COZE_WORKFLOW_ID,
        parameters: {
          position: fields.position || "",
          image: `data:${imageFile.mimetype};base64,${imageData}`
        }
      }),
    });

    const result = await cozeResponse.json();
    console.log("✅ Coze 返回:", result);

    res.status(200).json(result);

  } catch (error) {
    console.error("❌ 后端处理出错:", error);
    res.status(500).json({ error: error.message });
  }
}

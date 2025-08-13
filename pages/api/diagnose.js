import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

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
    const form = new formidable.IncomingForm({ uploadDir: "/tmp", keepExtensions: true });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    if (!files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!fields.position || !fields.position[0]) {
      return res.status(400).json({ error: "Position is required" });
    }

    const imageFilePath = files.image.filepath || files.image[0]?.filepath;

    // 构建 Coze API 请求
    const formData = new FormData();
    formData.append("workflow_id", process.env.COZE_WORKFLOW_ID);
    formData.append("space_id", process.env.COZE_SPACE_ID);

    // Coze 要求参数名必须和 Workflow 输入变量一致
    formData.append("picture", fs.createReadStream(imageFilePath)); // 对应 picture
    formData.append("position", fields.position[0]); // 对应 position

    const cozeResponse = await fetch("https://api.coze.com/open_api/v2/workflow/execute", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COZE_API_KEY}`,
      },
      body: formData,
    });

    const data = await cozeResponse.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Diagnose API error:", err);
    res.status(500).json({ error: err.message });
  }
}

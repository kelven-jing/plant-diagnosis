// pages/api/diagnose.js

export const config = {
  api: {
    bodyParser: false, // 用于处理图片上传
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析表单数据（包含图片和文字）
    const form = formidable({ multiples: false });
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { position } = data.fields;
    const imageFile = data.files.image;

    if (!imageFile) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!position || position.trim() === "") {
      return res.status(400).json({ error: "No position provided" });
    }

    // 读取图片文件并转为 base64
    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");

    // 请求 Coze API
    const COZE_API_URL = "https://api.coze.cn/open_api/v2/workflow/execute";
    const response = await fetch(COZE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workflow_id: process.env.WORKFLOW_ID,
        space_id: process.env.SPACE_ID, // ✅ 加上 space_id
        parameters: {
          position: position,
          image_base64: base64Image
        }
      })
    });

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

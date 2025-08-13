// pages/api/diagnose.js

export const config = {
  api: {
    bodyParser: false, // 禁用默认解析，方便处理图片
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析表单数据
    const form = formidable({ multiples: false });
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { position } = data.fields;
    const picture = data.files.picture;

    if (!picture) {
      return res.status(400).json({ error: "Missing picture" });
    }

    // 读取图片
    const imageBuffer = fs.readFileSync(picture.filepath);
    const base64Image = imageBuffer.toString("base64");

    // 调试打印发送前的数据
    console.log("Sending to Coze API:", {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      space_id: process.env.COZE_SPACE_ID,
      position,
      picture: "image_base64_data",
    });

    // 调用 Coze API
    const response = await fetch("https://api.coze.cn/open_api/v2/workflow/execute", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: process.env.COZE_WORKFLOW_ID,
        space_id: process.env.COZE_SPACE_ID,
        parameters: {
          "input.picture": `data:image/jpeg;base64,${base64Image}`, // 按 Coze 要求的命名
          "input.position": position || "",
        },
      }),
    });

    const text = await response.text();
    console.log("Coze API raw response:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON from Coze", raw: text });
    }

    res.status(response.status).json(result);
  } catch (error) {
    console.error("Diagnose API error:", error);
    res.status(500).json({ error: error.message });
  }
}

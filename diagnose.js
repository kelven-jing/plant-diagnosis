// api/diagnose.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // 让 formidable 来解析 multipart/form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "文件解析失败" });
    }

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "没有上传图片" });
    }

    try {
      // 读取图片转 Base64
      const imageData = fs.readFileSync(imageFile.filepath, { encoding: "base64" });

      // 调用扣子工作流 API
      const response = await fetch("https://api.coze.cn/open_api/v2/workflow/run", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 你的API_KEY", // ⚠️ 这里替换成你自己的 API Key
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workflow_id: "你的工作流ID", // ⚠️ 这里替换成你的扣子工作流 ID
          parameters: {
            image_base64: imageData
          }
        })
      });

      const data = await response.json();

      // 返回诊断结果
      res.status(200).json({ result: data?.data?.output || JSON.stringify(data) });

    } catch (error) {
      res.status(500).json({ error: "调用 AI 接口失败", details: error.message });
    }
  });
}

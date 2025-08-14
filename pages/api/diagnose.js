// pages/api/diagnose.js

export const config = {
  api: {
    bodyParser: false, // 禁用默认 body 解析，方便处理文件
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  console.log("📩 请求到达 /api/diagnose");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp";
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ 表单解析失败", err);
      return res.status(500).json({ error: "表单解析失败" });
    }

    console.log("📌 收到字段：", fields);

    const position = fields.position?.[0] || "未知位置";
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "缺少图片文件" });
    }

    console.log("📌 文件信息：", {
      path: file.filepath,
      mimetype: file.mimetype,
      size: file.size,
      originalFilename: file.originalFilename,
    });

    // 读取并转 Base64
    const imageBase64 = fs.readFileSync(file.filepath, { encoding: "base64" });
    const base64DataUrl = `data:${file.mimetype};base64,${imageBase64}`;

    // 发给 Coze API（注意 URL 必须是 API 地址）
    const payload = {
      workflow_id: process.env.COZE_WORKFLOW_ID,
      space_id: process.env.COZE_SPACE_ID,
      execute_mode: 2,
      parameters: {
        picture: base64DataUrl,
        position: position,
      },
    };

    console.log("➡️ 发送到 Coze 的 JSON：", payload);

    try {
      const cozeRes = await fetch("https://api.coze.cn/open_api/workflow/execute", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await cozeRes.json();
      console.log("✅ Coze 返回：", data);

      res.status(200).json(data);
    } catch (error) {
      console.error("❌ 调用 Coze 出错：", error);
      res.status(500).json({ error: "调用 Coze 出错" });
    }
  });
}

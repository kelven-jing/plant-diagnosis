// pages/api/diagnose.js
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("🚀 v2.1 API 接收到请求");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ 解析表单失败：", err);
        return res.status(500).json({ error: "解析表单失败" });
      }

      const position = fields.position?.[0] || "未知位置";
      const file = files.picture?.[0];

      console.log("📌 收到字段：", fields);
      console.log("📌 文件信息：", file);

      // 读取文件并转为 Base64
      const fileData = fs.readFileSync(file.filepath);
      const base64Image = `data:${file.mimetype};base64,${fileData.toString("base64")}`;

      // 发送到 Coze
      const payload = {
        workflow_id: process.env.COZE_WORKFLOW_ID,
        space_id: process.env.COZE_SPACE_ID,
        execute_mode: 2,
        parameters: {
          picture: base64Image,
          position: position,
        },
      };

      console.log("➡️ 发送到 Coze 的 JSON：", payload);

      const response = await fetch("https://api.coze.cn/open_api/workflow/execute", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Coze 返回异常：", response.status, errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      console.log("✅ Coze 返回数据：", data);
      res.status(200).json(data);
    });
  } catch (e) {
    console.error("❌ 服务器错误：", e);
    res.status(500).json({ error: e.message });
  }
}

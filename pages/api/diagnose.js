export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json({
    sentence: "测试成功",
    solution: "API 正常工作"
  });
}
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    uploadDir: "/tmp", // 关键：Vercel 无服务器函数的可写目录
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse error", details: err.message });
    }

    try {
      console.log("fields:", fields);
      console.log("files:", files);
      console.log("COZE_WORKFLOW_URL:", process.env.COZE_WORKFLOW_URL);
      console.log("COZE_API_KEY:", process.env.COZE_API_KEY ? "已设置" : "未设置");

      const formData = new FormData();
      formData.append("picture", fs.createReadStream(files.picture.filepath));
      formData.append("position", fields.position);

      const response = await fetch(process.env.COZE_WORKFLOW_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      res.status(200).json({
        sentence: data.sentence || "未返回诊断",
        solution: data.solution || "未返回方案",
      });
    } catch (error) {
      console.error("❌ API diagnose 出错：", error);
      res.status(500).json({
        error: "Server error",
        message: error.message,
        stack: error.stack,
      });
    }
  });
}

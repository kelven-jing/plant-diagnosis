// pages/api/diagnose.js
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // 必须禁用 bodyParser 才能处理 FormData
  },
};

export default async function handler(req, res) {
  console.log("📩 请求到达 /api/diagnose");

  if (req.method !== "POST") {
    console.log("❌ 错误的请求方法:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ 解析 FormData 出错:", err);
      return res.status(500).json({ error: "文件解析失败" });
    }

    console.log("📌 收到字段:", fields);
    console.log("📌 收到文件:", files);

    try {
      const pictureFile = files.picture;
      if (!pictureFile) {
        console.error("❌ 没有接收到图片文件");
        return res.status(400).json({ error: "缺少图片文件" });
      }

      // 兼容 Vercel 运行时路径
      const filePath = pictureFile.filepath || pictureFile.path;
      const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

      console.log("🚀 开始请求 Coze API");

      const cozeRes = await fetch("https://api.coze.cn/v1/workflow/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          space_id: process.env.COZE_SPACE_ID,
          workflow_id: process.env.COZE_WORKFLOW_ID,
          parameters: {
            picture: `data:image/jpeg;base64,${base64Image}`,
            position: fields.position || "",
          },
        }),
      });

      const text = await cozeRes.text(); // 先拿原始返回，方便调试
      console.log("📩 Coze API 原始返回:", text);

      let cozeData;
      try {
        cozeData = JSON.parse(text);
      } catch (parseErr) {
        console.error("❌ 解析 Coze API 返回 JSON 出错:", parseErr);
        return res.status(500).json({ error: "Coze 返回数据解析失败", raw: text });
      }

      res.status(200).json(cozeData);
    } catch (error) {
      console.error("❌ 后端处理出错:", error);
      res.status(500).json({ error: "诊断失败" });
    }
  });
}

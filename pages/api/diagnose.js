import fs from "fs";
import formidable from "formidable";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // 关闭默认 JSON 解析，支持文件上传
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("📩 请求到达 /api/diagnose");

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ 解析表单失败:", err);
      return res.status(500).json({ error: "文件解析失败" });
    }

    console.log("📌 收到字段：", fields);
    console.log("📌 收到文件:", files);

    try {
      let pictureFile = Array.isArray(files.picture)
        ? files.picture[0]
        : files.picture;

      // 兼容新版 formidable（Vercel）
      const filePath = pictureFile?.filepath || pictureFile?.path;
      if (!filePath) {
        console.error("❌ 无法解析文件路径，收到:", pictureFile);
        return res.status(500).json({ error: "文件路径解析失败" });
      }

      const base64Image = fs.readFileSync(filePath, { encoding: "base64" });
      const position = Array.isArray(fields.position)
        ? fields.position[0]
        : fields.position;

      // 🔹 HuggingFace API 调用（记得替换 Space ID）
      const HF_API_URL = `https://api-inference.huggingface.co/models/你的SpaceID`;
      const HF_API_KEY = process.env.HF_API_KEY;

      const payload = {
        inputs: {
          image: base64Image,
          location: position,
        },
      };

      const hfRes = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const hfData = await hfRes.json();
      return res.status(200).json(hfData);
    } catch (error) {
      console.error("❌ 后端处理出错：", error);
      return res.status(500).json({ error: "诊断失败，请稍后重试" });
    }
  });
}

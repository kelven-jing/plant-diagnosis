export const config = {
  api: { bodyParser: false },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "文件解析失败" });

    try {
      const filePath = files.file.filepath;
      const imageBuffer = fs.readFileSync(filePath);

      // 调用 HuggingFace API（替换成你要的模型）
      const hfRes = await fetch(
        "https://api-inference.huggingface.co/models/username/plant-disease",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
          body: imageBuffer,
        }
      );

      const hfData = await hfRes.json();
      res.status(200).json({ result: hfData[0]?.label || "未识别" });
    } catch (e) {
      res.status(500).json({ error: "诊断失败" });
    }
  });
}

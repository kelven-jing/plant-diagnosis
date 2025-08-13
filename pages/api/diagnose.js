console.log("🚀 diagnose API v2.1 loaded");
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
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse error", details: err.message });
    }

    try {
      console.log("fields:", fields);
      console.log("files:", files);

      // 取第一个文件
      let uploadedFile = Array.isArray(files.picture)
        ? files.picture[0]
        : files.picture;

      if (!uploadedFile || !uploadedFile.filepath) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const formData = new FormData();
      formData.append("picture", fs.createReadStream(uploadedFile.filepath));

      // 保证 position 是字符串
      let positionValue = Array.isArray(fields.position)
        ? fields.position[0]
        : fields.position;
      formData.append("position", positionValue || "");

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
      });
    }
  });
}

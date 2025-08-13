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
    uploadDir: "/tmp", // Vercel 临时目录
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse error", details: err.message });
    }

    try {
      console.log("fields:", fields);
      console.log("files:", files);

      // 兼容数组和单文件
      const pictureFile = Array.isArray(files.picture) ? files.picture[0] : files.picture;
      if (!pictureFile || !pictureFile.filepath) {
        throw new Error("未收到图片文件");
      }

      const formData = new FormData();
      formData.append("workflow_id", process.env.COZE_WORKFLOW_ID);
      formData.append("parameters", JSON.stringify({
        position: fields.position,
        // Coze API 图片参数用 base64 或 multipart
      }));
      formData.append("file", fs.createReadStream(pictureFile.filepath));

      const response = await fetch("https://api.coze.cn/v1/workflow/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Coze API response:", data);

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

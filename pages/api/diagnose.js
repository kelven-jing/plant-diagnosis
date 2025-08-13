import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ uploadDir: "/tmp", keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse error", details: err.message });
    }

    try {
      // 读取上传的图片
      const imageBuffer = fs.readFileSync(files.picture.filepath);

      // 直接调用 Coze 官方 API
      const response = await fetch("https://api.coze.cn/open_api/v2/workflow/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow_id: process.env.COZE_WORKFLOW_ID,
          parameters: {
            position: fields.position,
            // 把图片转成 base64 传过去
            picture: `data:${files.picture.mimetype};base64,${imageBuffer.toString("base64")}`,
          },
        }),
      });

      const data = await response.json();
      console.log("Coze API 返回：", data);

      res.status(200).json({
        sentence: data?.data?.output?.sentence || "未返回诊断",
        solution: data?.data?.output?.solution || "未返回方案",
      });

    } catch (error) {
      console.error("❌ API diagnose 出错：", error);
      res.status(500).json({ error: "Server error", message: error.message });
    }
  });
}

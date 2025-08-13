import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // 必须禁用 bodyParser
  },
};

export default async function handler(req, res) {
  console.log("📩 请求到达 /api/diagnose");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ FormData 解析失败:", err);
      return res.status(500).json({ error: "文件解析失败" });
    }

    console.log("📌 收到字段:", fields);
    console.log("📌 收到文件:", files);

    try {
      // 兼容数组或对象
      let pictureFile = Array.isArray(files.picture)
        ? files.picture[0]
        : files.picture;

      if (!pictureFile) {
        return res.status(400).json({ error: "缺少图片文件" });
      }

      const filePath = pictureFile.filepath || pictureFile.path;
      if (!filePath) {
        return res.status(500).json({ error: "文件路径解析失败" });
      }

      // 读取图片转 base64
      const base64Image = fs.readFileSync(filePath, { encoding: "base64" });

      console.log("🚀 调用 Coze API");
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
            picture: `data:image/png;base64,${base64Image}`,
            position: fields.position || "",
          },
        }),
      });

      const text = await cozeRes.text();
      console.log("📩 Coze API 原始返回:", text);

      let cozeData;
      try {
        cozeData = JSON.parse(text);
      } catch (parseErr) {
        console.error("❌ Coze JSON 解析失败:", parseErr);
        return res.status(500).json({ error: "Coze 返回解析失败", raw: text });
      }

      res.status(200).json(cozeData);
    } catch (error) {
      console.error("❌ 后端出错:", error);
      res.status(500).json({ error: "诊断失败" });
    }
  });
}

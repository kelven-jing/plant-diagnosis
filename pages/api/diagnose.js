import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // 必须关闭，否则无法接收 FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "文件解析失败" });
    }

    try {
      const picturePath = files.picture.filepath;
      const position = fields.position;

      // 转 base64
      const base64Image = fs.readFileSync(picturePath, { encoding: "base64" });

      // 调用 Coze 工作流
      const cozeRes = await fetch("https://api.coze.cn/v1/workflow/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          space_id: process.env.COZE_SPACE_ID, // 你的 Space ID
          workflow_id: process.env.COZE_WORKFLOW_ID, // 工作流 ID
          parameters: {
            picture: `data:image/jpeg;base64,${base64Image}`, // 对应工作流 picture
            position: position, // 对应工作流 position
          },
        }),
      });

      const cozeData = await cozeRes.json();
      res.status(200).json(cozeData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "诊断失败" });
    }
  });
}

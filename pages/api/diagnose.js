export const config = { api: { bodyParser: false } };

import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持 POST 请求" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "解析表单失败" });
    }

    const position = fields.city;
    const imageFile = files.image;

    if (!position || !imageFile) {
      return res.status(400).json({ error: "缺少图片或城市" });
    }

    try {
      // 1. 上传图片到扣子
      const uploadForm = new FormData();
      uploadForm.append("file", fs.createReadStream(imageFile.filepath), imageFile.originalFilename);

      const uploadRes = await fetch("https://api.coze.cn/v1/files/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.COZE_PAT}` },
        body: uploadForm,
      });

      const uploadJson = await uploadRes.json();
      const fileId = uploadJson?.data?.id || uploadJson?.data?.file_id;
      if (!uploadRes.ok || !fileId) {
        return res.status(500).json({ error: "图片上传失败", detail: uploadJson });
      }

      // 2. 调用工作流
      const payload = {
        workflow_id: process.env.COZE_WORKFLOW_ID,
        parameters: {
          picture: JSON.stringify({ file_id: fileId }), // Image 类型必须这样传
          position, // 城市
        },
      };
      if (process.env.COZE_BOT_ID) payload.bot_id = process.env.COZE_BOT_ID;

      const runRes = await fetch("https://api.coze.cn/v1/workflow/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const runJson = await runRes.json();
      if (!runRes.ok || runJson?.code !== 0) {
        return res.status(500).json({ error: "工作流调用失败", detail: runJson });
      }

      // 3. 提取输出
      let sentence = "";
      let solution = "";
      try {
        const parsed = typeof runJson.data === "string" ? JSON.parse(runJson.data) : runJson.data;
        sentence = parsed?.sentence || "";
        solution = parsed?.solution || "";
      } catch {
        console.warn("输出不是标准 JSON", runJson.data);
      }

      res.status(200).json({ sentence, solution });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "服务器错误" });
    }
  });
}

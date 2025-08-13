import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 读取环境变量
  const COZE_API_KEY = process.env.COZE_API_KEY;
  const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID;
  const COZE_SPACE_ID = process.env.COZE_SPACE_ID;

  if (!COZE_API_KEY || !COZE_WORKFLOW_ID || !COZE_SPACE_ID) {
    return res.status(500).json({ error: "Missing Coze environment variables" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ 表单解析错误：", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    try {
      const location = fields.location ? fields.location[0] : "";
      const imageFile = files.image ? files.image[0] : null;

      if (!imageFile) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // 组装表单数据
      const formData = new FormData();
      formData.append("parameters", JSON.stringify({ location }));
      formData.append("file", fs.createReadStream(imageFile.filepath));

      const workflowUrl = `https://api.coze.cn/v1/workflow/run?workflow_id=${COZE_WORKFLOW_ID}&space_id=${COZE_SPACE_ID}`;

      const cozeRes = await fetch(workflowUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COZE_API_KEY}`,
        },
        body: formData,
      });

      const data = await cozeRes.json();
      console.log("✅ Coze API response:", data);

      res.status(200).json(data);
    } catch (error) {
      console.error("❌ API diagnose 出错：", error);
      res.status(500).json({ error: error.message });
    }
  });
}

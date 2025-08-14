// pages/api/diagnose.js
import fs from "fs";
import formidable from "formidable";
import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // 用 formidable 解析 multipart/form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析前端上传的表单
    const form = new formidable.IncomingForm();
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { position } = data.fields; // 手动输入城市名
    const imageFile = data.files.image;

    if (!imageFile || !position) {
      return res.status(400).json({ error: "Missing image or position" });
    }

    // 转成 base64
    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");

    // 从环境变量获取 Space 和 Workflow 信息
    const spaceId = process.env.COZE_SPACE_ID;       // 你的 Space ID
    const workflowId = process.env.COZE_WORKFLOW_ID; // 你的 Workflow ID
    const token = process.env.COZE_API_TOKEN;        // API Token

    // 组装 API 请求参数
    const formData = new FormData();
    formData.append("space_id", spaceId);
    formData.append("workflow_id", workflowId);
    formData.append(
      "inputs",
      JSON.stringify({
        position: position,
        image: base64Image,
      })
    );

    // 调用 Coze 工作流
    const response = await fetch("https://api.coze.cn/open_api/v2/workflow/execute", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error("诊断错误:", error);
    res.status(500).json({ error: "Server error" });
  }
}

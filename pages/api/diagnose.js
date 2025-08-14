const formidable = require("formidable");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

export const config = {
  api: {
    bodyParser: false // 用 formidable 解析 multipart
  }
};

// 上传到 Coze，返回 file_id
async function uploadToCoze(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const res = await fetch("https://api.coze.cn/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COZE_API_KEY}`,
      ...form.getHeaders()
    },
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`上传失败 ${res.status}: ${JSON.stringify(data)}`);
  }
  if (!data?.id) {
    throw new Error(`上传响应缺少 id: ${JSON.stringify(data)}`);
  }
  return data.id;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 基础校验：环境变量
  for (const k of ["COZE_API_KEY", "COZE_WORKFLOW_ID", "COZE_SPACE_ID"]) {
    if (!process.env[k]) {
      return res.status(500).json({ error: `缺少环境变量 ${k}` });
    }
  }

  const form = formidable({ multiples: false, maxFileSize: 20 * 1024 * 1024 }); // 20MB

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(400).json({ error: "表单解析失败", detail: String(err) });
      }

      const file =
        (Array.isArray(files.picture) ? files.picture[0] : files.picture) || null;
      if (!file || !file.filepath) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // 兜底 position，避免工作流必填为空
      const position =
        (Array.isArray(fields.position) ? fields.position[0] : fields.position) ||
        "未填写";

      // 1) 先上传文件获取 file_id
      const fileId = await uploadToCoze(file.filepath);

      // 2) 调用工作流，picture 传 file_id
      const payload = {
        workflow_id: process.env.COZE_WORKFLOW_ID,
        space_id: process.env.COZE_SPACE_ID,
        parameters: {
          picture: fileId,
          position
        }
      };

      const wfRes = await fetch("https://api.coze.cn/v1/workflow/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await wfRes.json();

      // 统一把 Coze 返回转发给前端，方便调试
      if (!wfRes.ok) {
        return res.status(wfRes.status).json(data);
      }
      return res.status(200).json(data);
    } catch (e) {
      console.error("API Error:", e);
      return res.status(500).json({ error: "服务器内部错误", detail: String(e) });
    } finally {
      // 尽量清理临时文件
      try {
        const f =
          (Array.isArray(files?.picture) ? files.picture[0] : files?.picture) ||
          null;
        if (f?.filepath && fs.existsSync(f.filepath)) fs.unlinkSync(f.filepath);
      } catch (_) {}
    }
  });
}

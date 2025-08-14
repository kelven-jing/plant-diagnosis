// pages/api/diagnose.js
import fs from "node:fs";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,          // 由 formidable 解析 multipart
  },
};

const COZE_API_KEY = process.env.COZE_API_KEY;
const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID;
const COZE_SPACE_ID = process.env.COZE_SPACE_ID;

// ✅ Coze 工作流执行 API（中国站）——采用 JSON，而不是 multipart
const COZE_WORKFLOW_EXEC_URL = "https://api.coze.cn/open_api/v2/workflow/execute";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 基本环境变量校验
  if (!COZE_API_KEY || !COZE_WORKFLOW_ID || !COZE_SPACE_ID) {
    return res.status(500).json({
      error: "Missing env",
      detail: {
        COZE_API_KEY: !!COZE_API_KEY,
        COZE_WORKFLOW_ID: !!COZE_WORKFLOW_ID,
        COZE_SPACE_ID: !!COZE_SPACE_ID,
      },
    });
  }

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = new IncomingForm({
        multiples: false,
        keepExtensions: true,
        maxFileSize: 8 * 1024 * 1024, // 8MB
      });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // 取位置（可能是数组）
    const position =
      Array.isArray(fields.position) ? fields.position[0] : (fields.position || "").toString();

    // 取图片（formidable v3 里同名字段会是数组）
    let file = files.picture;
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      return res.status(400).json({ error: "缺少图片文件字段 picture" });
    }

    // 兼容 v2/v3：filepath 或 path
    const filepath = file.filepath || file.path;
    if (!filepath) {
      return res.status(500).json({ error: "无法访问上传文件的临时路径" });
    }

    // 读文件 → base64 → DataURL
    const buf = fs.readFileSync(filepath);
    const mime = file.mimetype || "image/jpeg";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

    // ====== 关键点：用 JSON 调 Coze Workflow ======
    // 变量名必须与工作流开始节点完全一致：picture（Image），position（String）
    const payload = {
      workflow_id: COZE_WORKFLOW_ID,
      space_id: COZE_SPACE_ID,
      execute_mode: 2, // 同步
      parameters: {
        picture: dataUrl,   // Image 类型可直接传 DataURL（base64）
        position: position
      }
    };

    console.log("📩 请求到达 /api/diagnose");
    console.log("📌 收到字段：", fields);
    console.log("📌 文件信息：", {
      filepath,
      mimetype: file.mimetype,
      size: file.size,
      originalFilename: file.originalFilename
    });
    console.log("➡️ 发送到 Coze 的 JSON：", {
      ...payload,
      parameters: {
        ...payload.parameters,
        picture: "[base64-data-url]"
      }
    });

    const cozeResp = await fetch(COZE_WORKFLOW_EXEC_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COZE_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const cozeJson = await cozeResp.json().catch(() => ({}));

    // Coze 自身的错误（例如 4000 缺参）直接透传，方便排查
    if (!cozeResp.ok || cozeJson.code) {
      console.error("❌ Coze 返回异常：", cozeResp.status, cozeJson);
      return res.status(200).json(cozeJson);
    }

    // 成功时，把你需要的 sentence / solution 尝试抽出来
    // 不同工作流输出结构可能不同，这里尽量从常见位置归并
    let sentence = "";
    let solution = "";

    // 1) 如果你的工作流“结束”节点是“返回变量”，一般会在 data.output 或 data.variables 里
    // 下面是比较宽松的抽取，保证不丢
    const raw = cozeJson?.data || cozeJson;

    // 常见位置尝试
    if (raw?.output?.sentence) sentence = raw.output.sentence;
    if (raw?.output?.solution) solution = raw.output.solution;

    if (!sentence || !solution) {
      // 看 variables
      const v = raw?.variables || raw?.result || raw?.data;
      if (v) {
        if (!sentence) sentence = v.sentence || v.sentences || "";
        if (!solution) solution = v.solution || v.solutions || "";
      }
    }

    return res.status(200).json({
      ok: true,
      sentence,
      solution,
      // 也把原始返回带上，方便你调试
      raw: cozeJson,
    });
  } catch (err) {
    console.error("❌ 后端处理出错：", err);
    return res.status(500).json({ error: "诊断失败", detail: String(err?.stack || err) });
  }
}

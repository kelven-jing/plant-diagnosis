export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb" // 避免图片过大被截断
    }
  }
};

function buildPicturePayload(image) {
  // image 可为 dataURL / 纯base64 / http(s) URL
  if (typeof image !== "string" || !image.length) {
    throw new Error("图片数据为空");
  }

  // 外链 URL
  if (/^https?:\/\//i.test(image)) {
    return { type: "image_url", url: image };
  }

  // dataURL: data:image/png;base64,XXXX
  if (image.startsWith("data:")) {
    const [header, b64] = image.split(",");
    const match = header.match(/^data:(.+);base64$/i);
    const mime = match?.[1] || "image/png";
    return {
      type: "image_base64",
      mime_type: mime,
      data: b64
    };
  }

  // 纯 base64 字符串
  return {
    type: "image_base64",
    mime_type: "image/png",
    data: image
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { COZE_API_KEY, COZE_SPACE_ID, COZE_WORKFLOW_ID } = process.env;

  if (!COZE_API_KEY || !COZE_SPACE_ID || !COZE_WORKFLOW_ID) {
    return res.status(500).json({
      error:
        "Missing env vars: COZE_API_KEY / COZE_SPACE_ID / COZE_WORKFLOW_ID. 请在 Vercel 环境变量里补齐。"
    });
  }

  try {
    const { image, position } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    if (!position || typeof position !== "string") {
      return res.status(400).json({ error: "position 是必填字符串" });
    }

    const picture = buildPicturePayload(image);

    const payload = {
      space_id: COZE_SPACE_ID,
      workflow_id: COZE_WORKFLOW_ID,
      // 🚩严格按你的工作流：picture(Image) + position(String)
      parameters: {
        picture,
        position
      }
    };

    const cozeResp = await fetch(
      "https://api.coze.cn/open_api/v2/workflow/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COZE_API_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await cozeResp.json();

    // 把 Coze 的调试信息原样透传，方便在前端看到 debug_url
    if (!cozeResp.ok) {
      return res
        .status(cozeResp.status)
        .json({ error: data?.msg || "Coze 执行失败", ...data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("[diagnose] error:", err);
    return res.status(500).json({ error: err?.message || "Server Error" });
  }
}

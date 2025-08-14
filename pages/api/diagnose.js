import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // 关闭默认 body 解析，让 FormData 接收文件
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const busboy = await import("busboy");
  const bb = busboy.default({ headers: req.headers });

  let pictureBuffer = null;
  let position = "";

  bb.on("file", (name, file) => {
    const chunks = [];
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("end", () => {
      pictureBuffer = Buffer.concat(chunks);
    });
  });

  bb.on("field", (name, val) => {
    if (name === "position") {
      position = val;
    }
  });

  bb.on("finish", async () => {
    try {
      const form = new FormData();
      form.append(
        "inputs",
        JSON.stringify({
          picture: "data:image/jpeg;base64," + pictureBuffer.toString("base64"),
          position: position || "unknown",
        })
      );

      const response = await fetch(
        `https://api.coze.cn/v1/workflow/run?space_id=${process.env.COZE_SPACE_ID}&workflow_id=${process.env.COZE_WORKFLOW_ID}&execute_mode=sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.COZE_API_KEY}`,
          },
          body: form,
        }
      );

      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  req.pipe(bb);
}

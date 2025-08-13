import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parse error" });
    }

    try {
      const imagePath = files.picture?.filepath;
      if (!imagePath) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const imageStream = fs.createReadStream(imagePath);

      // 构造表单数据
      const formData = new FormData();
      formData.append("workflow_id", process.env.COZE_WORKFLOW_ID);
      formData.append("space_id", process.env.COZE_SPACE_ID);
      formData.append("picture", imageStream);
      formData.append("position", fields.position || "");

      console.log("Sending to Coze API:", {
        workflow_id: process.env.COZE_WORKFLOW_ID,
        space_id: process.env.COZE_SPACE_ID,
      });

      const cozeResponse = await fetch("https://api.coze.com/open_api/v2/workflow/execute", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
        },
        body: formData,
      });

      const text = await cozeResponse.text();
      console.log("Coze API raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({ error: "Invalid JSON from Coze API", raw: text });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("Diagnose API error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}

import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse error" });
    }

    try {
      const formData = new FormData();
      formData.append("picture", fs.createReadStream(files.picture.filepath));
      formData.append("position", fields.position);

      const response = await fetch(process.env.COZE_WORKFLOW_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COZE_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      res.status(200).json({
        sentence: data.sentence || "未返回诊断",
        solution: data.solution || "未返回方案",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

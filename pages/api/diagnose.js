import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // formidable 要禁用默认解析
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. 解析表单（获取图片和城市）
    const form = formidable();
    const [fields, files] = await form.parse(req);

    const city = fields.city[0];
    const imageFile = files.image[0];

    // 2. 上传到扣子 API
    const formData = new FormData();
    formData.append("picture", fs.createReadStream(imageFile.filepath));
    formData.append("position", city);

    const response = await fetch(process.env.COZE_WORKFLOW_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`, // 你的扣子 Token
      },
      body: formData,
    });

    const data = await response.json();

    // 3. 返回给前端
    return res.status(200).json({
      sentence: data.sentence,
      solution: data.solution,
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

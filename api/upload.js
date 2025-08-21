export const config = {
  api: {
    bodyParser: false, // 让 Vercel 不自动处理 multipart
  },
};

import formidable from "formidable";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.image[0];

    const fs = await import("fs");
    const data = fs.readFileSync(file.filepath);

    const formData = new FormData();
    formData.append('image', new Blob([data]));

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || '图床上传失败');
    }

    return res.status(200).json({ url: result.data.url });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({ error: err.message });
  }
}

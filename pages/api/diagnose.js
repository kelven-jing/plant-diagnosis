import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // 重要: 禁用默认 body 解析
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: '解析表单失败' });
    }

    const position = fields.position;
    const imageFile = files.image;

    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
      const imageData = fs.readFileSync(imageFile.filepath);
      const base64Image = `data:${imageFile.mimetype};base64,${imageData.toString('base64')}`;

      const response = await fetch('https://api.coze.cn/open_api/v2/workflow/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: process.env.COZE_WORKFLOW_ID,
          space_id: process.env.COZE_SPACE_ID,
          execute_mode: 2,
          parameters: {
            picture: base64Image,
            position: position
          },
        }),
      });

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Coze API 调用失败:', error);
      return res.status(500).json({ error: '调用 Coze API 失败' });
    }
  });
}

// pages/api/diagnose.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // 让 formidable 处理文件
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      }

      // 这里确保 name="picture"
      const file = files.picture?.[0] || files.picture;
      if (!file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const imageData = fs.readFileSync(file.filepath);
      const base64Image = `data:${file.mimetype};base64,${imageData.toString('base64')}`;

      // 调用 Coze 工作流 API
      const cozeRes = await fetch(`https://api.coze.cn/v1/workflow/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: process.env.COZE_WORKFLOW_ID,
          space_id: process.env.COZE_SPACE_ID,
          parameters: {
            picture: base64Image,
            position: fields.position || 'default',
          },
        }),
      });

      const data = await cozeRes.json();
      return res.status(200).json(data);
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

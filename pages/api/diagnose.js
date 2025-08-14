// pages/api/diagnose.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
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
        console.error('❌ 表单解析失败:', err);
        return res.status(500).json({ error: '文件上传失败' });
      }

      // 确保 name="picture"
      const file = files.picture?.[0] || files.picture;
      if (!file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // 转 base64
      const imageData = fs.readFileSync(file.filepath);
      const base64Image = `data:${file.mimetype};base64,${imageData.toString('base64')}`;

      // 调用 Coze API
      const cozeRes = await fetch('https://api.coze.cn/v1/workflow/run', {
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
            position: fields.position || '未填写',
          },
        }),
      });

      const data = await cozeRes.json();
      return res.status(200).json(data);
    });
  } catch (error) {
    console.error('❌ API 错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

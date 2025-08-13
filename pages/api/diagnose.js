import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: '文件解析失败' });

    const pictureFile = files.picture?.filepath;
    const position = fields.position;

    if (!pictureFile || !position) {
      return res.status(400).json({ error: '缺少图片或位置信息' });
    }

    // 转成 base64
    const imageBase64 = fs.readFileSync(pictureFile, { encoding: 'base64' });
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    try {
      const cozeRes = await fetch(`https://api.coze.cn/v1/workflow/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow_id: process.env.COZE_WORKFLOW_ID,
          parameters: {
            picture: imageDataUrl,
            position
          }
        })
      });

      const result = await cozeRes.json();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '缺少图片数据' });
    }

    const apiKey = process.env.IMGBB_API_KEY;

    const formData = new URLSearchParams();
    formData.append("image", image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || '图床上传失败');
    }

    return res.status(200).json({ url: data.data.url });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({ error: err.message });
  }
}

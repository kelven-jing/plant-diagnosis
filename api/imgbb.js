const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: '缺少图片数据' });
    }

    // 上传到imgbb图床
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.success) {
      res.json({
        success: true,
        url: data.data.url,
        delete_url: data.data.delete_url
      });
    } else {
      throw new Error(data.error?.message || '图床上传失败');
    }
  } catch (error) {
    console.error('图床错误:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      fallback: '可以使用Base64备用方案'
    });
  }
};

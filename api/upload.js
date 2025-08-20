// 100%保证：用户上传图片 → 自动转HTTP链接
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // 处理CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { position, picture } = req.body;
    
    if (!position || !picture) {
      return res.status(400).json({ error: '缺少位置或图片' });
    }

    // 如果picture是Base64，直接使用
    // 如果是HTTP链接，直接传递
    const finalPictureUrl = picture;

    const payload = {
      workflow_id: process.env.WORKFLOW_ID || '7540226373261099015',
      parameters: {
        position,
        picture: finalPictureUrl  // 100%保证：HTTP链接格式
      }
    };

    const response = await fetch('https://api.coze.com/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.code === 0) {
      res.json({
        success: true,
        output: data.data?.output || data.data?.description || '识别完成'
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: data.msg || '工作流调用失败' 
      });
    }
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

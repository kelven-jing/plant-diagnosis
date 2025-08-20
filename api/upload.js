// api/upload.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { position, picture } = req.body;
    
    if (!position || !picture) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 调用扣子工作流
    const payload = {
      workflow_id: process.env.WORKFLOW_ID || '7540226373261099015',
      parameters: {
        position,
        picture
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
        output: data.data?.output || data.data?.description || '无返回数据'
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

// api/upload.js - 支持图床URL和Base64双方案
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持POST请求' });
  }

  try {
    const { position, picture, type = 'base64' } = req.body;

    if (!position) {
      return res.status(400).json({ success: false, error: '缺少位置参数' });
    }

    if (!picture) {
      return res.status(400).json({ success: false, error: '缺少图片数据' });
    }

    console.log(`收到${type}格式图片，长度: ${picture.length}`);

    const payload = {
      workflow_id: '7540226373261099015',
      parameters: {
        position: position,
        picture: picture // 直接使用URL或Base64
      }
    };

    const response = await fetch('https://api.coze.com/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat_OcvqaM7quxhVPvzaTtoMYJ6MeyvQ7ZpytN6hLquNlxijXLiCBt8GvRAZ1wTqVUQf',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      output: data.data?.output || `植物识别完成 (${type}格式)`,
      debug: {
        type: type,
        pictureLength: picture.length
      }
    });

  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

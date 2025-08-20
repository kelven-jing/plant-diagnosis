const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 配置CORS
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 图片上传到图床
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传图片' });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      res.json({ 
        success: true, 
        url: data.data.url,
        delete_url: data.data.delete_url 
      });
    } else {
      throw new Error(data.error?.message || '上传失败');
    }
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ 
      error: error.message,
      fallback: '可以使用Base64备用方案'
    });
  }
});

// 调用扣子工作流
app.post('/workflow', async (req, res) => {
  try {
    const { position, picture } = req.body;
    
    if (!position || !picture) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const payload = {
      workflow_id: process.env.WORKFLOW_ID,
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
        output: data.data?.output || data.data?.description || '无返回数据',
        raw: data.data 
      });
    } else {
      throw new Error(data.msg || `工作流调用失败: ${data.code}`);
    }
  } catch (error) {
    console.error('工作流错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vercel Serverless适配
module.exports = app;

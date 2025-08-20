require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 验证环境变量
const requiredEnvVars = ['SPACE_ID', 'WORKFLOW_ID', 'COZE_API_KEY', 'IMGBB_API_KEY'];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`❌ 缺少环境变量: ${envVar}`);
        process.exit(1);
    }
});

// 配置
const CONFIG = {
    SPACE_ID: process.env.SPACE_ID,
    WORKFLOW_ID: process.env.WORKFLOW_ID,
    COZE_API_KEY: process.env.COZE_API_KEY,
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
    COZE_BASE_URL: 'https://api.coze.com/v1/workflow/run'
};

console.log('✅ 环境变量已加载:', {
    SPACE_ID: CONFIG.SPACE_ID,
    WORKFLOW_ID: CONFIG.WORKFLOW_ID,
    COZE_API_KEY: '***' + CONFIG.COZE_API_KEY.slice(-4),
    IMGBB_API_KEY: '***' + CONFIG.IMGBB_API_KEY.slice(-4)
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 图床上传API
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '未上传图片' });
        }

        const formData = new FormData();
        formData.append('image', new Blob([req.file.buffer]), req.file.originalname);

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${CONFIG.IMGBB_API_KEY}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
            res.json({ 
                success: true, 
                url: response.data.data.url,
                delete_url: response.data.data.delete_url 
            });
        } else {
            throw new Error(response.data.error?.message || '图床上传失败');
        }

    } catch (error) {
        console.error('图床错误:', error.message);
        // Base64备用方案
        const base64 = req.file.buffer.toString('base64');
        res.json({ 
            success: false, 
            url: `data:${req.file.mimetype};base64,${base64}`,
            error: error.message 
        });
    }
});

// 工作流调用API
app.post('/api/workflow', async (req, res) => {
    try {
        const { position, picture } = req.body;

        if (!position || !picture) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const payload = {
            workflow_id: CONFIG.WORKFLOW_ID,
            parameters: {
                position: position,
                picture: picture
            }
        };

        console.log('调用工作流:', {
            workflow_id: payload.workflow_id,
            space_id: CONFIG.SPACE_ID,
            position: position.substring(0, 20) + '...'
        });

        const response = await axios.post(CONFIG.COZE_BASE_URL, payload, {
            headers: {
                'Authorization': `Bearer ${CONFIG.COZE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);

    } catch (error) {
        console.error('工作流错误:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.msg || error.message 
        });
    }
});

// 获取配置信息
app.get('/api/config', (req, res) => {
    res.json({
        space_id: CONFIG.SPACE_ID,
        workflow_id: CONFIG.WORKFLOW_ID
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
});

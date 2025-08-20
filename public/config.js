// 环境配置
const CONFIG = {
  API_BASE: window.location.origin,
  API_ENDPOINTS: {
    UPLOAD: '/api/upload',
    WORKFLOW: '/api/workflow',
    HEALTH: '/api/health'
  }
};

// 检测部署环境
const isVercel = window.location.hostname.includes('vercel.app');
const isLocal = window.location.hostname === 'localhost';

// 基于API的完整前端实现
import CONFIG from './config.js';

class CozeWorkflowApp {
  constructor() {
    this.uploadedImageUrl = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkHealth();
  }

  setupEventListeners() {
    document.getElementById('pictureFile').addEventListener('change', this.handleImageUpload.bind(this));
    document.getElementById('submitBtn').addEventListener('click', this.handleSubmit.bind(this));
  }

  async checkHealth() {
    try {
      const response = await fetch(`${CONFIG.API_BASE}${CONFIG.API_ENDPOINTS.HEALTH}`);
      const data = await response.json();
      console.log('服务状态:', data);
    } catch (error) {
      console.error('服务检查失败:', error);
    }
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('preview');
    const status = document.getElementById('uploadStatus');

    if (!file) return;

    // 显示本地预览
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="预览图片">`;
    };
    reader.readAsDataURL(file);

    // 上传到服务器
    status.innerHTML = '⏳ 正在上传...';
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${CONFIG.API_BASE}${CONFIG.API_ENDPOINTS.UPLOAD}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        this.uploadedImageUrl = data.url;
        status.innerHTML = `✅ 上传成功: <a href="${data.url}" target="_blank">查看图片</a>`;
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      status.innerHTML = '❌ 上传失败，使用Base64备用方案...';
      
      // 备用方案：使用Base64
      const base64 = await this.fileToBase64(file);
      this.uploadedImageUrl = base64;
      status.innerHTML = '✅ 使用Base64备用方案';
    }
  }

  async handleSubmit() {
    const position = document.getElementById('position').value.trim();
    
    if (!position) {
      alert('请输入位置描述！');
      return;
    }

    if (!this.uploadedImageUrl) {
      alert('请上传植物图片！');
      return;
    }

    try {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('errorSection').style.display = 'none';

      const response = await fetch(`${CONFIG.API_BASE}${CONFIG.API_ENDPOINTS.WORKFLOW}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          position,
          picture: this.uploadedImageUrl
        })
      });

      const data = await response.json();
      
      if (data.success) {
        document.getElementById('resultText').textContent = data.output;
        document.getElementById('resultSection').style.display = 'block';
      } else {
        throw new Error(data.error || '工作流调用失败');
      }
    } catch (error) {
      console.error('工作流错误:', error);
      document.getElementById('errorMessage').textContent = error.message;
      document.getElementById('errorSection').style.display = 'block';
    } finally {
      document.getElementById('loading').style.display = 'none';
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new CozeWorkflowApp();
});

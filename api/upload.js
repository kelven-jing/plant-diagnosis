// 1. 修改图片选择事件 - 立即上传
document.getElementById('pictureFile').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    
    if (file) {
        // 显示本地预览
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="预览图片" style="max-width: 200px; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
        
        // 立即上传到图床
        uploadedImageUrl = await uploadToImgBB(file);
    } else {
        preview.innerHTML = '';
        uploadedImageUrl = null;
    }
});

// 2. 简化提交逻辑
async function submitWorkflow() {
    const position = document.getElementById('position').value.trim();
    
    if (!position) {
        alert('请输入位置描述！');
        return;
    }
    
    if (!uploadedImageUrl) {
        alert('请先上传植物图片！');
        return;
    }
    
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('errorSection').style.display = 'none';
        
        // 直接使用已上传的图片链接
        const result = await callCozeAPI(position, uploadedImageUrl);
        
        document.getElementById('resultText').textContent = result.description || result.output || '无返回数据';
        document.getElementById('resultSection').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorSection').style.display = 'block';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

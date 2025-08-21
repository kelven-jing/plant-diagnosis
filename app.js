// 把文件转成 base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // 去掉前缀
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 提交工作流
async function submitWorkflow() {
    const position = document.getElementById('position').value.trim();
    const pictureFile = document.getElementById('pictureFile').files[0];
    
    if (!position) {
        alert('请输入位置描述！');
        return;
    }
    if (!pictureFile) {
        alert('请上传植物图片！');
        return;
    }

    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('errorSection').style.display = 'none';

        // 1. 图片转 base64
        const base64Img = await fileToBase64(pictureFile);

        // 2. 上传到后端 /api/upload
        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Img })
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || '上传失败');

        const pictureUrl = uploadData.url;

        // 3. 调用工作流 API
        const response = await fetch('/api/workflow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position, picture: pictureUrl })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '工作流调用失败');

        document.getElementById('resultText').textContent = result.output;
        document.getElementById('resultSection').style.display = 'block';

    } catch (error) {
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorSection').style.display = 'block';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

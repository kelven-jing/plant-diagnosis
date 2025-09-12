document.getElementById('plantForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const position = document.getElementById('position').value.trim();
  const pictureFile = document.getElementById('pictureFile').files[0];

  if (!position || !pictureFile) {
    return alert('请填写完整信息！');
  }

  toggle('loading', true);
  toggle('errorSection', false);
  toggle('resultSection', false);

  try {
    // 上传图片到 GitHub
    const formData = new FormData();
    formData.append('file', pictureFile);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || '上传失败');
    const imageUrl = uploadData.url;

    // 调用 Coze 工作流
    const workflowRes = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position, imageUrl })
    });

    const workflowData = await workflowRes.json();
    if (!workflowRes.ok) throw new Error(workflowData.error || '工作流失败');

    document.getElementById('resultText').textContent =
      workflowData.result || '诊断完成';
    toggle('resultSection', true);

  } catch (err) {
    document.getElementById('errorMessage').textContent = err.message;
    toggle('errorSection', true);
  } finally {
    toggle('loading', false);
  }
});

function toggle(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
}

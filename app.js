async function submitWorkflow() {
  const position = document.getElementById('position').value.trim();
  const fileInput = document.getElementById('pictureFile');
  const errorSection = document.getElementById('errorSection');
  const errorMessage = document.getElementById('errorMessage');
  const resultSection = document.getElementById('resultSection');
  const resultText = document.getElementById('resultText');

  errorSection.style.display = 'none';
  resultSection.style.display = 'none';

  if (!position || fileInput.files.length === 0) {
    errorMessage.textContent = "请填写位置信息并上传图片。";
    errorSection.style.display = 'block';
    return;
  }

  // 上传图片（用 base64 简化）
  const file = fileInput.files[0];
  const base64 = await toBase64(file);

  document.getElementById('btnText').style.display = 'none';
  document.getElementById('btnLoading').style.display = 'inline';

  try {
    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ picture: base64, position })
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      let uiText = result.message || '请求失败，请稍后再试。';
      if (result.error === 'COZE_TOKEN_DEPLETED') {
        uiText = '⚠️ 服务额度已用尽，我们正在补充 AI 服务，请稍后再试。';
      }
      errorMessage.textContent = uiText;
      errorSection.style.display = 'block';
      return;
    }

    resultText.textContent = result.output || "（无结果）";
    resultSection.style.display = 'block';
  } catch (err) {
    errorMessage.textContent = "请求出错：" + err.message;
    errorSection.style.display = 'block';
  } finally {
    document.getElementById('btnText').style.display = 'inline';
    document.getElementById('btnLoading').style.display = 'none';
  }
}

// 图片转 base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

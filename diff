<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>植物诊断（演示）</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, "Microsoft Yahei", Arial; padding: 20px; max-width: 720px; margin: auto; }
    button { padding: 8px 12px; margin-left: 8px; }
    pre { background:#f4f4f4; padding:10px; overflow:auto; white-space:pre-wrap; }
  </style>
</head>
<body>
  <h1>植物照片诊断（演示）</h1>
  <p>选择一张植物照片（建议 ≤ 2MB），然后点击 “诊断”。</p>

  <input type="file" id="fileInput" accept="image/*">
  <button id="uploadBtn">诊断</button>
  <div id="status" style="margin-top:12px; color:#444"></div>

  <h3>诊断结果</h3>
  <pre id="result">还没有结果</pre>

  <script>
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const fileInput = document.getElementById('fileInput');
    const btn = document.getElementById('uploadBtn');
    const status = document.getElementById('status');
    const result = document.getElementById('result');

    btn.addEventListener('click', () => {
      const file = fileInput.files[0];
      if (!file) { alert('请先选择图片'); return; }
      if (file.size > MAX_SIZE) { alert('请上传小于 2MB 的图片'); return; }

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result; // data:image/xxx;base64,....
        status.innerText = '正在上传并诊断，请稍候...';
        result.innerText = '';

        try {
          const resp = await fetch('/api/diagnose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: dataUrl })
          });
          const body = await resp.json();
          if (!resp.ok) {
            status.innerText = '诊断请求出错（后端返回非 200）。';
            result.innerText = JSON.stringify(body, null, 2);
            return;
          }
          status.innerText = '诊断完成：';
          result.innerText = JSON.stringify(body, null, 2);
        } catch (e) {
          status.innerText = '请求失败：' + e.message;
        }
      };
      reader.readAsDataURL(file);
    });
  </script>
</body>
</html>

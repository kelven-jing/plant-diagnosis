// 图片预览
document.getElementById('pictureFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('preview');
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="预览图片" style="max-width: 200px; max-height: 200px;">`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '';
  }
});

// base64 转换
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 渲染结果（描述 + 卡片）
function renderResult(fullText) {
  const [descPart, carePart] = fullText.split('---');

  // 1. 描述
  document.getElementById('resultText').textContent = descPart.trim();

  // 2. 养护建议卡片
  const cardsContainer = document.getElementById('resultCards');
  cardsContainer.innerHTML = "";

  if (carePart) {
    const lines = carePart.split("\n").map(l => l.trim()).filter(l => l);

    lines.forEach(line => {
      if (/^[🌞💧🌿🍃✂️🐞🌡️🌼🍀]/.test(line)) {
        const cleanLine = line.replace(/\*\*/g, "");
        const [title, ...rest] = cleanLine.split("：");
        const content = rest.join("：").trim();

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<strong>${title}</strong>${content}`;
        cardsContainer.appendChild(card);
      }
    });
  }
}

// 📋 复制按钮逻辑
function copyCareTips() {
  const cards = document.querySelectorAll("#resultCards .card");
  if (cards.length === 0) {
    alert("没有可复制的养护建议！");
    return;
  }

  let textToCopy = "🌿 养护建议：\n\n";
  cards.forEach(card => {
    const title = card.querySelector("strong").innerText;
    const content = card.innerText.replace(title, "").trim();
    textToCopy += `${title}：${content}\n\n`;
  });

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("✅ 养护建议已复制到剪贴板！");
  }).catch(err => {
    console.error("复制失败:", err);
    alert("❌ 复制失败，请手动选择文字复制。");
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
    document.getElementById('resultSection').style.display = 'none';

    // 1. 图片转 base64
    const base64Img = await fileToBase64(pictureFile);

    // 2. 上传到 /api/upload
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Img })
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || '上传失败');

    const pictureUrl = uploadData.url;

    // 3. 调用工作流
    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position, picture: pictureUrl })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '工作流调用失败');

    // ✅ 渲染结果
    renderResult(result.output);
    document.getElementById('resultSection').style.display = 'block';

  } catch (error) {
    document.getElementById('errorMessage').textContent = error.message;
    document.getElementById('errorSection').style.display = 'block';
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

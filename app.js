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

  // 1. 描述区：自动分句换行
  const descBox = document.getElementById('resultText');
  descBox.innerHTML = "";
  if (descPart) {
    const descLines = descPart.split(/(?<=[。！!？\n])/).map(l => l.trim()).filter(l => l);
    descLines.forEach(line => {
      const p = document.createElement("p");
      p.textContent = line;
      descBox.appendChild(p);
    });
  }

  // 2. 卡片区
  const cardsContainer = document.getElementById('resultCards');
  cardsContainer.innerHTML = "";

  if (carePart) {
    const lines = carePart.split("\n").map(l => l.trim()).filter(l => l);

    let currentCard = null;
    let currentContent = [];

    lines.forEach(line => {
      if (/^[🌳🍃🌱☀️🌞💧✂️🐞🌡️🍀]/.test(line)) {
        if (currentCard) {
          currentCard.innerHTML = `<strong>${currentCard.dataset.title}</strong><div>${currentContent.join("<br>")}</div>`;
          cardsContainer.appendChild(currentCard);
        }
        const cleanLine = line.replace(/\*\*/g, "");
        const [title, ...rest] = cleanLine.split(/[:：]/);
        currentCard = document.createElement("div");
        currentCard.className = "card";
        currentCard.dataset.title = title.trim();
        currentContent = [rest.join("：").trim()];
      } else {
        if (currentCard) currentContent.push(line);
      }
    });

    if (currentCard) {
      currentCard.innerHTML = `<strong>${currentCard.dataset.title}</strong><div>${currentContent.join("<br>")}</div>`;
      cardsContainer.appendChild(currentCard);
    }
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

    const base64Img = await fileToBase64(pictureFile);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Img })
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || '上传失败');

    const pictureUrl = uploadData.url;

    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position, picture: pictureUrl })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '工作流调用失败');

    renderResult(result.output);
    document.getElementById('resultSection').style.display = 'block';

  } catch (error) {
    document.getElementById('errorMessage').textContent = error.message;
    document.getElementById('errorSection').style.display = 'block';
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

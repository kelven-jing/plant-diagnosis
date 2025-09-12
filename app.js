/******************************************************************** 
 *  AI植物医生 - GitHub 图床版
 *  上传图片 → GitHub → 返回 raw 链接 → 丢给 Coze 工作流
 *******************************************************************/

const COZE_CONFIG = {
  apiKey: "pat_x5qZkcUkmMbSW1bYkgr6kmtGVQdff5JLKIWnFddlDvRvaq0dkLYZ9FnXKFHyhBTN",
  workflowId: "7533122299790131236",
  spaceId: "7531597653369651209",
  baseUrl: "https://api.coze.cn/v1/workflow/run",
};

/* ---------- 提交主流程 ---------- */
window.submitWorkflow = async () => {
  const position = document.getElementById("position")?.value.trim();
  const pictureFile = document.getElementById("pictureFile")?.files[0];

  if (!position || !pictureFile) return alert("请填写完整信息！");

  toggle("loading", true);
  toggle("errorSection", false);
  toggle("resultSection", false);

  try {
    console.log("🎯 开始上传 → GitHub 图床");

    // 1. 转 base64
    const base64Data = await fileToBase64(pictureFile);

    // 2. 调用 Vercel API 上传到 GitHub
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: base64Data,
        fileName: `${Date.now()}_${pictureFile.name}`,
      }),
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || "图片上传失败");

    const imageUrl = uploadData.url;
    console.log("✅ GitHub 上传成功，URL:", imageUrl);

    // 3. 把 URL 丢给 Coze 工作流
    const result = await runWorkflow(position, imageUrl);

    document.getElementById("resultText").textContent =
      result.output || "诊断完成！";
    toggle("resultSection", true);
  } catch (err) {
    console.error("❌ 出错:", err);
    document.getElementById("errorMessage").textContent = err.message;
    toggle("errorSection", true);
  } finally {
    toggle("loading", false);
  }
};

/* ---------- 调用 Coze 工作流 ---------- */
async function runWorkflow(position, imageUrl) {
  const payload = {
    workflow_id: COZE_CONFIG.workflowId,
    space_id: COZE_CONFIG.spaceId,
    parameters: {
      position: position,
      picture_url: imageUrl, // ✅ 直接传 GitHub 链接
    },
  };

  const response = await fetch(COZE_CONFIG.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${COZE_CONFIG.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("📥 Coze 返回:", data);

  if (data.code !== 0) {
    throw new Error(data.msg || `工作流调用失败 code=${data.code}`);
  }

  return {
    output: data.data?.output || data.data?.answer || "诊断成功",
  };
}

/* ---------- 工具函数 ---------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toggle(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🌱 AI植物医生已启动");
});

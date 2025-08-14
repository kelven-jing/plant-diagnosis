import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));

    // 上传到图床（Vercel 不保存本地文件）
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    const uploadRes = await fetch("https://api.cloudinary.com/v1_1/demo/image/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleDiagnose = async () => {
    setLoading(true);
    setResult(null);

    const imageUrl = await handleUpload({
      target: { files: [document.getElementById("fileInput").files[0]] }
    });

    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ color: "green" }}>🌱 AI 植物急诊室（新版）</h1>
      <input id="fileInput" type="file" accept="image/*" />
      <button onClick={handleDiagnose} style={{ marginLeft: "10px" }}>开始诊断</button>

      {loading && <p>诊断中，请稍候...</p>}
      {image && <img src={image} alt="preview" style={{ width: "300px", marginTop: "10px" }} />}
      {result && (
        <pre style={{ background: "#f0f0f0", padding: "10px" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

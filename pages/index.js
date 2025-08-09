import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data.result || "未识别");
    setLoading(false);
  }

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#2d3a2e" }}>🌱 AI 植物急诊室</h1>
      <p>上传植物照片，我们帮你诊断</p>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {image && <img src={image} alt="preview" style={{ width: "200px", marginTop: "20px" }} />}

      {loading && <p>正在诊断中...</p>}

      {result && !loading && <p style={{ marginTop: "20px" }}>诊断结果：{result}</p>}
    </div>
  );
}

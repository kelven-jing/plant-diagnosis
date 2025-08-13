import { useState } from "react";

export default function Home() {
  const [position, setPosition] = useState("");
  const [picture, setPicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("position", position);
    formData.append("picture", picture);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🌱 植物急症室</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="请输入城市"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPicture(e.target.files[0])}
          required
        />
        <br /><br />
        <button type="submit">提交诊断</button>
      </form>

      {loading && <p>诊断中，请稍候...</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>诊断结果：</strong>{result.sentence}</p>
          <p><strong>解决方案：</strong>{result.solution}</p>
        </div>
      )}
    </div>
  );
}

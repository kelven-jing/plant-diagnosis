// pages/index.js
import { useState } from "react";

export default function Home() {
  const [position, setPosition] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("position", position);
    formData.append("file", file);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ color: "green" }}>AI 植物急诊室 (v2.0 ✅)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="输入位置"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">诊断</button>
      </form>

      <h2>诊断结果</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("请先选择图片");

    const formData = new FormData();
    formData.append("picture", file);
    formData.append("position", position);

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "诊断失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>🌱 AI 植物急诊室</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <input
          type="text"
          placeholder="请输入地点"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "诊断中..." : "诊断"}
        </button>
      </form>

      <h2>诊断结果</h2>
      <pre>{result ? JSON.stringify(result, null, 2) : "无结果"}</pre>
    </div>
  );
}

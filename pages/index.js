// pages/index.js
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState("宁波");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("请先选择一张图片");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("picture", file);
      fd.append("position", position);

      const resp = await fetch("/api/diagnose", {
        method: "POST",
        body: fd,
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "请求失败", detail: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, -apple-system" }}>
      <h1>🌱 AI 植物急诊室</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <input
          placeholder="拍摄位置，如：宁波"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "诊断中..." : "诊断"}
        </button>
      </form>

      <h2 style={{ marginTop: 24 }}>诊断结果</h2>
      <pre style={{ background: "#f7f7f8", padding: 12, borderRadius: 8, overflow: "auto" }}>
        {result ? JSON.stringify(result, null, 2) : "（尚无结果）"}
      </pre>

      {result?.sentence && (
        <>
          <h3>📝 诊断结论</h3>
          <p>{result.sentence}</p>
        </>
      )}
      {result?.solution && (
        <>
          <h3>🧰 解决方案</h3>
          <p>{result.solution}</p>
        </>
      )}
    </div>
  );
}

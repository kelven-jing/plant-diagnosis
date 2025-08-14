import { useState } from "react";

export default function Home() {
  const [position, setPosition] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("请上传一张图片");
      return;
    }

    const formData = new FormData();
    formData.append("position", position);
    formData.append("file", file);

    setLoading(true);
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
      <h1>AI 植物急诊室</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>拍摄位置（例如：叶子、茎）:</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </div>
        <div>
          <label>上传植物照片:</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "诊断中..." : "提交诊断"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>诊断结果</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

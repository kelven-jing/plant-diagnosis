import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [position, setPosition] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function toBase64(f) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // dataURL
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  const onChange = async (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setError("");
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let image; // 可以是 dataURL/base64 或直接 URL
      if (file) {
        image = await toBase64(file); // data:image/png;base64,xxxx
      } else {
        setError("请先选择图片");
        setLoading(false);
        return;
      }

      const resp = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 后端会把它转成 Coze 需要的 picture 格式
          image, 
          position
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || "服务端错误");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err?.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>AI 植物诊断</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input type="file" accept="image/*" onChange={onChange} />
        <label>
          位置（position，必填）：
          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="auto">auto</option>
            <option value="leaf">leaf</option>
            <option value="stem">stem</option>
            <option value="fruit">fruit</option>
            <option value="root">root</option>
          </select>
        </label>
        <button disabled={loading} type="submit">
          {loading ? "诊断中…" : "开始诊断"}
        </button>
      </form>

      {preview && (
        <div style={{ marginTop: 16 }}>
          <div>预览：</div>
          <img src={preview} alt="preview" style={{ maxWidth: "100%", border: "1px solid #eee" }} />
        </div>
      )}

      {error && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div>返回结果：</div>
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}

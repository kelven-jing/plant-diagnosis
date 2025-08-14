import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResp(null);

    if (!file) {
      setError("请先选择图片（表单字段名 picture）。");
      return;
    }
    if (!position.trim()) {
      setError("position 为必填，请填写。");
      return;
    }

    const form = new FormData();
    form.append("picture", file); // ⚠️ 字段名必须是 picture
    form.append("position", position);

    setLoading(true);
    try {
      const r = await fetch("/api/diagnose", {
        method: "POST",
        body: form
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error || "请求失败");
      } else {
        setResp(data);
      }
    } catch (err) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Coze Workflow 调用演示</h1>
      <p>将图片上传为 Coze <code>file_id</code>，再把 <code>picture</code> 和 <code>position</code> 传给工作流。</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          图片（picture，必填）：
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          位置（position，必填）：
          <input
            type="text"
            placeholder="例如：left / right / center ..."
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer"
          }}
        >
          {loading ? "提交中..." : "提交工作流"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, color: "#b00020" }}>
          <b>错误：</b>{error}
        </div>
      )}

      {resp && (
        <div style={{ marginTop: 16 }}>
          <h3>返回结果</h3>
          <pre style={{ background: "#f8f8f8", padding: 12, overflow: "auto" }}>
            {JSON.stringify(resp, null, 2)}
          </pre>

          {resp.debug_url && (
            <p>
              调试链接：<a href={resp.debug_url} target="_blank" rel="noreferrer">{resp.debug_url}</a>
            </p>
          )}
        </div>
      )}
    </main>
  );
}

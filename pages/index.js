export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", background: "#f0f9f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#2e7d32" }}>
        🌱 AI植物急诊室 <span style={{ fontSize: "14px", color: "#888" }}>v3.0</span>
      </h1>
      <p style={{ color: "#555" }}>上传你的植物照片，AI 将诊断它的健康状况。</p>

      <form
        method="POST"
        action="/api/diagnose"
        encType="multipart/form-data"
        style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}
      >
        <input type="file" name="picture" accept="image/*" required />
        <input type="text" name="position" placeholder="拍摄位置（城市名）" required />
        <button
          type="submit"
          style={{
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          上传并诊断
        </button>
      </form>
    </div>
  );
}

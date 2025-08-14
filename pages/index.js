export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🌱 AI植物急诊室 <span style={{ fontSize: "14px", color: "#888" }}>v2.1</span></h1>
      <p>上传你的植物照片，AI 将诊断它的健康状况。</p>

      <form method="POST" action="/api/diagnose" encType="multipart/form-data">
        <input type="file" name="picture" accept="image/*" required />
        <input type="text" name="position" placeholder="拍摄位置（城市名）" required />
        <button type="submit">上传并诊断</button>
      </form>
    </div>
  );
}

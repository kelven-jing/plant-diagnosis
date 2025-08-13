import { useState } from "react";

export default function Home() {
  const [imageFile, setImageFile] = useState(null);
  const [position, setPosition] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDiagnose = async () => {
    if (!imageFile || !position) {
      alert("请上传图片并输入位置");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("picture", imageFile);
      formData.append("position", position);

      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("诊断出错:", error);
      setResult({ error: "诊断失败，请稍后再试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🌱 AI 植物急诊室</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />
      <br />
      <input
        type="text"
        placeholder="输入位置"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <br />
      <button onClick={handleDiagnose} disabled={loading}>
        {loading ? "诊断中..." : "诊断"}
      </button>

      <h2>诊断结果</h2>
      <pre>{result ? JSON.stringify(result, null, 2) : "暂无结果"}</pre>
    </div>
  );
}

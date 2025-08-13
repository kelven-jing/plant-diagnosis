import { useState } from "react";

export default function Home() {
  const [imageFile, setImageFile] = useState(null);
  const [position, setPosition] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 读取图片并转换为 Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleDiagnose = async () => {
    if (!imageFile || !position) {
      alert("请上传图片并输入位置");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 图片转成 Base64
      const base64Image = await toBase64(imageFile);

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image, // base64 格式
          position: position,
        }),
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

  // 工具函数: File -> Base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🌱 AI 植物急诊室</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br /><br />

      <input
        type="text"
        placeholder="输入拍摄地点"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <br /><br />

      <button onClick={handleDiagnose} disabled={loading}>
        {loading ? "诊断中..." : "诊断"}
      </button>

      <h2>诊断结果</h2>
      <pre>{result ? JSON.stringify(result, null, 2) : "暂无结果"}</pre>
    </div>
  );
}

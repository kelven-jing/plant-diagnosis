import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!city || !image) {
      alert("请上传图片并输入城市！");
      return;
    }

    const formData = new FormData();
    formData.append("city", city);
    formData.append("image", image);

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data.message || "诊断完成");
    } catch (error) {
      console.error(error);
      setResult("诊断失败，请稍后再试。");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "green", textAlign: "center" }}>🌱 植物急症室</h1>

      <form onSubmit={handleSubmit}>
        <label>城市：</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="请输入你的城市"
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <label>上传植物照片：</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "green", color: "white", border: "none" }}>
          {loading ? "诊断中..." : "提交"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <strong>诊断结果：</strong>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

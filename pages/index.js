import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ sentence: "", solution: "" });

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
    setResult({ sentence: "", solution: "" });

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setResult({
        sentence: data.sentence || "未返回结果",
        solution: data.solution || "未返回方案"
      });
    } catch (error) {
      console.error(error);
      alert("调用失败");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "green" }}>🌱 植物急症室</h1>
      <form onSubmit={handleSubmit}>
        <label>城市：</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="请输入你的城市"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label>上传植物照片：</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{ width: "100%", backgroundColor: "green", color: "white", padding: "10px", border: "none" }}
        >
          {loading ? "诊断中..." : "提交"}
        </button>
      </form>

      {result.sentence && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <p><strong>结果：</strong>{result.sentence}</p>
          <p><strong>方案：</strong>{result.solution}</p>
        </div>
      )}
    </div>
  );
}

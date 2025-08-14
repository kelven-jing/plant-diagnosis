import { useState } from "react";

export default function Home() {
  const [position, setPosition] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!position || !image) {
      alert("请填写城市名并上传图片！");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("position", position);
    formData.append("image", image);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("请求出错");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🌿 AI 植物急诊室</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>城市名：</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="例如：北京"
            style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
          />
        </div>
        <div>
          <label>上传植物图片：</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button
          type="submit"
          style={{ marginTop: "10px", padding: "8px 15px", background: "green", color: "white" }}
          disabled={loading}
        >
          {loading ? "诊断中..." : "提交"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>诊断结果：</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

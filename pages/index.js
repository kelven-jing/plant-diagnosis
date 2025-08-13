import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [position, setPosition] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !position) {
      alert("请上传图片并填写位置");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("position", position);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🌱 AI 植物急诊室</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <br />
        <input
          type="text"
          placeholder="请输入植物所在城市"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{ marginTop: 10, width: 300 }}
        />
        <br />
        <button type="submit" style={{ marginTop: 10 }}>
          诊断
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>诊断结果</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

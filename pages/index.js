import { useState } from "react";

export default function Home() {
  const [position, setPosition] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("请上传图片");

    const formData = new FormData();
    formData.append("position", position);
    formData.append("image", image); // 注意：必须和后端 `files.image` 对应

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>AI 植物急诊室</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="输入位置"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <br />
        <button type="submit">提交诊断</button>
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

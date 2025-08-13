import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState("");
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("请先选择图片！");
      return;
    }

    const formData = new FormData();
    formData.append("picture", file);
    formData.append("position", position);

    console.log("📤 前端发送的 FormData:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("📩 后端返回原始文本:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ JSON 解析失败:", e);
        setResult(`解析失败: ${text}`);
        return;
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("❌ 前端请求出错:", error);
      setResult(`请求出错: ${error.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>🌱 AI 植物急诊室</h1>
      <input type="file" onChange={handleFileChange} /> <br />
      <input
        type="text"
        placeholder="请输入位置"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        style={{ marginTop: 10 }}
      />
      <br />
      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        诊断
      </button>
      <h2>诊断结果</h2>
      <pre>{result}</pre>
    </div>
  );
}

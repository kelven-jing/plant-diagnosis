import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("city", city);
    formData.append("image", image);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h1>植物急症室</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="请输入城市"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <button type="submit">诊断</button>
      </form>

      {result && (
        <div>
          <p><strong>诊断结果：</strong>{result.sentence}</p>
          <p><strong>解决方案：</strong>{result.solution}</p>
        </div>
      )}
    </div>
  );
}

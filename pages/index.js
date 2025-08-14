// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const res = await fetch('/api/diagnose', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ color: 'green' }}>🌱 AI 植物诊断 v2</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>上传植物图片：</label>
          <input type="file" name="picture" accept="image/*" required />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>位置（城市）：</label>
          <input type="text" name="position" placeholder="例如：宁波" required />
        </div>
        <button type="submit" style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: 'green', color: 'white' }}>
          开始诊断
        </button>
      </form>

      {loading && <p>⏳ 正在诊断，请稍候...</p>}

      {result && (
        <div style={{ marginTop: '20px', backgroundColor: '#f6f6f6', padding: '10px' }}>
          <h2>诊断结果：</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

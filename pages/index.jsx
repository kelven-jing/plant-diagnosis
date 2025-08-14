import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) return alert('请先选择图片');
    setLoading(true);
    setResult(null);

    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: image })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🌿 AI植物急诊室</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {image && <img src={image} alt="preview" style={{ maxWidth: '300px', marginTop: '20px' }} />}
      <div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: '20px', padding: '10px 20px' }}
        >
          {loading ? '分析中...' : '开始诊断'}
        </button>
      </div>
      {result && (
        <pre style={{ textAlign: 'left', marginTop: '20px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

import { useState } from 'react';

export default function Home() {
  const [city, setCity] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('请上传图片');
      return;
    }
    if (!city.trim()) {
      alert('请输入城市名称');
      return;
    }

    setLoading(true);
    setResult('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('position', city);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('请求失败: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>🌱 AI 植物急诊室 v3.0</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>城市名（手动输入）:</label><br />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="例如：宁波"
            style={{ padding: '0.5rem', marginBottom: '1rem', width: '200px' }}
          />
        </div>

        <div>
          <label>上传植物照片:</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: '1rem' }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {loading ? '诊断中...' : '提交诊断'}
        </button>
      </form>

      {result && (
        <pre style={{
          background: '#f4f4f4',
          padding: '1rem',
          marginTop: '1rem',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}

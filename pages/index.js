import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!file || !position) {
      alert('请选择图片并输入位置');
      return;
    }

    const formData = new FormData();
    formData.append("picture", file); // 直接传 File 对象
    formData.append("position", position);

    const res = await fetch('/api/diagnose', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🌱 AI 植物急诊室</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} /><br /><br />
      <input
        type="text"
        placeholder="输入位置"
        value={position}
        onChange={e => setPosition(e.target.value)}
      /><br /><br />
      <button onClick={handleSubmit}>诊断</button>

      <h2>诊断结果</h2>
      <pre>{result ? JSON.stringify(result, null, 2) : '等待诊断...'}</pre>
    </div>
  );
}

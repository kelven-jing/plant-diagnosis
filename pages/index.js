"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data.result || "未能识别植物问题");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4fff8] flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-[#2d3a2e] mb-2">
        🌱 AI 植物急诊室
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        上传植物照片，我们帮你诊断病因并提供建议
      </p>

      <label className="bg-[#88c999] hover:bg-[#77b688] text-white px-4 py-2 rounded-lg cursor-pointer">
        选择植物图片
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
      </label>

      {image && (
        <img
          src={image}
          alt="preview"
          className="w-64 h-64 object-cover rounded-xl mt-4 shadow-lg"
        />
      )}

      {loading && <p className="mt-4 text-gray-600">正在诊断中，请稍候...</p>}

      {result && !loading && (
        <Card className="mt-6 p-4 bg-[#cbe8d9] max-w-md text-center">
          <p className="text-[#2d3a2e] font-medium">{result}</p>
        </Card>
      )}

      <footer className="mt-10 text-gray-500 text-sm">
        © 2025 AI 植物急诊室 | Powered by HuggingFace
      </footer>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/diagnose", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div className="min-h-screen bg-[#f4fff8] flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-[#2d3a2e] mb-4">AI 植物急诊室</h1>
      <p className="text-lg text-gray-700 mb-6">上传植物照片，我们帮你诊断病因并提供建议</p>
      <input type="file" accept="image/*" onChange={handleUpload} className="mb-4" />
      {image && <img src={image} alt="preview" className="w-64 h-64 object-cover rounded-xl" />}
      {result && (
        <Card className="mt-6 p-4 bg-[#cbe8d9]">
          <p className="text-[#2d3a2e]">{result}</p>
        </Card>
      )}
    </div>
  );
}

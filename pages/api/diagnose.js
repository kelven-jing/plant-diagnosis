// pages/api/diagnose.js

export const config = {
  api: {
    bodyParser: false, // 必须禁用 bodyParser 才能用 formidable 解析图片
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析表单数据
    const form = formidable({ multiples: false });
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { position } = data.fields;
    const imageFile = data.files.image;

    if (!imageFile) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    if (!position || position.trim() === "") {
      return res.status(400).json({ error: "No position provided" });
    }

    // 转 base64
    const imageBuffer = fs.readFileSync(imag

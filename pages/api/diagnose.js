export const config = {
  api: {
    bodyParser: false, // 处理 FormData 需要关闭默认解析
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "只支持 POST 请求" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "解析失败" });
    }

    const city = fields.city;
    const imageFile = files.image;

    console.log("收到城市：", city);
    console.log("收到图片：", imageFile.originalFilename);

    // 这里先用假数据返回，后面你可以改成真正的 API 调用
    res.status(200).json({
      message: `假装分析了一下，${city} 的植物健康状况良好 🌿`
    });
  });
}


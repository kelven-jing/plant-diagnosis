export const config = {
  api: { bodyParser: false } // 关闭默认解析，自己处理 FormData
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. "yourname/plant-images"
  const pathPrefix = process.env.GITHUB_PATH || "images";

  try {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      // 简化处理: 假设上传的就是 PNG
      const base64Content = buffer.toString("base64");
      const fileName = `plant_${Date.now()}.png`;

      const githubUrl = `https://api.github.com/repos/${repo}/contents/${pathPrefix}/${fileName}`;

      const ghRes = await fetch(githubUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload ${fileName}`,
          content: base64Content,
        }),
      });

      const ghData = await ghRes.json();
      if (!ghRes.ok) return res.status(500).json({ error: ghData.message });

      const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${pathPrefix}/${fileName}`;
      return res.status(200).json({ url: rawUrl });
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

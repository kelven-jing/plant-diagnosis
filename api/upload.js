export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageBase64, fileName } = req.body;
  if (!imageBase64 || !fileName) {
    return res.status(400).json({ error: "缺少必要参数" });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/uploads/${fileName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload ${fileName}`,
          content: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          branch: process.env.GITHUB_BRANCH,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.message || "GitHub 上传失败" });
    }

    return res.status(200).json({
      url: data.content.download_url,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

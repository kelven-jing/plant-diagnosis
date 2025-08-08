export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 模拟延迟
    await new Promise(r => setTimeout(r, 500));

    // 这里先假装分析成功
    res.status(200).json({
        diagnosis: "这是一株健康的植物 🌱"
    });
}

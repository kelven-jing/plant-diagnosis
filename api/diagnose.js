export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    res.status(200).json({
        diagnosis: "测试成功！这是一个健康的植物 🌱"
    });
}


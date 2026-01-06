export default async function handler(req, res) {
  // 🔥 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 Preflight (obrigatório)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    // 👉 aqui entra sua lógica atual do TikTok
    // ex: fetch para TikTok API

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("TikTok server-side error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

import axios from "axios";

export default async function handler(req, res) {
  // =========================
  // 🔥 CORS (OBRIGATÓRIO)
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "https://upssel.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight (browser sempre chama antes)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    const API_KEY = process.env.DUTTYFY_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "API key não configurada" });
    }

    const PIX_API_URL = `https://www.pagamentos-seguros.app/api-pix/${API_KEY}`;

    // =========================
    // 🟢 CRIAR PIX
    // =========================
    if (body.amount) {
      const response = await axios.post(PIX_API_URL, body, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      return res.status(200).json(response.data);
    }

    // =========================
    // 🔵 CONSULTAR STATUS
    // =========================
    if (body.transactionId) {
      const response = await axios.get(PIX_API_URL, {
        params: { transactionId: body.transactionId }
      });

      return res.status(200).json(response.data);
    }

    return res.status(400).json({ error: "Payload inválido" });

  } catch (err) {
    console.error("PIX API error:", err?.response?.data || err.message);

    return res.status(500).json({
      error: err.response?.data?.error || "Erro interno"
    });
  }
}

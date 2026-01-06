import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    const DUTTYFY_URL = `https://www.pagamentos-seguros.app/api-pix/${process.env.DUTTYFY_API_KEY}`;

    // Criar PIX
    if (body.amount) {
      const r = await axios.post(DUTTYFY_URL, body);
      return res.status(200).json(r.data);
    }

    // Consultar status
    if (body.transactionId) {
      const r = await axios.get(DUTTYFY_URL, {
        params: { transactionId: body.transactionId }
      });
      return res.status(200).json(r.data);
    }

    return res.status(400).json({ error: "Payload inválido" });

  } catch (err) {
    return res.status(500).json({
      error: err.response?.data?.error || "Erro interno"
    });
  }
}


export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://upssel-nine.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const BOB_API_KEY = process.env.BOB_API_KEY;
  if (!BOB_API_KEY) return res.status(500).json({ error: "BOB_API_KEY não configurada" });

  const BASE_URL = "https://api.payments.bob.company/api/v1";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BOB_API_KEY}`,
  };

  const body = req.body;

  try {
    // ─── CRIAR PIX ───────────────────────────────────────────────
    if (body.amount) {
      const { customer, item, description, amount } = body;
      const doc = (customer?.document || "").replace(/\D/g, "");

      const payload = {
        customer: {
          name: customer?.name || "Cliente",
          document: doc,
          documentType: doc.length === 14 ? "CNPJ" : "CPF",
          email: customer?.email || "cliente@email.com",
          phone: (customer?.phone || "").replace(/\D/g, "") || "11999999999",
          address: {
            street: "Rua Não Informada",
            streetNumber: "0",
            neighborhood: "Centro",
            zipCode: "01001000",
            city: "São Paulo",
            state: "SP",
            country: "BR",
          },
        },
        payment: {
          amountCents: amount,
          product: item?.title || description || "Produto",
          quantity: item?.quantity || 1,
          expirationDays: 1,
        },
        originDomain: "upssel-nine.vercel.app",
      };

      const response = await fetch(`${BASE_URL}/transactions/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error("Bob Payments error:", json);
        return res.status(response.status).json({ error: json.message || "Erro ao criar transação" });
      }

      return res.status(200).json({
        pixCode: json.data.pixCode,
        transactionId: json.data.id,
        status: json.data.status,
      });
    }

    // ─── CONSULTAR STATUS ─────────────────────────────────────────
    if (body.transactionId) {
      const response = await fetch(`${BASE_URL}/transactions/${body.transactionId}`, { headers });
      const json = await response.json();

      if (!response.ok || !json.success) {
        return res.status(response.status).json({ error: json.message || "Erro ao consultar transação" });
      }

      return res.status(200).json({
        pixCode: json.data.pixCode,
        transactionId: json.data.id,
        status: json.data.status,
      });
    }

    return res.status(400).json({ error: "Payload inválido" });
  } catch (err) {
    console.error("PIX handler error:", err.message);
    return res.status(500).json({ error: "Erro interno" });
  }
}

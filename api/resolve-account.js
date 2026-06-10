// api/resolve-account.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { account_number, bank_code } = req.body;

  if (!account_number || !bank_code) {
    return res.status(400).json({ error: 'Missing account number or bank code' });
  }

  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Talk to Paystack's Resolve Account API
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
      }
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ error: data.message || "Invalid account details." });
    }

    // Return the verified name to the KudiSlip frontend
    return res.status(200).json({ 
      success: true, 
      account_name: data.data.account_name 
    });

  } catch (error) {
    console.error("Account Resolution Error:", error);
    return res.status(500).json({ error: 'Failed to verify account details.' });
  }
}

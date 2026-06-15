// =========================================================
// API ROUTE: /api/update-subaccount.js
// =========================================================
export default async function handler(req, res) {
  // Allow POST and PUT methods
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { subaccount_code, account_number, bank_code, business_name } = req.body;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("Missing Paystack Secret Key.");
    }

    // 🎯 Call Paystack's UPDATE endpoint to overwrite the existing subaccount
    const paystackRes = await fetch(`https://api.paystack.co/subaccount/${subaccount_code}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_name: business_name,
        bank_code: bank_code,
        account_number: account_number
      })
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      throw new Error(paystackData.message || "Failed to update Paystack subaccount.");
    }

    return res.status(200).json({ success: true, data: paystackData.data });
  } catch (error) {
    console.error("🔴 Paystack Update Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

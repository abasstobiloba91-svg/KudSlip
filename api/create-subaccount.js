export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { business_name, bank_code, account_number } = req.body;
  
  // This uses your secure secret key stored in Vercel
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; 

  try {
    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        business_name: business_name,
        settlement_bank: bank_code,
        account_number: account_number,
        percentage_charge: 1.5 // Your platform fee!
      })
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);

    return res.status(200).json({ subaccount_code: data.data.subaccount_code });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

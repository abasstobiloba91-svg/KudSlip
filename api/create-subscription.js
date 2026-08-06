// api/create-subscription.js
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, vendorId } = req.body;
    
    // Get the Secret Key securely from Vercel environments
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: "Server config error: Missing Paystack key." });
    }

    // Call Paystack API to initialize the transaction
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        amount: 15000 * 100, // ₦15,000 converted to kobo
        currency: "NGN",
        reference: `KUDISLIP_PRO_${vendorId}_${Date.now()}`,
        // Redirect them back to the dashboard when they finish paying
        callback_url: `https://${req.headers.host}/dashboard/billing`, 
        metadata: {
          vendor_id: vendorId,
          type: 'subscription_upgrade'
        }
      })
    });

    const data = await paystackRes.json();

    if (!data.status) {
      return res.status(400).json({ error: data.message });
    }

    // Send the payment page URL back to your React frontend!
    return res.status(200).json({ authorization_url: data.data.authorization_url });

  } catch (error) {
    console.error("Paystack init error:", error);
    return res.status(500).json({ error: "Failed to connect to Paystack." });
  }
}

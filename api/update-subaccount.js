import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role to check OTPs securely
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { vendor_id, subaccount_code, account_number, bank_code, business_name, otp } = req.body;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("Missing PAYSTACK_SECRET_KEY in environment variables.");
    }

    if (!vendor_id || !otp) {
      return res.status(400).json({ error: "Security code (OTP) and Vendor ID are required." });
    }

    // 🔒 1. VERIFY OTP AGAINST SUPABASE
    const { data: otpRecord, error: otpError } = await supabase
      .from('otps')
      .select('*')
      .eq('vendor_id', vendor_id)
      .eq('code', otp)
      .single();

    if (otpError || !otpRecord) {
      return res.status(400).json({ error: "Invalid security code. Please check and try again." });
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: "Security code has expired. Please request a new one." });
    }

    // 🎯 2. UPDATE PAYSTACK SUBACCOUNT
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

    // 🧹 3. DELETE USED OTP & UPDATE VENDOR BANK DETAILS IN SUPABASE
    await supabase.from('otps').delete().eq('vendor_id', vendor_id);

    await supabase.from('vendors').update({
      bank_code: bank_code,
      account_number: account_number
    }).eq('id', vendor_id);

    return res.status(200).json({ success: true, data: paystackData.data });
  } catch (error) {
    console.error("🔴 Settlement Route Update Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

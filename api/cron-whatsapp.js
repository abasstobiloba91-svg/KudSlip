// =========================================================
// API ROUTE: /api/send-whatsapp.js (WITH 3 FREE MONTHLY PINGS)
// =========================================================
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { invoiceId, vendorId, customerPhone, customerName, businessName, amount } = req.body;

    if (!customerPhone) throw new Error("Customer phone number is missing.");

    // 1. SMART PHONE NUMBER FORMATTER
    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('234')) {
      cleanPhone = '234' + cleanPhone;
    }

    // 2. CHECK VENDOR SUBSCRIPTION STATUS
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('subscription_tier')
      .eq('id', vendorId)
      .single();

    if (vendorError) throw new Error("Could not verify vendor database profile.");

    const isFreeTier = !vendor?.subscription_tier || vendor.subscription_tier === 'free';

    // 🎯 3 FREE PINGS ENFORCER FOR FREE TIER
    if (isFreeTier) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Count how many WhatsApp pings this vendor has sent since the 1st of this month
      const { count, error: countError } = await supabaseAdmin
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('whatsapp_notified', true)
        .gte('last_reminded_at', startOfMonth.toISOString());

      if (countError) throw new Error("Error checking trial limits.");

      if (count >= 3) {
        // Return a 402 Payment Required code with upgrade instructions
        return res.status(402).json({ 
          requiresUpgrade: true, 
          error: "You've used your 3 free WhatsApp reminders for this month. Upgrade to Pro to unlock unlimited tracking!" 
        });
      }
    }

    // 3. THE WHATSAPP API GATEWAY CALL
    const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
    const WHATSAPP_URL = process.env.WHATSAPP_URL || "https://api.sendchamp.com/api/v1/whatsapp/message/send";

    const invoiceUrl = `https://www.kudislip.com.ng/invoice/${invoiceId}`;
    const messageBody = `Hello ${customerName || 'Customer'},\n\nThis is a friendly reminder from ${businessName} regarding your pending invoice of ₦${Number(amount).toLocaleString()}.\n\nYou can view and pay your invoice securely here:\n${invoiceUrl}\n\nThank you!`;

    if (WHATSAPP_API_KEY) {
       const response = await fetch(WHATSAPP_URL, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${WHATSAPP_API_KEY}`
         },
         body: JSON.stringify({
           recipient: cleanPhone,
           message: messageBody,
           sender_name: "KudiSlip"
         })
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || "WhatsApp Gateway Rejected Message");
       }
    } else {
       console.log("⚠️ WHATSAPP_API_KEY missing. Simulating success for testing.");
       console.log(`[SIMULATED WHATSAPP TO ${cleanPhone}]:`, messageBody);
    }

    // 4. LOG THE SUCCESSFUL SEND IN DATABASE
    await supabaseAdmin
      .from('invoices')
      .update({ whatsapp_notified: true, last_reminded_at: new Date().toISOString() })
      .eq('id', invoiceId);

    return res.status(200).json({ success: true, message: "WhatsApp sent successfully." });

  } catch (error) {
    console.error("🔴 WhatsApp Send Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

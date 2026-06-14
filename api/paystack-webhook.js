// =========================================================
// API ROUTE: /api/paystack-webhook (WITH X-RAY LOGS)
// =========================================================
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // MUST BE SERVICE ROLE KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  console.log("🟢 WEBHOOK HIT! Paystack is knocking on the door.");

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("🔴 FATAL: PAYSTACK_SECRET_KEY is missing in Vercel!");
      return res.status(500).send('Server config error');
    }

    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      console.error("🔴 FATAL: SIGNATURE MISMATCH! The Secret Key in Vercel doesn't match the one in Paystack.");
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;
    console.log(`🟢 Event Type Received: ${event.event}`);

    if (event.event === 'charge.success') {
      const invoiceId = event.data?.metadata?.invoice_id;
      
      if (!invoiceId) {
        console.error("🔴 ERROR: Paystack sent the success, but no Invoice ID was found in the metadata!");
        return res.status(400).send('No Invoice ID');
      }

      console.log(`🟢 Success! Attempting to update Invoice ID: ${invoiceId}`);

      const { error } = await supabaseAdmin
        .from('invoices')
        .update({ status: 'paid', payment_method: 'paystack' })
        .eq('id', invoiceId);

      if (error) {
        console.error("🔴 FATAL SUPABASE ERROR:", error.message);
        return res.status(500).send('DB Error');
      }

      console.log("✅ BOOM! INVOICE UPDATED SUCCESSFULLY IN DATABASE!");
    }

    return res.status(200).send('Success');
  } catch (err) {
    console.error("🔴 FATAL WEBHOOK CRASH:", err);
    return res.status(500).send('Server Error');
  }
}

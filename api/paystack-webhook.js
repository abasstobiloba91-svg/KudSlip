// =========================================================
// API ROUTE: /api/paystack-webhook
// =========================================================
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin to bypass RLS and force the update securely
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests from Paystack
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // 1. Verify the request is actually from Paystack (Security Check)
    const secret = process.env.PAYSTACK_SECRET_KEY; // Ensure this is in your Vercel env variables!
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.error("Webhook signature mismatch!");
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;

    // 2. Listen specifically for successful charges
    if (event.event === 'charge.success') {
      const invoiceId = event.data.metadata?.invoice_id;
      const amountPaid = event.data.amount / 100; // Paystack sends amounts in kobo

      if (invoiceId) {
        // 3. Automatically update the database in the background
        const { error } = await supabaseAdmin
          .from('invoices')
          .update({ 
            status: 'paid', 
            payment_method: 'paystack' 
          })
          .eq('id', invoiceId);

        if (error) {
          console.error("Webhook Database Error:", error.message);
          return res.status(500).send('Database Update Failed');
        }

        console.log(`Successfully marked invoice ${invoiceId} as paid for ${amountPaid}`);
      }
    }

    // Always return a 200 OK so Paystack knows we received the message
    return res.status(200).send('Webhook received successfully');

  } catch (err) {
    console.error("Webhook Processing Error:", err);
    return res.status(500).send('Internal Server Error');
  }
}

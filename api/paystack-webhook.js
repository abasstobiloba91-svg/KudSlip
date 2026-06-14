// =========================================================
// API ROUTE: /api/paystack-webhook (DATABASE + AUTOMATIC EMAIL)
// =========================================================
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // 1. Security Check
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      console.error("Signature mismatch");
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const invoiceId = event.data?.metadata?.invoice_id;
      
      if (invoiceId) {
        console.log(`Processing backend updates for Invoice: ${invoiceId}`);

        // 2. Fetch all required details natively on the server side
        const { data: invoice, error: invErr } = await supabaseAdmin.from('invoices').select('*').eq('id', invoiceId).single();
        if (invErr || !invoice) throw new Error(`Invoice fetch failed: ${invErr?.message}`);

        const { data: vendor } = await supabaseAdmin.from('vendors').select('*').eq('id', invoice.vendor_id).single();
        const { data: client } = await supabaseAdmin.from('clients').select('*').eq('id', invoice.client_id).single();

        // 3. Update the Database status
        const { error: updateErr } = await supabaseAdmin
          .from('invoices')
          .update({ status: 'paid', payment_method: 'paystack' })
          .eq('id', invoiceId);

        if (updateErr) throw new Error(`Database update failed: ${updateErr.message}`);
        console.log("Database status successfully marked as PAID");

        // 4. 🔥 THE SERVER-SIDE FIX: Trigger the email notification completely independent of the browser
        if (vendor?.email) {
          const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };
          const invoiceCurrency = invoice.currency || "NGN";
          const symbol = CURRENCY_SYMBOLS[invoiceCurrency] || invoiceCurrency;

          // Determine the site's base deployment URL dynamically
          const protocol = req.headers['x-forwarded-proto'] || 'https';
          const host = req.headers.host;
          const baseUrl = `${protocol}://${host}`;

          console.log("Triggering server-to-server email alert...");
          
          // Call your existing email alert endpoint directly from the backend
          await fetch(`${baseUrl}/api/send-payment-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorEmail: vendor.email,
              vendorName: vendor?.business_name || "Merchant",
              clientName: client?.name || "A client",
              amount: Number(invoice.amount).toLocaleString(),
              currency: symbol,
              invoiceId: invoice.id
            })
          }).catch(e => console.error("Server-side email trigger failed:", e));
        }
      }
    }

    return res.status(200).send('Success');
  } catch (err) {
    console.error("Webhook processing crash:", err.message);
    return res.status(500).send('Server Error');
  }
}

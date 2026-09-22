// =========================================================
// API ROUTE: /api/paystack-webhook 
// (SECURE DATABASE + DUAL EMAILS + REALTIME NOTIFICATIONS + SUBSCRIPTIONS)
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
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("FATAL: PAYSTACK_SECRET_KEY is missing in environment!");
      return res.status(500).send('Server config error');
    }

    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      console.error("FATAL: SIGNATURE MISMATCH!");
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;
    console.log(`Webhook received: ${event.event}`);

    if (event.event === 'charge.success') {
      const metadata = event.data?.metadata || {};

      // PATH A: PRO SUBSCRIPTION UPGRADE
      if (metadata.type === 'subscription_upgrade') {
        const vendorId = metadata.vendor_id;
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: upgradeError } = await supabaseAdmin
          .from('vendors')
          .update({ 
            subscription_tier: 'pro',
            pro_expires_at: expiresAt 
          })
          .eq('id', vendorId);

        if (upgradeError) {
          console.error("Failed to upgrade vendor:", upgradeError);
          return res.status(500).json({ error: "Failed to upgrade vendor" });
        }

        console.log(`Vendor ${vendorId} upgraded to Pro until ${expiresAt}`);
      }

      // PATH B: INVOICE PAYMENT (Now with Partial Payment Math)
      else if (metadata.invoice_id) {
        const invoiceId = metadata.invoice_id;
        console.log(`Processing backend updates for Invoice: ${invoiceId}`);

        const { data: invoice, error: invErr } = await supabaseAdmin.from('invoices').select('*').eq('id', invoiceId).single();
        if (invErr || !invoice) throw new Error(`Invoice fetch failed: ${invErr?.message}`);

        const { data: vendor } = await supabaseAdmin.from('vendors').select('*').eq('id', invoice.vendor_id).single();
        const { data: client } = await supabaseAdmin.from('clients').select('*').eq('id', invoice.client_id).single();

        // 1. Calculate Partial Payment Math
        const intendedAmount = Number(metadata.intended_amount) || (event.data.amount / 100);
        const newAmountPaid = Number(invoice.amount_paid || 0) + intendedAmount;
        const isFullyPaid = newAmountPaid >= Number(invoice.amount);
        const newStatus = isFullyPaid ? 'paid' : 'partially_paid';
        const currentBalance = Number(invoice.amount) - newAmountPaid;

        const { error: updateErr } = await supabaseAdmin
          .from('invoices')
          .update({ 
            status: newStatus, 
            payment_method: 'paystack',
            amount_paid: newAmountPaid
          })
          .eq('id', invoiceId);

        if (updateErr) throw new Error(`Database update failed: ${updateErr.message}`);
        console.log(`Database status successfully marked as ${newStatus.toUpperCase()}`);

        // 2. Prepare formatting for emails
        const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };
        const invoiceCurrency = invoice.currency || "NGN";
        const symbol = CURRENCY_SYMBOLS[invoiceCurrency] || invoiceCurrency;
        
        const amountPaidFormatted = intendedAmount.toLocaleString();
        const balanceDueFormatted = currentBalance > 0 ? currentBalance.toLocaleString() : null;

        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        // 3. Email 1: Alert to Merchant (Vendor)
        if (vendor?.email) {
          console.log("Triggering merchant payment alert...");
          fetch(`${baseUrl}/api/mailer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'payment_alert',
              vendorEmail: vendor.email,
              vendorName: vendor?.business_name || "Merchant",
              clientName: client?.name || "A client",
              amount: amountPaidFormatted, // Only the amount paid today
              balanceDue: balanceDueFormatted, // Triggers partial payment text if > 0
              currency: symbol,
              invoiceId: invoice.id
            })
          }).catch(e => console.error("Merchant email failed:", e));
        }

        // 4. Email 2: Official Receipt to Payer (Client)
        if (client?.email) {
          console.log("Triggering client receipt...");
          fetch(`${baseUrl}/api/mailer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'client_receipt',
              clientEmail: client.email,
              clientName: client.name || "Valued Client",
              vendorName: vendor?.business_name || "Merchant",
              amount: amountPaidFormatted, // Only the amount paid today
              balanceDue: balanceDueFormatted, // Triggers partial payment text if > 0
              currency: symbol,
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoice_number || `KUD-INV-${invoice.id.slice(0, 6).toUpperCase()}`,
              paymentMethod: "Paystack Secure"
            })
          }).catch(e => console.error("Client receipt failed:", e));
        }

        // 5. Realtime In-App Notification
        if (vendor?.id) {
          console.log("Inserting realtime notification...");
          const { error: notifErr } = await supabaseAdmin.from('notifications').insert([{
            user_id: vendor.id, 
            message: `Payment Received: ${client?.name || "A client"} just paid ${symbol}${amountPaidFormatted}`,
            is_read: false
          }]);
          
          if (notifErr) console.error("Failed to save notification:", notifErr);
          else console.log("Realtime notification saved successfully!");
        }
      }
    }

    return res.status(200).send('Success');

  } catch (err) {
    console.error("Webhook processing crash:", err.message);
    return res.status(500).send('Server Error');
  }
}

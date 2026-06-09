// api/cron-whatsapp.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // SECURITY: Only allow Vercel's internal cron engine to trigger this URL
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  try {
    const today = new Date().toISOString();

    // 1. Fetch only OVERDUE invoices that belong to PREMIUM users
    // We join the tables to get the client's phone number and the vendor's subscription tier
    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .select(`
        id, amount, currency, 
        vendors!inner(business_name, subscription_tier), 
        clients!inner(name, phone)
      `)
      .eq('status', 'pending')
      .lt('due_date', today)
      .eq('vendors.subscription_tier', 'premium'); // 💰 Paywall Check

    if (error) throw error;
    if (!overdueInvoices || overdueInvoices.length === 0) {
      return res.status(200).json({ message: "No overdue premium invoices tonight." });
    }

    // 2. Loop through and send the WhatsApp messages
    for (const inv of overdueInvoices) {
      const phone = inv.clients.phone;
      if (!phone) continue; // Skip if no phone number saved

      // Format the friendly reminder message
      const amountFormat = `${inv.currency === 'USD' ? '$' : '₦'}${Number(inv.amount).toLocaleString()}`;
      
      /* * 🚀 WHATSAPP API INTEGRATION GOES HERE
       * Example using Meta Cloud API:
       */
      await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone.replace(/\+/g, ''), // Strip + sign for Meta API
          type: "template",
          template: {
            name: "friendly_overdue_reminder", // Name of your pre-approved Meta template
            language: { code: "en" },
            components: [
              { type: "body", parameters: [
                  { type: "text", text: inv.clients.name },
                  { type: "text", text: amountFormat },
                  { type: "text", text: inv.vendors.business_name },
                  { type: "text", text: `https://kudislip.com.ng/pay/${inv.id}` }
              ]}
            ]
          }
        })
      }).catch(e => console.error("WhatsApp Send Failed:", e));
    }

    return res.status(200).json({ success: true, processed: overdueInvoices.length });
  } catch (err) {
    console.error("Cron Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// api/cron-reminders.js
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

export default async function handler(req, res) {
  // 1. SECURITY: Only allow Vercel's internal cron engine to trigger this
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized access. Invalid Cron Secret.' });
  }

  // 2. Initialize Supabase (Using Master Key to bypass RLS)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // 3. Initialize Twilio
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const today = new Date().toISOString();

    // 4. Fetch OVERDUE invoices that belong to PREMIUM users
    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .select(`
        id, amount, currency, 
        vendors!inner(business_name, subscription_tier), 
        clients!inner(name, phone)
      `)
      .eq('status', 'pending')
      .lt('due_date', today)
      .eq('vendors.subscription_tier', 'premium'); // 💰 The Paywall Check

    if (error) throw error;
    
    if (!overdueInvoices || overdueInvoices.length === 0) {
      return res.status(200).json({ message: "Zero overdue premium invoices today. Everyone paid!" });
    }

    let messagesSent = 0;

    // 5. Loop through and send the WhatsApp messages
    for (const inv of overdueInvoices) {
      const phone = inv.clients.phone;
      if (!phone) continue; // Skip if no phone number

      const amountFormat = `${inv.currency === 'USD' ? '$' : '₦'}${Number(inv.amount).toLocaleString()}`;
      const paymentLink = `https://kudislip.vercel.app/pay/${inv.id}`;
      
      // Format the phone number to ensure it has a + (Twilio requires E.164 format like +234...)
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // 🚀 Send via Twilio WhatsApp API
      await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedPhone}`,
        body: `*Friendly Reminder from ${inv.vendors.business_name}* 👋\n\nHello ${inv.clients.name},\n\nThis is an automated reminder that your invoice for *${amountFormat}* is currently overdue.\n\nYou can easily view and settle this invoice securely using the link below:\n${paymentLink}\n\nThank you for your business! \n_Powered by KudiSlip_`
      });

      messagesSent++;
    }

    return res.status(200).json({ success: true, processed: overdueInvoices.length, sent: messagesSent });
    
  } catch (err) {
    console.error("Cron Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // OR SUPABASE_SERVICE_ROLE_KEY if RLS blocks it
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    // 1. Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T');

    // 2. Scan database for pending invoices due exactly today
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, amount, currency, due_date, clients(name, email), vendors(business_name)')
      .eq('status', 'pending')
      .eq('due_date', today);

    if (error) throw error;
    if (!invoices || invoices.length === 0) {
      return res.status(200).json({ message: 'Zero invoices due today. Going back to sleep.' });
    }

    // 3. Loop through and blast the reminder emails
    for (const inv of invoices) {
      if (inv.clients?.email) {
        await resend.emails.send({
          from: 'KudiSlip Billing <invoices@kudislip.com.ng>',
          to: [inv.clients.email],
          subject: `Action Required: Invoice Due Today (${inv.currency || '₦'}${inv.amount})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #d97706;">Invoice Reminder ⏰</h2>
              <p>Hello ${inv.clients.name},</p>
              <p>This is an automated reminder from <strong>${inv.vendors?.business_name || 'your vendor'}</strong> that your invoice for <strong>${inv.currency || '₦'}${Number(inv.amount).toLocaleString()}</strong> is due today.</p>
              <br />
              <a href="https://kudislip.com.ng/pay/${inv.id}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Pay Securely Now</a>
              <br /><br />
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">Powered by KudiSlip Automated Billing.</p>
            </div>
          `
        });
      }
    }

    return res.status(200).json({ message: `Success! Fired ${invoices.length} midnight reminders.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

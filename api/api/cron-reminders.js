import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T');

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, amount, currency, due_date, clients(name, email), vendors(business_name)')
      .eq('status', 'pending')
      .eq('due_date', today);

    if (error) throw error;
    if (!invoices || invoices.length === 0) {
      return res.status(200).json({ message: 'Zero invoices due today. Going back to sleep.' });
    }

    for (const inv of invoices) {
      if (inv.clients?.email) {
        await resend.emails.send({
          from: 'KudiSlip Billing <invoices@kudislip.com.ng>',
          to: [inv.clients.email],
          subject: `Action Required: Invoice Due Today (${inv.currency || '₦'}${inv.amount})`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 40px;" />
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #0f172a; margin-top: 0;">Invoice Reminder</h2>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">Dear ${inv.clients.name},</p>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">This is an automated notification from <strong>${inv.vendors?.business_name || 'your vendor'}</strong> to remind you that your invoice for <strong>${inv.currency || '₦'}${Number(inv.amount).toLocaleString()}</strong> is due for payment today.</p>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://kudislip.com.ng/pay/${inv.id}" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Proceed to Payment</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">Prompt payment is highly appreciated. Please disregard this notice if payment has already been made.</p>
              </div>
              <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
                  Follow us on Instagram <a href="https://instagram.com/kudislip" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislip</a>
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
              </div>
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

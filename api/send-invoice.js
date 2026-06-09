import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientEmail, clientName, invoiceAmount, invoiceLink, vendorName, invoiceId } = req.body;

    if (!clientEmail || !invoiceLink || !invoiceId) {
      return res.status(400).json({ error: 'Missing required fields for email delivery.' });
    }

    const data = await resend.emails.send({
      from: 'KudiSlip Invoicing <invoices@kudislip.com.ng>', 
      to: clientEmail,
      subject: `Invoice Notification: ${vendorName || 'KudiSlip Merchant'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #000000; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">KudiSlip</h1>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Invoice Notification</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello <strong>${clientName || 'Valued Client'}</strong>,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">You have received a new invoice from <strong>${vendorName || 'us'}</strong> for the amount of <strong style="color: #0F172A; font-size: 18px;">${invoiceAmount}</strong>.</p>
            
            <div style="margin: 32px 0; text-align: center;">
              <a href="${invoiceLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; font-size: 16px;">View & Pay Invoice</a>
            </div>
            
            <p style="color: #10B981; font-size: 13px; text-align: center; font-weight: 700; margin-bottom: 8px;">
              &#128274; This is a secure payment link processed via KudiSlip and Paystack.
            </p>
          </div>
          
         <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 13px; margin: 0 0 12px 0;">
              <a href="https://instagram.com/kudislipp" target="_blank" style="color: #3B82F6; text-decoration: none; font-weight: 600;">Follow us on Instagram</a>
            </p>
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">
              &copy; 2026 KudiSlip Technologies. All rights reserved.
            </p>
          </div>
      `,
      tags: [
        {
          name: 'invoiceId',
          value: invoiceId.toString()
        }
      ]
    });

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({ success: true, data });
    
  } catch (error) {
    console.error('Resend Delivery Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

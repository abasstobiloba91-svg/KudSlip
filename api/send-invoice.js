import { Resend } from 'resend';

// Initialize Resend with your API Key from Vercel Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientEmail, clientName, invoiceAmount, invoiceLink, vendorName, invoiceId } = req.body;

    // Validate that we have the essential data
    if (!clientEmail || !invoiceLink || !invoiceId) {
      return res.status(400).json({ error: 'Missing required fields for email delivery.' });
    }

    // Fire the email via Resend
    const data = await resend.emails.send({
      // NOTE: Make sure this email address matches the domain you verified in Resend!
      from: 'KudiSlip Invoicing <invoices@kudislip.com.ng>', 
      to: clientEmail,
      subject: `New Invoice from ${vendorName || 'KudiSlip Merchant'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
          <h2 style="color: #0F172A; margin-top: 0;">Hello ${clientName || 'Valued Client'},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You have a new pending invoice from <strong>${vendorName || 'us'}</strong> for the amount of <strong style="color: #0F172A;">${invoiceAmount}</strong>.
          </p>
          <div style="margin: 32px 0;">
            <a href="${invoiceLink}" style="background-color: #000000; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View & Pay Invoice
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px;">
            Securely powered by KudiSlip.
          </p>
        </div>
      `,
      // 🎯 THE TRACKING ENGINE
      // This attaches the invisible ID to the email so your Webhook knows exactly who opened it!
      tags: [
        {
          name: 'invoiceId',
          value: invoiceId
        }
      ]
    });

    // Check if Resend rejected the email
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Success!
    return res.status(200).json({ success: true, data });
    
  } catch (error) {
    console.error('Resend Delivery Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

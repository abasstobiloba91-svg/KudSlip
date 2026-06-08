import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(455).json({ error: 'Method not allowed' });

  try {
    const { clientEmail, clientName, invoiceAmount, invoiceLink, vendorName } = req.body;
    if (!clientEmail) return res.status(400).json({ error: 'Client email is required' });

    const { data, error } = await resend.emails.send({
      from: 'KudiSlip Billing <invoices@kudislip.com.ng>',
      to: [clientEmail],
      subject: `New Invoice Received from ${vendorName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0;">Invoice Notification</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Dear ${clientName},</p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Please be advised that a new invoice for <strong>${invoiceAmount}</strong> has been generated for you by <strong>${vendorName}</strong>.</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${invoiceLink}" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View and Pay Invoice</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">This is a secure payment link processed via KudiSlip and Paystack.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
              Follow us on Instagram <a href="https://instagram.com/kudislip" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislip</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) return res.status(400).json({ error });
    return res.status(200).json({ message: 'Invoice email sent successfully!', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

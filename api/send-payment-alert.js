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
    const { vendorEmail, vendorName, clientName, amount, currency, invoiceId } = req.body;
    if (!vendorEmail) return res.status(400).json({ error: 'Vendor email is required' });

    const { data, error } = await resend.emails.send({
      from: 'KudiSlip Billing <invoices@kudislip.com.ng>',
      to: [vendorEmail],
      subject: `Payment Confirmation: ${currency}${amount}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0;">Payment Confirmed</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Dear ${vendorName},</p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">We are writing to confirm that your client, <strong>${clientName}</strong>, has successfully completed the payment for invoice <strong>#${invoiceId.substring(0, 8)}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #0f172a;"><strong>Amount Paid:</strong> ${currency}${amount}</p>
              <p style="margin: 0; color: #0f172a;"><strong>Status:</strong> Settled via Paystack</p>
            </div>
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Log In to Dashboard</a>
            </div>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">The funds are currently being processed and will be deposited into your linked bank account according to your settlement schedule.</p>
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
    return res.status(200).json({ message: 'Payment alert sent successfully!', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

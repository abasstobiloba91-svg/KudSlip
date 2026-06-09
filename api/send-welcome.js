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
    const { userEmail, businessName } = req.body;
    if (!userEmail) return res.status(400).json({ error: 'Email is required' });

    const { data, error } = await resend.emails.send({
      from: 'KudiSlip <hello@kudislip.com.ng>',
      to: [userEmail],
      subject: 'Welcome to KudiSlip',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0;">Welcome aboard, ${businessName || 'Merchant'}.</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Thank you for choosing KudiSlip to power your business invoicing and automated payments.</p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Your account is fully active. You can start creating professional invoices, tracking your customers, and receiving split payouts instantly.</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you require assistance, simply reply directly to this email. Our support team is here to help.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
              Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislip</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) return res.status(400).json({ error });
    return res.status(200).json({ message: 'Welcome email sent successfully!', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

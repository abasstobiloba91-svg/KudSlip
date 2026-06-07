import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userEmail, businessName } = req.body;
  if (!userEmail || !businessName) return res.status(400).json({ error: 'Missing email or business name' });

  try {
    const data = await resend.emails.send({
      from: 'KudiSlip <invoices@kudislip.com.ng>',
      to: [userEmail],
      subject: 'Welcome to KudiSlip',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; margin-bottom: 8px;">Welcome aboard, ${businessName}.</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">We are pleased to have you join the KudiSlip network.</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="color: #0f172a; font-size: 15px; line-height: 1.6; margin-top: 0;">Your account is now fully active. You can immediately begin to:</p>
            <ul style="color: #64748b; font-size: 15px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Generate clean, professional invoices.</li>
              <li style="margin-bottom: 8px;">Receive bank settlements automatically via Paystack.</li>
              <li>Track your outstanding revenue and business health.</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <a href="https://kudislip.com.ng/login" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 15px;">Access Your Dashboard</a>
          </div>

          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px dashed #cbd5e1; color: #94a3b8; font-size: 13px;">
            If you require any assistance, please reply directly to this email.<br/>
            © KudiSlip Technologies
          </div>
        </div>
      `
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

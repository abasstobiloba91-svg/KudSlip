import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method not allowed' });
  }

  try {
    // 🎯 THE FIX: Matches the exact words the frontend is sending
    const { userEmail, businessName } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'KudiSlip <hello@kudislip.com.ng>',
      to: [userEmail],
      subject: 'Welcome to KudiSlip! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">Welcome aboard, ${businessName || 'Merchant'}! 👋</h2>
          <p>Thank you for choosing KudiSlip to power your business invoicing and automated payments.</p>
          <p>Your account is now fully active. You can start creating professional invoices, tracking your customers, and receiving split payouts instantly.</p>
          <br />
          <a href="https://kudislip.com.ng" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          <br /><br />
          <p style="color: #64748b; font-size: 14px;">If you have any questions, reply directly to this email. Our support team is always here to help.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} KudiSlip. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ message: 'Welcome email sent successfully!', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

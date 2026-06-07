import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { vendorEmail, vendorName, clientName, amount, currency, invoiceId } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'KudiSlip Billing <invoices@kudislip.com.ng>',
      to: [vendorEmail],
      subject: `Payment Received: ${currency}${amount} from ${clientName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Payment Successfully Processed</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello ${vendorName},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Please be advised that <strong>${clientName}</strong> has completed the payment for their invoice.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 24px;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Invoice Reference</p>
            <p style="margin: 4px 0 16px 0; color: #0f172a; font-weight: 700; font-size: 15px;">INV-${invoiceId.substring(0,6).toUpperCase()}</p>
            
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Amount Settled</p>
            <p style="margin: 4px 0 0 0; color: #10b981; font-weight: 900; font-size: 24px;">${currency}${amount}</p>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <a href="https://kudislip.com.ng/dashboard/invoices" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">View in Dashboard</a>
          </div>
        </div>
      `
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

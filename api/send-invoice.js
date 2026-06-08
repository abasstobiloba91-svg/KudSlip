export default async function handler(req, res) {
  // 1. Only allow secure POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Grab the invoice details sent from your React frontend
  const { clientEmail, clientName, invoiceAmount, invoiceLink, vendorName } = req.body;
  
  // 3. Grab the secure API key from Vercel
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing API Key' });
  }

  try {
    // 4. Send the request to Resend's servers
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // NOTE: Until you verify your domain, you must use this onboarding email
      from: 'KudiSlip Billing <invoices@kudislip.com.ng>',
        to: [clientEmail],
        subject: `New Invoice from ${vendorName}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0F172A; font-size: 24px; margin: 0;">Payment Request</h2>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello <strong>${clientName}</strong>,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">You have received a new secure invoice from <strong>${vendorName}</strong>.</p>
            
            <div style="background-color: #F8FAFC; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;">
              <div style="font-size: 14px; color: #64748B; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-bottom: 8px;">Total Due</div>
              <div style="font-size: 32px; font-weight: 900; color: #0F172A;">₦${Number(invoiceAmount).toLocaleString()}</div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${invoiceLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View & Pay Securely</a>
            </div>

            <p style="color: #64748B; font-size: 14px; text-align: center;">Thank you for your business!</p>
            
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
            <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0;">Powered by <strong>KudiSlip</strong></p>
          </div>
        `
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } else {
      return res.status(400).json({ error: data.message });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

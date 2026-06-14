// =========================================================
// API ROUTE: /api/send-otp.js (SECURE BANK UPDATE)
// =========================================================
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { email, vendorId, businessName } = req.body;

    // 1. Generate a secure 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Set expiration for 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

    // 3. Save to database
    const { error: dbError } = await supabaseAdmin
      .from('vendors')
      .update({ otp_code: otpCode, otp_expires_at: expiresAt })
      .eq('id', vendorId);

    if (dbError) throw new Error(dbError.message);

    // 4. The Official KudiSlip HTML Email Template
    const htmlTemplate = `
      
        
          
          
            
            Security Verification
          

          
            
              Hello ${businessName || 'Merchant'},
              We received a request to update the payout bank account linked to your KudiSlip profile. To authorize this change, please enter the secure code below:
            

            
              ${otpCode}
            

            
              ⚠️ This code expires in 15 minutes.
            
            
              If you did not request this change, please ignore this email or contact support immediately to secure your account.
            
          

          
            
              © 2026 KudiSlip Technologies
            
            
              Follow us on Instagram @KudiSlip
            
          

        
      
    `;

    await resend.emails.send({
      from: 'KudiSlip Security ',
      to: email,
      subject: `${otpCode} is your KudiSlip verification code`,
      html: htmlTemplate
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

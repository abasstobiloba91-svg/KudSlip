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

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 4. The Official KudiSlip HTML Email Template
    const htmlTemplate = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #0F172A;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <div style="padding: 32px; text-align: center; border-bottom: 1px solid #E2E8F0;">
            <img src="https://www.kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 40px; margin-bottom: 16px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Security Verification</h2>
          </div>

          <div style="padding: 32px;">
            <p style="margin-top: 0; font-size: 15px; color: #64748B; line-height: 1.6;">
              Hello ${businessName || 'Merchant'},<br><br>
              We received a request to update the payout bank account linked to your KudiSlip profile. To authorize this change, please enter the secure code below:
            </p>

            <div style="background-color: #F1F5F9; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
              <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #000000;">${otpCode}</div>
            </div>

            <p style="margin: 0; font-size: 13px; color: #EF4444; font-weight: 600; text-align: center;">
              ⚠️ This code expires in 15 minutes.
            </p>
            <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 24px;">
              If you did not request this change, please ignore this email or contact support immediately to secure your account.
            </p>
          </div>

          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 700;">
              © 2026 KudiSlip Technologies
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #94A3B8;">
              Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #3B82F6; text-decoration: none; font-weight: 700;">@KudiSlip</a>
            </p>
          </div>

        </div>
      </div>
    `;

    // 5. Send the email with STRICT error checking
    // 🚨 IMPORTANT: Change "support@kudislip.com.ng" if you use a different verified email in Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'KudiSlip Security <support@kudislip.com.ng>', 
      to: email,
      subject: `${otpCode} is your KudiSlip verification code`,
      html: htmlTemplate
    });

    // 6. Force Vercel to log the exact truth if Resend rejects it
    if (resendError) {
      console.error("🔴 Resend Rejected the Email:", resendError);
      throw new Error(`Resend Error: ${resendError.message}`);
    }

    console.log("🟢 Email Sent Successfully! ID:", resendData?.id);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("🔴 OTP Send Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// api/send-reset-email.js
import { createClient } from '@supabase/supabase-js';

// You must install resend: npm install resend
import { Resend } from 'resend';

// Use your actual Resend API Key here (store it in .env!)
const resend = new Resend(process.env.RESEND_API_KEY);

// You MUST use the SERVICE ROLE KEY here, not the anon key, to bypass RLS and generate admin links
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email } = req.body;

  try {
    // 1. Generate the reset link using Supabase Admin
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) throw error;

    // The generated link looks like: https://yourproject.supabase.co/auth/v1/verify?token=xyz...
    // You should ideally redirect this to your own frontend reset page.
    const resetLink = data.properties.action_link;

    // 2. Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: 'KudiSlip Support <support@kudislip.com>', // MUST be a verified domain in Resend
      to: [email],
      subject: 'Reset your KudiSlip Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset the password for your KudiSlip account.</p>
          <p>Click the button below to securely reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">Reset Password</a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `
    });

    return res.status(200).json({ success: true, emailResponse });

  } catch (error) {
    console.error("Reset Email Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

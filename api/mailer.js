import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS Headers for secure frontend connection
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;
    const { type } = payload;
    
    let from, to, subject, html, tags;

    switch (type) {
      // 1. WELCOME EMAIL
      case 'welcome':
        if (!payload.userEmail) return res.status(400).json({ error: 'Email is required' });
        from = 'KudiSlip <hello@kudislip.com.ng>';
        to = payload.userEmail;
        subject = 'Welcome to KudiSlip';
        html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0;">Welcome aboard, ${payload.businessName || 'Merchant'}.</h2>
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
        </div>`;
        break;

      // 2. INVOICE DISPATCH
      case 'invoice':
        if (!payload.clientEmail || !payload.invoiceLink || !payload.invoiceId) {
          return res.status(400).json({ error: 'Missing required fields for email delivery.' });
        }
        from = 'KudiSlip Invoicing <invoices@kudislip.com.ng>';
        to = payload.clientEmail;
        subject = `Invoice Notification: ${payload.vendorName || 'KudiSlip Merchant'}`;
        tags = [{ name: 'invoiceId', value: payload.invoiceId.toString() }];
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #000000; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">KudiSlip</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Invoice Notification</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello <strong>${payload.clientName || 'Valued Client'}</strong>,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">You have received a new invoice from <strong>${payload.vendorName || 'us'}</strong> for the amount of <strong style="color: #0F172A; font-size: 18px;">${payload.invoiceAmount}</strong>.</p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${payload.invoiceLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; font-size: 16px;">View & Pay Invoice</a>
            </div>
            <p style="color: #10B981; font-size: 13px; text-align: center; font-weight: 700; margin-bottom: 8px;">
              &#128274; This is a secure payment link processed via KudiSlip and Paystack.
            </p>
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 13px; margin: 0 0 12px 0;">
              <a href="https://instagram.com/kudislipp" target="_blank" style="color: #3B82F6; text-decoration: none; font-weight: 600;">Follow us on Instagram</a>
            </p>
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 3. SECURE OTP
      case 'otp':
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

        const { error: dbError } = await supabaseAdmin
          .from('vendors')
          .update({ otp_code: otpCode, otp_expires_at: expiresAt })
          .eq('id', payload.vendorId);

        if (dbError) throw new Error(`Database error: ${dbError.message}`);

        from = 'KudiSlip Security <support@kudislip.com.ng>';
        to = payload.email;
        subject = `${otpCode} is your KudiSlip verification code`;
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #0F172A;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
            <div style="padding: 32px; text-align: center; border-bottom: 1px solid #E2E8F0;">
              <img src="https://www.kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 40px; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Security Verification</h2>
            </div>
            <div style="padding: 32px;">
              <p style="margin-top: 0; font-size: 15px; color: #64748B; line-height: 1.6;">
                Hello ${payload.businessName || 'Merchant'},<br><br>
                We received a request to update the payout bank account linked to your KudiSlip profile. To authorize this change, please enter the secure code below:
              </p>
              <div style="background-color: #F1F5F9; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #000000;">${otpCode}</div>
              </div>
              <p style="margin: 0; font-size: 13px; color: #EF4444; font-weight: 600; text-align: center;">⚠️ This code expires in 15 minutes.</p>
              <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 24px;">
                If you did not request this change, please ignore this email or contact support immediately to secure your account.
              </p>
            </div>
            <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 700;">© ${new Date().getFullYear()} KudiSlip Technologies</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #94A3B8;">
                Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #3B82F6; text-decoration: none; font-weight: 700;">@KudiSlip</a>
              </p>
            </div>
          </div>
        </div>`;
        break;

      // 4. PAYMENT ALERT
      case 'payment_alert':
        if (!payload.vendorEmail) return res.status(400).json({ error: 'Vendor email is required' });
        from = 'KudiSlip Billing <invoices@kudislip.com.ng>';
        to = payload.vendorEmail;
        subject = `Payment Confirmation: ${payload.currency}${payload.amount}`;
        html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0;">Payment Confirmed</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Dear ${payload.vendorName},</p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">We are writing to confirm that your client, <strong>${payload.clientName}</strong>, has successfully completed the payment for invoice <strong>#${payload.invoiceId?.substring(0, 8)}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #0f172a;"><strong>Amount Paid:</strong> ${payload.currency}${payload.amount}</p>
              <p style="margin: 0; color: #0f172a;"><strong>Status:</strong> Settled via Paystack</p>
            </div>
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Log In to Dashboard</a>
            </div>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">The funds are currently being processed and will be deposited into your linked bank account according to your settlement schedule.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
              Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 5. RESET EMAIL
      case 'reset_email':
        if (!payload.email) return res.status(400).json({ error: 'Email is required' });
        
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: payload.email,
          options: { redirectTo: 'https://kudislip.com.ng/update-password' }
        });
        
        if (resetError) throw resetError;
        
        from = 'KudiSlip Support <support@kudislip.com.ng>';
        to = payload.email;
        subject = 'Reset Your KudiSlip Password';
        html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 60px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0; text-align: left;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip Logo" style="height: 48px; object-fit: contain;" />
            </div>
            <h2 style="color: #000000; font-size: 24px; font-weight: 900; margin-top: 0; margin-bottom: 16px; text-align: center; letter-spacing: -0.5px;">Reset Your Password</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px; text-align: center; font-weight: 500;">
              We received a request to unlock your KudiSlip command center. Click the button below to securely set a new password and regain access.
            </p>
            <div style="text-align: center;">
              <a href="${resetData.properties.action_link}" style="display: inline-block; background-color: #000000; color: #FFFFFF; padding: 16px 32px; border-radius: 8px; font-weight: 800; text-decoration: none; font-size: 15px;">
                Securely Reset Password
              </a>
            </div>
            <div style="border-top: 1px solid #E2E8F0; margin-top: 32px; padding-top: 24px;">
              <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin: 0; text-align: center; font-weight: 500;">
                If you didn't request this, you can safely ignore this email. Your KudiSlip account remains completely secure.
              </p>
            </div>
          </div>
          <div style="margin-top: 32px; text-align: center;">
            <a href="https://instagram.com/kudislipp" style="color: #000000; text-decoration: none; font-size: 14px; font-weight: 800; display: inline-block; margin-bottom: 12px;">Follow us on Instagram @kudislipp</a>
            <div style="color: #64748B; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; ${new Date().getFullYear()} KudiSlip Technologies.</div>
          </div>
        </div>`;
        break;

      // 6. PRO SUBSCRIPTION WARNING
      case 'subscription_warning':
        if (!payload.email || !payload.daysLeft) return res.status(400).json({ error: 'Missing required fields' });
        from = 'KudiSlip Subscriptions <hello@kudislip.com.ng>';
        to = payload.email;
        subject = `⚠️ Action Required: Your KudiSlip Pro plan expires in ${payload.daysLeft} days`;
        html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #FEF08A; padding: 24px; text-align: center;">
            <h2 style="margin: 0; color: #854D0E; font-size: 20px;">Pro Plan Expiring Soon!</h2>
          </div>
          <div style="padding: 32px 24px; background: #FFFFFF; text-align: center;">
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${payload.businessName || 'Merchant'}</strong>,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your KudiSlip Pro subscription is set to expire in exactly <strong>${payload.daysLeft} days</strong>.</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">Don't lose access to your Profit Analytics and premium CRM features! Click below to renew your plan securely and keep your business running smoothly.</p>
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="${payload.upgradeLink}" style="background-color: #000000; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; display: inline-block;">Renew Pro Plan Now</a>
            </div>
          </div>
          <div style="background-color: #F8FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type specified.' });
    }

    // FIRE THE EMAIL VIA RESEND
    const emailConfig = { from, to: [to], subject, html };
    if (tags) emailConfig.tags = tags;

    const { data: resendData, error: resendError } = await resend.emails.send(emailConfig);
    
    if (resendError) throw resendError;
    
    return res.status(200).json({ success: true, message: 'Email sent successfully!', data: resendData });

  } catch (error) {
    console.error("Mailer Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

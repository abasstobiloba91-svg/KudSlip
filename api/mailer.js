import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS configuration
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
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a></p>
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
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
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 13px; margin: 0 0 12px 0;"><a href="https://instagram.com/kudislipp" target="_blank" style="color: #3B82F6; text-decoration: none; font-weight: 600;">Follow us on Instagram</a></p>
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
              <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 40px; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Security Verification</h2>
            </div>
            <div style="padding: 32px;">
              <p style="margin-top: 0; font-size: 15px; color: #64748B;">Hello ${payload.businessName || 'Merchant'},</p>
              <div style="background-color: #F1F5F9; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #000000;">${otpCode}</div>
              </div>
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
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Your client <strong>${payload.clientName}</strong> paid invoice <strong>#${payload.invoiceId?.substring(0, 8)}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #0f172a;"><strong>Amount Paid:</strong> ${payload.currency}${payload.amount}</p>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a></p>
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
        <div style="font-family: sans-serif; background-color: #F8FAFC; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; padding: 32px; border: 1px solid #E2E8F0; text-align: left;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip Logo" style="height: 48px; object-fit: contain;" />
            </div>
            <h2 style="color: #000000; font-size: 22px; font-weight: 900; margin-top: 0; text-align: center;">Reset Your Password</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center;">Click below to set a new secure password.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetData.properties.action_link}" style="background-color: #000000; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; font-weight: 800; text-decoration: none; display: inline-block;">Securely Reset Password</a>
            </div>
          </div>
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://instagram.com/kudislipp" style="color: #000000; text-decoration: none; font-size: 13px; font-weight: 700;">Follow us on Instagram @kudislipp</a>
            <div style="color: #64748B; font-size: 12px; margin-top: 6px;">&copy; ${new Date().getFullYear()} KudiSlip Technologies.</div>
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
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #FEF08A; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #854D0E; font-size: 18px;">Pro Plan Expiring Soon!</h2>
          </div>
          <div style="padding: 24px; background: #FFFFFF; text-align: center;">
            <p style="color: #475569; font-size: 15px;">Hello <strong>${payload.businessName || 'Merchant'}</strong>,</p>
            <p style="color: #475569; font-size: 15px;">Your Pro subscription expires in <strong>${payload.daysLeft} days</strong>.</p>
            <a href="${payload.upgradeLink}" style="background-color: #000000; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 16px;">Renew Pro Plan Now</a>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 7. KYC STATUS NOTIFICATION
      case 'kyc_status':
        if (!payload.email || !payload.status) return res.status(400).json({ error: 'Email and status required' });
        from = 'KudiSlip Verification <compliance@kudislip.com.ng>';
        to = payload.email;
        const isApproved = payload.status === 'approved';
        subject = isApproved ? 'Your KudiSlip Account is Officially Verified!' : 'Update Regarding Your Business Verification';
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: ${isApproved ? '#10B981' : '#EF4444'}; margin-top: 0; font-size: 20px; font-weight: 800;">
              ${isApproved ? 'Business Verification Approved' : 'Verification Document Rejected'}
            </h2>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${payload.businessName || 'Merchant'}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              ${isApproved 
                ? 'Great news! Your CAC business verification documents have been reviewed and approved by our compliance team. You now have full access to all verified merchant capabilities on KudiSlip.' 
                : 'Our compliance team reviewed your submitted documents, but we were unable to approve your verification at this time. Please check your document upload and resubmit a valid copy.'}
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Open Dashboard</a>
            </div>
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a></p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 8. SYSTEM BROADCAST EMAIL
      case 'broadcast':
        if (!payload.emails || !payload.subject || !payload.message) {
          return res.status(400).json({ error: 'Recipients, subject, and message are required.' });
        }

        const recipientList = Array.isArray(payload.emails) ? payload.emails : [payload.emails];
        from = 'KudiSlip Announcement <hello@kudislip.com.ng>';
        subject = payload.subject;

        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px; font-weight: 800;">${payload.subject}</h2>
            <div style="font-size: 15px; color: #475569; line-height: 1.7; white-space: pre-wrap; margin-bottom: 24px;">${payload.message}</div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Go to Dashboard</a>
            </div>
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
              Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;

        const sendPromises = recipientList.map(recipientEmail => {
          const emailParams = {
            from,
            to: recipientEmail,
            subject,
            html,
            tags: [
              { name: 'email_type', value: 'broadcast' },
              { name: 'recipient_email', value: recipientEmail }
            ]
          };
          if (payload.recordId) {
            emailParams.tags.push({ name: 'tracking_id', value: payload.recordId });
          }
          return resend.emails.send(emailParams);
        });

        await Promise.all(sendPromises);

        return res.status(200).json({ success: true, message: `Broadcast successfully emailed to ${recipientList.length} users!` });

      // 9. ONBOARDING / INACTIVE VENDOR FOLLOW-UP
      case 'onboarding_followup':
        if (!payload.email) return res.status(400).json({ error: 'Email is required' });
        from = 'KudiSlip <hello@kudislip.com.ng>';
        to = payload.email;
        subject = `Need a hand getting started with KudiSlip?`;
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>

          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px; font-weight: 800;">We’re ready when you are!</h2>
            
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              Hello <strong>${payload.businessName || 'Merchant'}</strong>,
            </p>

            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              We noticed you created a KudiSlip account recently, but you haven't sent your first invoice yet. 
            </p>

            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              Whether you hit a quick roadblock, have a question about setting up bank payouts, or simply haven't found the time—our team is standing by to help you get everything set up.
            </p>

            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <div style="font-weight: 800; color: #0F172A; font-size: 14px; margin-bottom: 6px;">💡 Did you know?</div>
              <div style="font-size: 14px; color: #64748B; line-height: 1.5;">
                Creating and sending a professional payment link to your client on KudiSlip takes <strong>less than 60 seconds</strong>.
              </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://kudislip.com.ng" style="background-color: #000000; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Create Your First Invoice
              </a>
            </div>

            <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 0;">
              If you have any questions or need help setting up, <strong>simply reply directly to this email</strong>. We answer every single message!
            </p>
          </div>

          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
              Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 10. DIRECT EMAIL CAMPAIGN (FROM INTERNAL DASHBOARD)
      case 'campaign':
        if (!payload.emails || !payload.subject || !payload.message) {
          return res.status(400).json({ error: 'Recipient, subject, and message are required.' });
        }

        from = 'KudiSlip <hello@kudislip.com.ng>';
        to = payload.emails;
        subject = payload.subject;

        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px; font-weight: 800;">${payload.subject}</h2>
            <div style="font-size: 15px; color: #475569; line-height: 1.7; white-space: pre-wrap; margin-bottom: 24px;">${payload.message}</div>
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;

        tags = [
          { name: 'email_type', value: 'campaign' },
          { name: 'recipient_email', value: payload.emails }
        ];

        if (payload.recordId) {
          tags.push({ name: 'tracking_id', value: payload.recordId });
        }

        const { data: campaignData, error: campaignError } = await resend.emails.send({
          from,
          to,
          subject,
          html,
          tags
        });

        if (campaignError) {
          console.error("Resend Campaign Error:", campaignError);
          return res.status(500).json({ error: campaignError.message }); 
        }

        return res.status(200).json({ success: true, data: campaignData });

      default:
        return res.status(400).json({ error: 'Invalid email type specified.' });
    }

    // Fire non-broadcast single emails (for cases 1-7, 9)
    if (type !== 'broadcast' && type !== 'campaign') {
      const emailConfig = { from, to: Array.isArray(to) ? to : [to], subject, html };
      if (tags) emailConfig.tags = tags;

      const { data: resendData, error: resendError } = await resend.emails.send(emailConfig);
      if (resendError) throw resendError;
      
      return res.status(200).json({ success: true, message: 'Email sent successfully!', data: resendData });
    }

  } catch (error) {
    console.error("Mailer Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

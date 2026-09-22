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

      // 3. PRICE QUOTE DISPATCH (SENT TO CLIENT)
      case 'quote':
        if (!payload.clientEmail || !payload.invoiceLink || !payload.invoiceId) {
          return res.status(400).json({ error: 'Missing required fields for quote delivery.' });
        }
        from = 'KudiSlip Invoicing <invoices@kudislip.com.ng>';
        to = payload.clientEmail;
        subject = `Price Quote Notification: ${payload.vendorName || 'KudiSlip Merchant'}`;
        tags = [{ name: 'invoiceId', value: payload.invoiceId.toString() }];
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #000000; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">KudiSlip</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Price Quote Notification</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello <strong>${payload.clientName || 'Valued Client'}</strong>,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">You have received a new price quote from <strong>${payload.vendorName || 'us'}</strong> for the estimated amount of <strong style="color: #0F172A; font-size: 18px;">${payload.invoiceAmount}</strong>.</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">Please click below to review the breakdown and accept or decline the quote.</p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${payload.invoiceLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; font-size: 16px;">Review & Accept Quote</a>
            </div>
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 13px; margin: 0 0 12px 0;"><a href="https://instagram.com/kudislipp" target="_blank" style="color: #3B82F6; text-decoration: none; font-weight: 600;">Follow us on Instagram</a></p>
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 4. QUOTE RESPONSE ALERT (SENT TO MERCHANT WHEN CLIENT ACCEPTS/DECLINES)
      case 'quote_response':
        if (!payload.vendorEmail) return res.status(400).json({ error: 'Vendor email is required' });
        const isApprovedQuote = payload.action === 'approved';
        from = 'KudiSlip Billing <invoices@kudislip.com.ng>';
        to = payload.vendorEmail;
        subject = isApprovedQuote 
          ? `Quote Approved: ${payload.invoiceNumber}` 
          : `Quote Declined: ${payload.invoiceNumber}`;
          
        html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: ${isApprovedQuote ? '#10b981' : '#ef4444'}; margin-top: 0;">${isApprovedQuote ? 'Quote Approved' : 'Quote Declined'}</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Dear ${payload.vendorName || 'Merchant'},</p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Your client <strong>${payload.clientName || 'Client'}</strong> has <strong>${isApprovedQuote ? 'approved' : 'declined'}</strong> price quote <strong>${payload.invoiceNumber}</strong>.</p>
            
            ${payload.declineReason ? `
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 18px; border-radius: 8px; margin: 20px 0; color: #991b1b;">
              <strong style="display: block; margin-bottom: 4px; font-size: 14px;">Reason Provided by Client:</strong>
              <span style="font-size: 15px;">"${payload.declineReason}"</span>
            </div>
            ` : ''}

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #0f172a;"><strong>Quote Amount:</strong> ${payload.currency || '₦'}${payload.amount}</p>
              <p style="margin: 8px 0 0 0; color: ${isApprovedQuote ? '#10b981' : '#ef4444'}; font-weight: 700;">Status: ${isApprovedQuote ? 'Converted to Payable Invoice' : 'Declined by Client'}</p>
            </div>
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://kudislip.com.ng/dashboard/invoices" style="background-color: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View in Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a></p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 5. SECURE OTP / SECURITY CODE
      case 'otp':
      case 'security_otp':
      case 'security_code':
        const targetEmail = payload.email || payload.userEmail;
        if (!targetEmail) return res.status(400).json({ error: 'Recipient email is required.' });

        let displayOtpCode = payload.code || payload.otp || payload.message;
        
        if (!displayOtpCode || typeof displayOtpCode !== 'string' || displayOtpCode.length !== 6) {
          displayOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        }

        if (payload.vendorId) {
          const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();
          await supabaseAdmin
            .from('vendors')
            .update({ otp_code: displayOtpCode, otp_expires_at: expiresAt })
            .eq('id', payload.vendorId);
        }

        from = 'KudiSlip Security <support@kudislip.com.ng>';
        to = targetEmail;
        subject = `${displayOtpCode} is your KudiSlip verification code`;
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #0F172A;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
            <div style="padding: 32px; text-align: center; border-bottom: 1px solid #E2E8F0;">
              <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 40px; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Security Verification</h2>
            </div>
            <div style="padding: 32px;">
              <p style="margin-top: 0; font-size: 15px; color: #64748B;">Hello ${payload.businessName || 'Merchant'},</p>
              <p style="font-size: 14px; color: #64748B;">Use the verification code below to authorize your action on KudiSlip:</p>
              <div style="background-color: #F1F5F9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #000000;">${displayOtpCode}</div>
              </div>
              <p style="color: #94A3B8; font-size: 12px; margin: 0; text-align: center;">This code expires in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          </div>
        </div>`;
        break;

      // 6. PAYMENT ALERT (SENT TO MERCHANT)
      case 'payment_alert':
        if (!payload.vendorEmail) return res.status(400).json({ error: 'Vendor email is required' });
        
        const isPartialAlert = payload.balanceDue && Number(payload.balanceDue.replace(/,/g, '')) > 0;
        
        from = 'KudiSlip Billing <invoices@kudislip.com.ng>';
        to = payload.vendorEmail;
        subject = isPartialAlert 
          ? `Partial Payment Received: ${payload.currency}${payload.amount}` 
          : `Payment Confirmation: ${payload.currency}${payload.amount}`;
          
        html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 70px; width: auto; max-width: 100%;" />
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #0f172a; margin-top: 0;">${isPartialAlert ? 'Partial Payment Logged' : 'Payment Confirmed'}</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Dear ${payload.vendorName},</p>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">Your client <strong>${payload.clientName}</strong> paid invoice <strong>${payload.invoiceNumber}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #0f172a;"><strong>Amount Paid:</strong> ${payload.currency}${payload.amount}</p>
              ${isPartialAlert ? `<p style="margin: 12px 0 0 0; padding-top: 12px; border-top: 1px dashed #cbd5e1; color: #ef4444;"><strong>Balance Remaining:</strong> ${payload.currency}${payload.balanceDue}</p>` : ''}
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a></p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;
        break;

      // 7. OFFICIAL PAYMENT RECEIPT (SENT TO CLIENT)
      case 'client_receipt':
        if (!payload.clientEmail) return res.status(400).json({ error: 'Client email is required' });
        
        const isPartialReceipt = payload.balanceDue && Number(payload.balanceDue.replace(/,/g, '')) > 0;
        
        from = 'KudiSlip Receipts <receipts@kudislip.com.ng>';
        to = payload.clientEmail;
        subject = isPartialReceipt 
          ? `Partial Payment Receipt - ${payload.vendorName}`
          : `Receipt for your payment to ${payload.vendorName}`;
          
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: #0F172A; text-align: center; margin-top: 0; font-size: 24px; font-weight: 800;">${isPartialReceipt ? 'Partial Payment Receipt' : 'Payment Receipt'}</h2>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Hello <strong>${payload.clientName}</strong>,</p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Thank you for your payment to <strong>${payload.vendorName}</strong>. Your transaction was successful.</p>

            <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
              <div style="margin: 0; color: #065F46; font-size: 32px; font-weight: 900;">${payload.currency}${payload.amount}</div>
              <div style="margin: 8px 0 0 0; color: #10B981; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">${isPartialReceipt ? 'Partial Payment Received' : 'Paid Successfully'}</div>
            </div>

            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 24px; font-size: 15px;">
              <tr>
                <th style="padding: 12px 0; color: #64748B; font-weight: normal; border-bottom: 1px solid #E2E8F0;">Invoice Number</th>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0F172A; border-bottom: 1px solid #E2E8F0;">${payload.invoiceNumber}</td>
              </tr>
              <tr>
                <th style="padding: 12px 0; color: #64748B; font-weight: normal; border-bottom: 1px solid #E2E8F0;">Date Paid</th>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0F172A; border-bottom: 1px solid #E2E8F0;">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
              <tr>
                <th style="padding: 12px 0; color: #64748B; font-weight: normal; ${isPartialReceipt ? 'border-bottom: 1px solid #E2E8F0;' : ''}">Payment Method</th>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0F172A; ${isPartialReceipt ? 'border-bottom: 1px solid #E2E8F0;' : ''}">${payload.paymentMethod}</td>
              </tr>
              ${isPartialReceipt ? `
              <tr>
                <th style="padding: 12px 0; color: #64748B; font-weight: normal;">Remaining Balance</th>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #EF4444;">${payload.currency}${payload.balanceDue}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 13px; margin: 0 0 8px 0;">Securely processed via Paystack</p>
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">Generated by KudiSlip Technologies</p>
          </div>
        </div>`;
        break;

      // 8. RESET EMAIL
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

      // 9. PRO SUBSCRIPTION WARNING
      case 'subscription_warning':
        if (!payload.email || !payload.daysLeft) return res.status(400).json({ error: 'Missing required fields' });
        from = 'KudiSlip Subscriptions <hello@kudislip.com.ng>';
        to = payload.email;
        subject = `Action Required: Your KudiSlip Pro plan expires in ${payload.daysLeft} days`;
        html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #FEF08A; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #854D0E; font-size: 18px;">Pro Plan Expiring Soon</h2>
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

      // 10. KYC STATUS NOTIFICATION
      case 'kyc_status':
        if (!payload.email || !payload.status) return res.status(400).json({ error: 'Email and status required' });
        from = 'KudiSlip Verification <compliance@kudislip.com.ng>';
        to = payload.email;
        const isApprovedKyc = payload.status === 'approved';
        subject = isApprovedKyc ? 'Your KudiSlip Account is Officially Verified!' : 'Update Regarding Your Business Verification';
        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: ${isApprovedKyc ? '#10B981' : '#EF4444'}; margin-top: 0; font-size: 20px; font-weight: 800;">
              ${isApprovedKyc ? 'Business Verification Approved' : 'Verification Document Rejected'}
            </h2>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${payload.businessName || 'Merchant'}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              ${isApprovedKyc 
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

      // 11. SYSTEM BROADCAST EMAIL
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
              { name: 'email_type', value: 'broadcast' }
            ]
          };
          if (payload.recordId) {
            emailParams.tags.push({ name: 'tracking_id', value: payload.recordId });
          }
          return resend.emails.send(emailParams);
        });

        await Promise.all(sendPromises);

        return res.status(200).json({ success: true, message: `Broadcast successfully emailed to ${recipientList.length} users!` });

      // 12. ONBOARDING / INACTIVE VENDOR FOLLOW-UP
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
              <div style="font-weight: 800; color: #0F172A; font-size: 14px; margin-bottom: 6px;">Did you know?</div>
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

      // 13. DIRECT EMAIL CAMPAIGN
      case 'campaign':
        if (!payload.emails || !payload.subject || !payload.message) {
          return res.status(400).json({ error: 'Recipient, subject, and message are required.' });
        }

        from = 'KudiSlip <hello@kudislip.com.ng>';
        to = payload.emails;
        subject = payload.subject;

        const ctaButtonHtml = payload.ctaLink && payload.ctaText ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${payload.ctaLink}" target="_blank" style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 15px; display: inline-block;">
              ${payload.ctaText}
            </a>
          </div>
        ` : '';

        html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <img src="https://kudislip.com.ng/logo.png" alt="KudiSlip" style="height: 60px; width: auto;" />
          </div>
          <div style="padding: 32px 24px; color: #0F172A;">
            <h2 style="color: #0F172A; margin-top: 0; font-size: 20px; font-weight: 800;">${payload.subject}</h2>
            <div style="font-size: 15px; color: #475569; line-height: 1.7; white-space: pre-wrap; margin-bottom: 16px;">${payload.message}</div>
            ${ctaButtonHtml}
          </div>
          <div style="background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;">
              Follow us on Instagram <a href="https://instagram.com/kudislipp" style="color: #000000; font-weight: bold; text-decoration: none;">@kudislipp</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KudiSlip Technologies. All rights reserved.</p>
          </div>
        </div>`;

        tags = [{ name: 'email_type', value: 'campaign' }];
        if (payload.recordId) tags.push({ name: 'tracking_id', value: payload.recordId });

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
        return res.status(400).json({ error: `Invalid email type '${type}' specified.` });
    }

    // Fire single emails
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

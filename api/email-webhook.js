// =========================================================
// API ROUTE: /api/email-webhook.js (RESEND TRACKING)
// =========================================================
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only accept POST requests from Resend
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
    
    if (!supabaseKey) {
      console.error("CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY in Vercel.");
      // NEVER return 500 to a webhook! Always return 200 so they don't disable us.
      return res.status(200).json({ success: false, error: "Missing config, but acknowledging webhook." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const event = req.body;
    console.log("WEBHOOK RECEIVED. Event Type:", event?.type);
    
    if (event?.type === 'email.opened') {
      
      // THE BULLETPROOF TAG EXTRACTOR
      let invoiceId = null;
      let emailType = null;
      let recipientEmail = null;
      let trackingId = null; // 👈 NEW: Added variable for internal campaign tracking
      
      const tags = event.data?.tags;
      
      if (Array.isArray(tags)) {
        // If Resend sends a list
        const foundInv = tags.find(t => t.name === 'invoiceId' || t.name === 'invoice_id');
        if (foundInv) invoiceId = foundInv.value;

        const foundType = tags.find(t => t.name === 'email_type');
        if (foundType) emailType = foundType.value;

        const foundRecipient = tags.find(t => t.name === 'recipient_email');
        if (foundRecipient) recipientEmail = foundRecipient.value;

        // 👈 NEW: Extract tracking_id
        const foundTracking = tags.find(t => t.name === 'tracking_id');
        if (foundTracking) trackingId = foundTracking.value;

      } else if (tags && typeof tags === 'object') {
        // If Resend sends a flat object
        invoiceId = tags.invoiceId || tags.invoice_id;
        emailType = tags.email_type;
        recipientEmail = tags.recipient_email;
        trackingId = tags.tracking_id; // 👈 NEW
      }

      console.log(`Extracted Tags -> Invoice: ${invoiceId || 'N/A'} | Type: ${emailType || 'N/A'} | Recipient: ${recipientEmail || 'N/A'} | Tracking ID: ${trackingId || 'N/A'}`);
      
      // ==========================================
      // SCENARIO 1: INVOICE WAS OPENED
      // ==========================================
      if (invoiceId) {
        const { error } = await supabase
          .from('invoices')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', invoiceId); 
          
        if (error) {
          console.error("Supabase Invoice Write Error:", error);
        } else {
          console.log("Database successfully updated for invoice:", invoiceId);
        }
      } 
      
      // ==========================================
      // SCENARIO 2: EMAIL CAMPAIGN WAS OPENED (NEW)
      // ==========================================
      if (trackingId) {
        const { error } = await supabase
          .from('sent_emails')
          .update({ 
            status: 'opened',
            opened_at: new Date().toISOString()
          })
          .eq('id', trackingId);

        if (error) {
          console.error("Supabase Campaign Tracker Write Error:", error);
        } else {
          console.log("Database successfully updated for internal campaign tracking:", trackingId);
        }
      }
      
      // ==========================================
      // SCENARIO 3: ADMIN BROADCAST WAS OPENED
      // ==========================================
      if (emailType === 'broadcast' && recipientEmail) {
        const subject = event.data?.subject || 'System Broadcast';

        const { error } = await supabase
          .from('broadcast_opens')
          .insert([{ recipient_email: recipientEmail, subject: subject }]);

        if (error) {
          console.error("Supabase Broadcast Write Error:", error);
        } else {
          console.log("Database successfully updated for broadcast read receipt:", recipientEmail);
        }
      } 
      
      // EDGE CASE: NONE WERE FOUND
      if (!invoiceId && !trackingId && !(emailType === 'broadcast' && recipientEmail)) {
        console.log("No actionable tags were found in the Resend payload.");
      }
    }
    
    // ALWAYS return 200 OK immediately so Resend stays happy and active
    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
    
  } catch (err) {
    console.error("Webhook Crash:", err);
    // Even if it fails, return 200 so Resend doesn't disable the endpoint!
    return res.status(200).json({ success: false, error: "Logged securely" });
  }
}

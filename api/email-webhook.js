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
      console.error("🔴 CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY in Vercel.");
      // 🚨 NEVER return 500 to a webhook! Always return 200 so they don't disable us.
      return res.status(200).json({ success: false, error: "Missing config, but acknowledging webhook." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const event = req.body;
    console.log("📨 WEBHOOK RECEIVED. Event Type:", event?.type);
    
    if (event?.type === 'email.opened') {
      
      // 🎯 THE BULLETPROOF TAG EXTRACTOR
      let invoiceId = null;
      const tags = event.data?.tags;
      
      if (Array.isArray(tags)) {
        // If Resend sends a list: [ { name: 'invoice_id', value: '123' } ]
        const foundTag = tags.find(t => t.name === 'invoiceId' || t.name === 'invoice_id');
        if (foundTag) invoiceId = foundTag.value;
      } else if (tags && typeof tags === 'object') {
        // If Resend sends a flat object: { invoice_id: '123' }
        invoiceId = tags.invoiceId || tags.invoice_id;
      }

      console.log("🔍 Extracted Invoice ID:", invoiceId);
      
      if (invoiceId) {
        // Update the database bypassing RLS
        const { data, error } = await supabase
          .from('invoices')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', invoiceId)
          .select(); 
          
        if (error) {
          console.error("❌ Supabase Write Error:", error);
        } else {
          console.log("✅ Database successfully updated for invoice:", invoiceId);
        }
      } else {
        console.log("⚠️ No invoiceId tag was found in the Resend payload.");
      }
    }
    
    // ✅ ALWAYS return 200 OK immediately so Resend stays happy and active
    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
    
  } catch (err) {
    console.error("🚨 Webhook Crash:", err);
    // Even if it fails, return 200 so Resend doesn't disable the endpoint!
    return res.status(200).json({ success: false, error: "Logged securely" });
  }
}

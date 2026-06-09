import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
  
  if (!supabaseKey) {
    console.error("CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY in Vercel.");
    return res.status(500).json({ error: "Missing Master Key" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const event = req.body;
    console.log("📨 WEBHOOK RECEIVED. Event Type:", event.type);
    
    if (event.type === 'email.opened') {
      const invoiceId = event.data?.tags?.invoiceId;
      console.log("🔍 Invoice ID found in tags:", invoiceId);
      
      if (invoiceId) {
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
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🚨 Webhook Crash:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

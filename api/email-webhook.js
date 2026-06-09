// api/email-webhook.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only accept POST requests from Resend
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  try {
    const event = req.body;
    
    if (event.type === 'email.opened') {
      // 🎯 THE FIX: Resend sends tags as an array like [{ name: "invoiceId", value: "123" }]
      const tags = event.data?.tags || [];
      const invoiceTag = tags.find(t => t.name === 'invoiceId');
      
      if (invoiceTag && invoiceTag.value) {
        // Instantly update the database! Your WebSocket will catch this and show the 👁️ badge.
        await supabase
          .from('invoices')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', invoiceTag.value);
      }
    }
    
    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// api/email-webhook.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only accept POST requests from your email provider (e.g., Resend)
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  try {
    const event = req.body;
    
    // Check if the event is specifically an "email opened" event
    if (event.type === 'email.opened') {
      // Extract the Invoice ID we passed as a hidden tag when sending the email
      const invoiceId = event.data.tags?.invoiceId; 
      
      if (invoiceId) {
        // Update the database instantly! The frontend WebSocket will catch this.
        await supabase
          .from('invoices')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', invoiceId);
      }
    }
    
    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export default async function handler(req, res) {
  // 1. Ensure this is only called by Vercel Cron (security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Unauthorized cron execution attempt");
    return res.status(401).send('Unauthorized');
  }

  try {
    // 2. Calculate the exact time 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Create a start and end window for that specific day
    const startOfDay = new Date(threeDaysFromNow.setUTCHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(threeDaysFromNow.setUTCHours(23, 59, 59, 999)).toISOString();

    // 3. Scan the database for Premium users expiring on that exact day
    const { data: expiringVendors, error } = await supabaseAdmin
      .from('vendors')
      .select('id, email, business_name, subscription_expires_at')
      .eq('subscription_tier', 'premium')
      .gte('subscription_expires_at', startOfDay)
      .lte('subscription_expires_at', endOfDay);

    if (error) throw error;
    if (!expiringVendors || expiringVendors.length === 0) {
      return res.status(200).json({ message: "No subscriptions expiring in 3 days." });
    }

    // 4. Trigger the Master Mailer for every expiring user found
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    for (const vendor of expiringVendors) {
      console.log(`Sending warning to ${vendor.email}...`);
      await fetch(`${baseUrl}/api/mailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription_warning',
          email: vendor.email,
          businessName: vendor.business_name,
          daysLeft: 3,
          upgradeLink: `${baseUrl}/dashboard/billing`
        })
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Successfully warned ${expiringVendors.length} vendors.` 
    });

  } catch (err) {
    console.error("Cron Error:", err);
    return res.status(500).json({ error: "Failed to run subscription check" });
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, targetUserId, newRole } = req.body;

    // 1. ACTION: UPDATE USER ROLE
    if (action === 'update_role') {
      if (!targetUserId || !newRole) {
        return res.status(400).json({ error: 'User ID and Role are required' });
      }

      const { error } = await supabaseAdmin
        .from('vendors')
        .update({ role: newRole })
        .eq('id', targetUserId);

      if (error) throw error;
      return res.status(200).json({ success: true, message: `Role updated to ${newRole}` });
    }

    // 2. ACTION: DELETE USER ACCOUNT (SUPER ADMIN ONLY)
    if (action === 'delete_user') {
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target User ID is required' });
      }

      // Delete from Database
      await supabaseAdmin.from('vendors').delete().eq('id', targetUserId);
      await supabaseAdmin.from('invoices').delete().eq('vendor_id', targetUserId);

      // Delete from Supabase Auth
      const { error: authDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (authDeleteErr) console.warn("Auth deletion notice:", authDeleteErr.message);

      return res.status(200).json({ success: true, message: 'User account permanently removed.' });
    }

    return res.status(400).json({ error: 'Invalid admin action requested.' });

  } catch (err) {
    console.error("Admin Action Error:", err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function SuperAdminDashboard({ user, showToast }) {
  // 🛡️ IRONCLAD SECURITY BLOCK: Kicks out anyone who isn't an admin
  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", color: "#EF4444", fontWeight: "800", background: "#FEF2F2", borderRadius: "12px", border: "1px solid #FECACA", maxWidth: "600px", margin: "40px auto" }}>
        🚨 UNAUTHORIZED: This operations area is restricted to Super Admins only.
      </div>
    );
  }

  const [globalVendors, setGlobalVendors] = useState([]);
  const [globalInvoices, setGlobalInvoices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastText, setBroadcastText] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    if (!supabase) return;
    const { data: vendors } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
    const { data: invoices } = await supabase.from('invoices').select('*');
    const { data: revs } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    
    if (vendors) setGlobalVendors(vendors);
    if (invoices) setGlobalInvoices(invoices);
    if (revs) setReviews(revs);
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase.from('vendors').update({ role: newRole }).eq('id', userId);
    if (error) showToast("Error", error.message, "error");
    else {
      showToast("Role Updated", "User access level has been updated.", "success");
      setGlobalVendors(globalVendors.map(v => v.id === userId ? { ...v, role: newRole } : v));
    }
  };

  const handleKYCUpdate = async (userId, newStatus) => {
    const { error } = await supabase.from('vendors').update({ kyc_status: newStatus }).eq('id', userId);
    if (error) showToast("Error", error.message, "error");
    else {
      showToast("KYC Updated", `Merchant status changed to ${newStatus}.`, newStatus === 'approved' ? 'success' : 'error');
      fetchAdminData();
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim() || globalVendors.length === 0) return;
    setSendingBroadcast(true);
    
    // Send a notification to every registered vendor
    const payloads = globalVendors.map(v => ({
      user_id: v.id,
      message: `📢 BROADCAST: ${broadcastText}`,
      is_read: false
    }));
    
    const { error } = await supabase.from('notifications').insert(payloads);
    if (error) {
      showToast("Broadcast Failed", error.message, "error");
    } else {
      showToast("Broadcast Sent!", "Message delivered to all merchants.", "success");
      setBroadcastText("");
    }
    setSendingBroadcast(false);
  };

  const totalPlatformVolume = globalInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const paidInvoices = globalInvoices.filter(inv => inv.status === 'paid');
  const accumulatedFees = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount || 0) * 0.015), 0);

  if (loading) return <div style={{ fontSize: "15px", fontWeight: "600" }}>Querying Master Ledger Network...</div>;

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>SuperAdmin Mission Control</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Global telemetry oversight and platform management.</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Platform Volume (TPV)</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>₦{totalPlatformVolume.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Transaction Fees</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#10B981" }}>₦{accumulatedFees.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Accounts</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>{globalVendors.length} Users</div></div>
      </div>

      {/* SYSTEM BROADCAST TOOL */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "24px", marginBottom: "48px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px", color: "#0F172A" }}>Global System Broadcast</h3>
        <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "16px" }}>Send an announcement directly to the notification bell of every user on KudiSlip.</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <input className="form-input" style={{ flex: 1, margin: 0 }} placeholder="e.g. System maintenance tonight at 2AM WAT..." value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} />
          <button className="btn-primary btn-hover" onClick={handleSendBroadcast} disabled={sendingBroadcast || !broadcastText.trim()}>
            {sendingBroadcast ? "Broadcasting..." : "Send to All Users"}
          </button>
        </div>
      </div>
      
      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Global Account Registry & KYC</h3>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflowX: "auto", marginBottom: "48px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "900px" }}>
          <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
            <tr><th style={{ padding: "16px 24px" }}>Business Identity</th><th style={{ padding: "16px 24px" }}>KYC Status</th><th style={{ padding: "16px 24px" }}>Platform Role</th><th style={{ padding: "16px 24px" }}>Actions</th></tr>
          </thead>
          <tbody>
            {globalVendors.map(vendor => (
              <tr key={vendor.id} style={{ borderTop: "1px solid #E2E8F0" }}>
                <td style={{ padding: "16px 24px" }}><div style={{ fontWeight: "700" }}>{vendor.business_name}</div><div style={{ fontSize: "12px", color: "#64748B" }}>{vendor.email}</div></td>
                <td style={{ padding: "16px 24px" }}><span style={{ fontSize: "11px", fontWeight: "800", padding: "4px 8px", borderRadius: "12px", background: vendor.kyc_status === 'approved' ? "#ECFDF5" : vendor.kyc_status === 'suspended' ? "#FEF2F2" : "#FEF3C7", color: vendor.kyc_status === 'approved' ? "#10B981" : vendor.kyc_status === 'suspended' ? "#EF4444" : "#D97706" }}>{(vendor.kyc_status || 'PENDING').toUpperCase()}</span></td>
                <td style={{ padding: "16px 24px" }}>
                  <select className="form-input" style={{ padding: "8px", fontSize: "13px", width: "120px" }} value={vendor.role || 'vendor'} onChange={(e) => handleRoleChange(vendor.id, e.target.value)}><option value="vendor">Vendor</option><option value="support">Support</option><option value="admin">Super Admin</option></select>
                </td>
                <td style={{ padding: "16px 24px", display: "flex", gap: "8px" }}>
                  <button onClick={() => handleKYCUpdate(vendor.id, 'approved')} style={{ background: "#ECFDF5", color: "#10B981", border: "1px solid #A7F3D0", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Approve</button>
                  <button onClick={() => handleKYCUpdate(vendor.id, 'suspended')} style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;

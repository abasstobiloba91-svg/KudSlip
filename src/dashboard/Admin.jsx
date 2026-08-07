import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldIcon } from '../components/Icons';

export default function SuperAdminDashboard({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors', 'kyc', 'support', 'broadcast'
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // Impersonationi / Dashboard Inspection Modal State
  const [inspectVendor, setInspectVendor] = useState(null);

  // Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Reply State for Support
  const [replyText, setReplyText] = useState({});

  const userRole = user?.role || 'vendor';
  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = userRole === 'admin' || isSuperAdmin;
  const isSupport = userRole === 'support' || isAdmin;

  useEffect(() => {
    if (isSupport) {
      fetchAdminData();

      // Real-time synchronization across vendors, invoices, and support messages
      const channel = supabase
        .channel('admin-realtime-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => fetchAdminData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => fetchAdminData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => fetchAdminData())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchAdminData = async () => {
    // 1. Fetch Vendors
    const { data: vendorData } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
    if (vendorData) setVendors(vendorData);

    // 2. Fetch Invoices for Revenue Analytics
    const { data: invoiceData } = await supabase.from('invoices').select('id, vendor_id, amount, status, created_at');
    if (invoiceData) setInvoices(invoiceData);

    // 3. Fetch Support Messages
    const { data: supportData } = await supabase.from('support_messages').select('*').order('created_at', { ascending: false });
    if (supportData) setSupportMessages(supportData);
  };

  // Calculate earnings for a specific vendor ID
  const getVendorEarnings = (vendorId) => {
    return invoices
      .filter(i => i.vendor_id === vendorId && i.status === 'paid')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  };

  // Change User Role
  const handleRoleChange = async (targetUserId, newRole) => {
    setLoadingId(targetUserId);
    try {
      const res = await fetch('/api/admin-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_role', targetUserId, newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVendors(prev => prev.map(v => v.id === targetUserId ? { ...v, role: newRole } : v));
      showToast("Role Updated", `Assigned role: ${newRole}`, "success");
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  // Delete User Account (Super Admin Only)
  const handleDeleteUser = async (vendor) => {
    if (!window.confirm(`⚠️ DANGER: Are you sure you want to permanently delete ${vendor.business_name || vendor.email}? This action cannot be undone.`)) return;

    setLoadingId(vendor.id);
    try {
      const res = await fetch('/api/admin-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', targetUserId: vendor.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVendors(prev => prev.filter(v => v.id !== vendor.id));
      showToast("User Deleted", "Account removed completely.", "success");
    } catch (err) {
      showToast("Delete Failed", err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  // Handle KYC Status Approval/Rejection
  const handleUpdateKycStatus = async (vendorId, newStatus) => {
    setLoadingId(vendorId);
    try {
      const { data, error } = await supabase.from('vendors').update({ verification_status: newStatus }).eq('id', vendorId).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Update blocked by database policy.");

      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, verification_status: newStatus } : v));
      showToast("KYC Updated", `Verification set to ${newStatus}`, "success");

      const targetVendor = vendors.find(v => v.id === vendorId);
      if (targetVendor?.email) {
        fetch('/api/mailer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'kyc_status', email: targetVendor.email, businessName: targetVendor.business_name, status: newStatus })
        }).catch(err => console.error("Email error:", err));
      }
    } catch (err) {
      showToast("Update Failed", err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  // Dispatch System Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return showToast("Error", "Fill in subject and message.", "error");

    const recipientEmails = vendors.map(v => v.email).filter(Boolean);
    setSendingBroadcast(true);

    try {
      const res = await fetch('/api/mailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'broadcast', emails: recipientEmails, subject: broadcastSubject, message: broadcastMessage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Broadcast Sent!", `Dispatched to ${recipientEmails.length} users.`, "success");
      setBroadcastSubject("");
      setBroadcastMessage("");
    } catch (err) {
      showToast("Broadcast Failed", err.message, "error");
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (!isSupport) {
    return <div style={{ padding: "40px", color: "#EF4444", fontWeight: "700" }}>Access Denied. Support or Admin privileges required.</div>;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "28px", fontWeight: "900", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldIcon /> Command Center
        </div>
        <div style={{ color: "#64748B", marginTop: "4px", fontSize: "14px" }}>
          Logged in as: <strong style={{ textTransform: "uppercase", color: "#000" }}>{userRole}</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #E2E8F0", marginBottom: "28px", overflowX: "auto" }}>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('vendors')}
            style={{ padding: "12px 20px", fontWeight: "800", fontSize: "14px", border: "none", background: "none", cursor: "pointer", borderBottom: activeTab === 'vendors' ? "3px solid #8B5CF6" : "3px solid transparent", color: activeTab === 'vendors' ? "#8B5CF6" : "#64748B" }}
          >
            Vendors & Analytics ({vendors.length})
          </button>
        )}

        {isAdmin && (
          <button 
            onClick={() => setActiveTab('kyc')}
            style={{ padding: "12px 20px", fontWeight: "800", fontSize: "14px", border: "none", background: "none", cursor: "pointer", borderBottom: activeTab === 'kyc' ? "3px solid #8B5CF6" : "3px solid transparent", color: activeTab === 'kyc' ? "#8B5CF6" : "#64748B" }}
          >
            KYC Verification
          </button>
        )}

        <button 
          onClick={() => setActiveTab('support')}
          style={{ padding: "12px 20px", fontWeight: "800", fontSize: "14px", border: "none", background: "none", cursor: "pointer", borderBottom: activeTab === 'support' ? "3px solid #8B5CF6" : "3px solid transparent", color: activeTab === 'support' ? "#8B5CF6" : "#64748B" }}
        >
          Support & Messages ({supportMessages.length})
        </button>

        {isAdmin && (
          <button 
            onClick={() => setActiveTab('broadcast')}
            style={{ padding: "12px 20px", fontWeight: "800", fontSize: "14px", border: "none", background: "none", cursor: "pointer", borderBottom: activeTab === 'broadcast' ? "3px solid #8B5CF6" : "3px solid transparent", color: activeTab === 'broadcast' ? "#8B5CF6" : "#64748B" }}
          >
            📢 Broadcast Emails
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VENDORS, EARNINGS & ROLE ASSIGNMENTS               */}
      {/* ========================================================= */}
      {activeTab === 'vendors' && isAdmin && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
          {vendors.map(v => {
            const earnings = getVendorEarnings(v.id);
            const userInvoices = invoices.filter(i => i.vendor_id === v.id);

            return (
              <div key={v.id} style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                
                {/* Left: User Info & Live Earnings */}
                <div style={{ minWidth: "250px" }}>
                  <div style={{ fontWeight: "900", fontSize: "16px", color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                    {v.business_name || "Unnamed Business"}
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "#F1F5F9", color: "#475569", textTransform: "uppercase" }}>{v.role || 'vendor'}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>{v.email}</div>
                  <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: "700", color: "#10B981" }}>
                    Total Earned: ₦{earnings.toLocaleString()} <span style={{ color: "#94A3B8", fontWeight: "500" }}>({userInvoices.length} invoices)</span>
                  </div>
                </div>

                {/* Right: Actions (Role Select, Inspection, Deletion) */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  
                  {/* Confidential Inspect Dashboard */}
                  {isSuperAdmin && (
                    <button 
                      onClick={() => setInspectVendor(v)}
                      style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "700", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Inspect Data 👁️
                    </button>
                  )}

                  {/* Assign Roles (Super Admin Only) */}
                  {isSuperAdmin ? (
                    <select 
                      value={v.role || 'vendor'} 
                      onChange={(e) => handleRoleChange(v.id, e.target.value)}
                      disabled={loadingId === v.id}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", fontWeight: "700", background: "#F8FAFC", cursor: "pointer" }}
                    >
                      <option value="vendor">Role: Vendor</option>
                      <option value="support">Role: Support</option>
                      <option value="admin">Role: Admin</option>
                      <option value="super_admin">Role: Super Admin</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>Role: {v.role || 'vendor'}</span>
                  )}

                  {/* Delete User (Super Admin Only) */}
                  {isSuperAdmin && v.id !== user.id && (
                    <button 
                      onClick={() => handleDeleteUser(v)}
                      disabled={loadingId === v.id}
                      style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "700", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Delete User
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: KYC VERIFICATION                                   */}
      {/* ========================================================= */}
      {activeTab === 'kyc' && isAdmin && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
          {vendors.filter(v => v.document_url || v.verification_status === 'pending').map(v => (
            <div key={v.id} style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontWeight: "800", fontSize: "15px" }}>{v.business_name}</div>
                <div style={{ fontSize: "13px", color: "#64748B" }}>Status: <strong style={{ textTransform: "capitalize" }}>{v.verification_status}</strong></div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {v.document_url && (
                  <a href={v.document_url} target="_blank" rel="noreferrer" style={{ padding: "8px 14px", fontSize: "12px", fontWeight: "700", background: "#EFF6FF", color: "#2563EB", textDecoration: "none", borderRadius: "6px", border: "1px solid #BFDBFE" }}>View CAC Upload ↗</a>
                )}
                <button onClick={() => handleUpdateKycStatus(v.id, 'approved')} style={{ padding: "8px 14px", fontSize: "12px", fontWeight: "800", background: "#10B981", color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer" }}>Approve</button>
                <button onClick={() => handleUpdateKycStatus(v.id, 'rejected')} style={{ padding: "8px 14px", fontSize: "12px", fontWeight: "800", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "6px", cursor: "pointer" }}>Reject</button>
              </div>
            </div>
          ))}
          {vendors.filter(v => v.document_url || v.verification_status === 'pending').length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No pending KYC documents.</div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUPPORT TICKETS & MESSAGES                          */}
      {/* ========================================================= */}
      {activeTab === 'support' && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "800" }}>Customer Support Inbox</h3>
          {supportMessages.length === 0 ? (
            <div style={{ color: "#64748B", textAlign: "center", padding: "30px" }}>No active support messages.</div>
          ) : (
            supportMessages.map(msg => (
              <div key={msg.id} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "800", fontSize: "14px" }}>{msg.sender_email || "User"}</span>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: "#334155", fontSize: "14px", margin: "0 0 12px 0" }}>{msg.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SYSTEM BROADCAST EMAILS                            */}
      {/* ========================================================= */}
      {activeTab === 'broadcast' && isAdmin && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px", maxWidth: "700px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "900" }}>Broadcast Announcement</h3>
          <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>
            This email will be dispatched directly to all <strong>{vendors.length} registered merchant accounts</strong>.
          </p>

          <form onSubmit={handleSendBroadcast}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Subject Line</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Important Update: New Payment Features Active" 
                value={broadcastSubject} 
                onChange={e => setBroadcastSubject(e.target.value)} 
                required 
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Message Body</label>
              <textarea 
                className="form-input" 
                rows="8" 
                placeholder="Write your email broadcast message here..." 
                value={broadcastMessage} 
                onChange={e => setBroadcastMessage(e.target.value)} 
                style={{ resize: "vertical" }}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={sendingBroadcast} 
              style={{ padding: "14px 28px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "15px", cursor: "pointer" }}
            >
              {sendingBroadcast ? "Dispatching Broadcast..." : "Send Announcement Now"}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONFIDENTIAL VENDOR INSPECTION MODAL                      */}
      {/* ========================================================= */}
      {inspectVendor && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "650px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900" }}>🔒 Confidential Inspection</h3>
                <div style={{ fontSize: "13px", color: "#64748B" }}>{inspectVendor.business_name} ({inspectVendor.email})</div>
              </div>
              <button onClick={() => setInspectVendor(null)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "18px" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B" }}>TOTAL EARNINGS</div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#10B981", marginTop: "4px" }}>₦{getVendorEarnings(inspectVendor.id).toLocaleString()}</div>
              </div>
              <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B" }}>SUBSCRIPTION TIER</div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#8B5CF6", marginTop: "4px", textTransform: "uppercase" }}>{inspectVendor.subscription_tier || 'Free'}</div>
              </div>
            </div>

            <h4 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "12px" }}>Issued Invoices ({invoices.filter(i => i.vendor_id === inspectVendor.id).length})</h4>
            <div style={{ background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", padding: "12px" }}>
              {invoices.filter(i => i.vendor_id === inspectVendor.id).map(inv => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "8px 0", borderBottom: "1px solid #E2E8F0" }}>
                  <span>Invoice #{inv.id.substring(0, 8)}</span>
                  <strong>₦{Number(inv.amount).toLocaleString()} ({inv.status})</strong>
                </div>
              ))}
              {invoices.filter(i => i.vendor_id === inspectVendor.id).length === 0 && <div style={{ fontSize: "13px", color: "#64748B" }}>No invoices created by this vendor yet.</div>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

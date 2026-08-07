import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Admin({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors', 'kyc', 'support', 'broadcast'
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // Impersonation / Dashboard Inspection Modal State
  const [inspectVendor, setInspectVendor] = useState(null);

  // Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const userRole = user?.role || 'super_admin'; // Fallback ensures admin views retain privileges
  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = userRole === 'admin' || isSuperAdmin;
  const isSupport = userRole === 'support' || isAdmin;

  useEffect(() => {
    fetchAdminData();

    // Real-time synchronization
    const channel = supabase
      .channel('admin-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => fetchAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => fetchAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => fetchAdminData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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

  const getVendorEarnings = (vendorId) => {
    return invoices
      .filter(i => i.vendor_id === vendorId && i.status === 'paid')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  };

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

  const handleDeleteUser = async (vendor) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${vendor.business_name || vendor.email}? This action cannot be undone.`)) return;

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

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return showToast("Error", "Fill in subject and message.", "error");

    const recipientEmails = vendors.map(v => v.email).filter(Boolean);
    if (recipientEmails.length === 0) return showToast("No Recipients", "No vendor email addresses found.", "error");

    setSendingBroadcast(true);

    try {
      const res = await fetch('/api/mailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'broadcast', 
          emails: recipientEmails, 
          subject: broadcastSubject, 
          message: broadcastMessage 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Broadcast Sent!", `Emailed to ${recipientEmails.length} vendors in KudiSlip template format.`, "success");
      setBroadcastSubject("");
      setBroadcastMessage("");
    } catch (err) {
      showToast("Broadcast Failed", err.message, "error");
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 12px 40px" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "24px", fontWeight: "900", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Command Center
        </div>
        <div style={{ color: "#64748B", marginTop: "4px", fontSize: "13px", fontWeight: "500" }}>
          Logged in as: <strong style={{ textTransform: "uppercase", color: "#0F172A" }}>{userRole}</strong>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ 
        display: "flex", 
        gap: "6px", 
        borderBottom: "1px solid #E2E8F0", 
        marginBottom: "24px", 
        overflowX: "auto", 
        paddingBottom: "8px",
        WebkitOverflowScrolling: "touch"
      }}>
        <button 
          onClick={() => setActiveTab('vendors')}
          style={{ 
            padding: "10px 16px", 
            fontWeight: "800", 
            fontSize: "13px", 
            border: "none", 
            borderRadius: "8px",
            background: activeTab === 'vendors' ? "#F3E8FF" : "transparent", 
            color: activeTab === 'vendors' ? "#7E22CE" : "#64748B",
            whiteSpace: "nowrap",
            cursor: "pointer"
          }}
        >
          Vendors & Analytics ({vendors.length})
        </button>

        <button 
          onClick={() => setActiveTab('kyc')}
          style={{ 
            padding: "10px 16px", 
            fontWeight: "800", 
            fontSize: "13px", 
            border: "none", 
            borderRadius: "8px",
            background: activeTab === 'kyc' ? "#F3E8FF" : "transparent", 
            color: activeTab === 'kyc' ? "#7E22CE" : "#64748B",
            whiteSpace: "nowrap",
            cursor: "pointer"
          }}
        >
          KYC Verification
        </button>

        <button 
          onClick={() => setActiveTab('support')}
          style={{ 
            padding: "10px 16px", 
            fontWeight: "800", 
            fontSize: "13px", 
            border: "none", 
            borderRadius: "8px",
            background: activeTab === 'support' ? "#F3E8FF" : "transparent", 
            color: activeTab === 'support' ? "#7E22CE" : "#64748B",
            whiteSpace: "nowrap",
            cursor: "pointer"
          }}
        >
          Support & Messages ({supportMessages.length})
        </button>

        <button 
          onClick={() => setActiveTab('broadcast')}
          style={{ 
            padding: "10px 16px", 
            fontWeight: "800", 
            fontSize: "13px", 
            border: "none", 
            borderRadius: "8px",
            background: activeTab === 'broadcast' ? "#F3E8FF" : "transparent", 
            color: activeTab === 'broadcast' ? "#7E22CE" : "#64748B",
            whiteSpace: "nowrap",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span>Broadcast Emails</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VENDORS, EARNINGS & ROLE ASSIGNMENTS               */}
      {/* ========================================================= */}
      {activeTab === 'vendors' && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
          {vendors.map(v => {
            const earnings = getVendorEarnings(v.id);
            const userInvoices = invoices.filter(i => i.vendor_id === v.id);

            return (
              <div key={v.id} style={{ padding: "20px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "14px" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <div style={{ fontWeight: "900", fontSize: "16px", color: "#0F172A", wordBreak: "break-word" }}>
                      {v.business_name || "Unnamed Business"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748B", marginTop: "2px", wordBreak: "break-all" }}>{v.email}</div>
                  </div>
                  
                  <span style={{ fontSize: "10px", fontWeight: "900", padding: "4px 8px", borderRadius: "6px", background: "#F1F5F9", color: "#475569", textTransform: "uppercase", flexShrink: 0 }}>
                    {v.role || 'vendor'}
                  </span>
                </div>

                <div style={{ fontSize: "13px", fontWeight: "700", color: "#10B981", background: "#ECFDF5", padding: "8px 12px", borderRadius: "6px", display: "inline-block" }}>
                  Total Earned: ₦{earnings.toLocaleString()} <span style={{ color: "#047857", fontWeight: "500" }}>({userInvoices.length} invoices)</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginTop: "4px" }}>
                  <button 
                    onClick={() => setInspectVendor(v)}
                    style={{ padding: "10px 12px", fontSize: "12px", fontWeight: "700", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Inspect Data</span>
                  </button>

                  <select 
                    value={v.role || 'vendor'} 
                    onChange={(e) => handleRoleChange(v.id, e.target.value)}
                    disabled={loadingId === v.id}
                    style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "12px", fontWeight: "700", background: "#F8FAFC", cursor: "pointer", width: "100%" }}
                  >
                    <option value="vendor">Role: Vendor</option>
                    <option value="support">Role: Support</option>
                    <option value="admin">Role: Admin</option>
                    <option value="super_admin">Role: Super Admin</option>
                  </select>

                  {v.id !== user?.id && (
                    <button 
                      onClick={() => handleDeleteUser(v)}
                      disabled={loadingId === v.id}
                      style={{ padding: "10px 12px", fontSize: "12px", fontWeight: "700", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>Delete User</span>
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
      {activeTab === 'kyc' && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
          {vendors.filter(v => v.document_url || v.verification_status === 'pending').map(v => (
            <div key={v.id} style={{ padding: "20px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "15px", color: "#0F172A" }}>{v.business_name || "Unnamed Merchant"}</div>
                  <div style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>{v.email}</div>
                </div>

                <span style={{ 
                  fontSize: "11px", 
                  fontWeight: "900", 
                  padding: "4px 10px", 
                  borderRadius: "12px", 
                  background: v.verification_status === 'approved' ? "#ECFDF5" : v.verification_status === 'pending' ? "#FEF3C7" : "#FEF2F2", 
                  color: v.verification_status === 'approved' ? "#10B981" : v.verification_status === 'pending' ? "#D97706" : "#EF4444", 
                  textTransform: "uppercase",
                  flexShrink: 0
                }}>
                  {v.verification_status || 'unverified'}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                {v.document_url && (
                  <a 
                    href={v.document_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ padding: "8px 14px", fontSize: "12px", fontWeight: "700", background: "#EFF6FF", color: "#2563EB", textDecoration: "none", borderRadius: "8px", border: "1px solid #BFDBFE", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>View CAC Upload</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                )}

                {v.verification_status === 'pending' ? (
                  <div style={{ display: "flex", gap: "8px", flex: "1 1 auto" }}>
                    <button 
                      onClick={() => handleUpdateKycStatus(v.id, 'approved')} 
                      disabled={loadingId === v.id}
                      style={{ flex: 1, padding: "8px 14px", fontSize: "12px", fontWeight: "800", background: "#10B981", color: "#FFF", border: "none", borderRadius: "8px", cursor: "pointer" }}
                    >
                      {loadingId === v.id ? "..." : "Approve"}
                    </button>
                    <button 
                      onClick={() => handleUpdateKycStatus(v.id, 'rejected')} 
                      disabled={loadingId === v.id}
                      style={{ flex: 1, padding: "8px 14px", fontSize: "12px", fontWeight: "800", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "8px", cursor: "pointer" }}
                    >
                      {loadingId === v.id ? "..." : "Reject"}
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v.verification_status === 'approved' ? "#10B981" : "#EF4444"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {v.verification_status === 'approved' ? (
                        <polyline points="20 6 9 17 4 12"></polyline>
                      ) : (
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                      )}
                    </svg>
                    <span>Decision Recorded</span>
                  </div>
                )}
              </div>

            </div>
          ))}

          {vendors.filter(v => v.document_url || v.verification_status === 'pending').length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748B", fontSize: "14px" }}>No pending KYC documents to review.</div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUPPORT TICKETS & MESSAGES                          */}
      {/* ========================================================= */}
      {activeTab === 'support' && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px 16px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>Customer Support Inbox</h3>
          {supportMessages.length === 0 ? (
            <div style={{ color: "#64748B", textAlign: "center", padding: "30px", fontSize: "14px" }}>No active support messages.</div>
          ) : (
            supportMessages.map(msg => (
              <div key={msg.id} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "800", fontSize: "13px" }}>{msg.sender_email || "User"}</span>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: "#334155", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>{msg.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SYSTEM BROADCAST EMAILS (NOW EASILY VISIBLE)       */}
      {/* ========================================================= */}
      {activeTab === 'broadcast' && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px 16px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "900" }}>Broadcast Announcement</h3>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
              This message will be sent directly as an email to all <strong>{vendors.length} registered merchant accounts</strong> formatted in the KudiSlip brand template.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Subject Line</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Scheduled System Maintenance Notice" 
                value={broadcastSubject} 
                onChange={e => setBroadcastSubject(e.target.value)} 
                required 
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Message Body</label>
              <textarea 
                className="form-input" 
                rows="6" 
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
              style={{ width: "100%", padding: "14px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span>{sendingBroadcast ? "Dispatching Broadcast Emails..." : "Send Email Broadcast Now"}</span>
            </button>
          </form>
        </div>
      )}

      {/* CONFIDENTIAL VENDOR INSPECTION MODAL */}
      {inspectVendor && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px 16px", width: "100%", maxWidth: "550px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#0F172A" }}>Confidential Inspection</h3>
                <div style={{ fontSize: "12px", color: "#64748B", wordBreak: "break-all" }}>{inspectVendor.business_name} ({inspectVendor.email})</div>
              </div>
              <button onClick={() => setInspectVendor(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748B" }}>TOTAL EARNINGS</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#10B981", marginTop: "2px" }}>₦{getVendorEarnings(inspectVendor.id).toLocaleString()}</div>
              </div>
              <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748B" }}>SUBSCRIPTION TIER</div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#8B5CF6", marginTop: "2px", textTransform: "uppercase" }}>{inspectVendor.subscription_tier || 'Free'}</div>
              </div>
            </div>

            <h4 style={{ fontSize: "13px", fontWeight: "800", marginBottom: "8px" }}>Issued Invoices ({invoices.filter(i => i.vendor_id === inspectVendor.id).length})</h4>
            <div style={{ background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", padding: "12px" }}>
              {invoices.filter(i => i.vendor_id === inspectVendor.id).map(inv => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "6px 0", borderBottom: "1px solid #E2E8F0" }}>
                  <span>Invoice #{inv.id.substring(0, 8)}</span>
                  <strong>₦{Number(inv.amount).toLocaleString()} ({inv.status})</strong>
                </div>
              ))}
              {invoices.filter(i => i.vendor_id === inspectVendor.id).length === 0 && <div style={{ fontSize: "12px", color: "#64748B" }}>No invoices created by this vendor yet.</div>}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

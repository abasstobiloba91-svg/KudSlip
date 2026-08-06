import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldIcon } from '../components/Icons';

export default function SuperAdminDashboard({ user, showToast }) {
  const [vendors, setVendors] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchVendors();

      const channel = supabase
        .channel('admin-vendor-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vendors' },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setVendors(prev => prev.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v));
            } else if (payload.eventType === 'INSERT') {
              setVendors(prev => [payload.new, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching vendors:", error);
      showToast("Fetch Error", "Failed to load vendors list", "error");
    } else if (data) {
      setVendors(data);
    }
  };

  const handleUpdateStatus = async (vendorId, newStatus) => {
    setLoadingId(vendorId);
    
    try {
      showToast("Updating...", `Setting status to ${newStatus}...`, "info");

      const { data, error } = await supabase
        .from('vendors')
        .update({ verification_status: newStatus })
        .eq('id', vendorId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Update failed. Please check Supabase RLS policies for admin role.");
      }

      // Update local state
      setVendors(prevVendors => 
        prevVendors.map(v => v.id === vendorId ? { ...v, verification_status: newStatus } : v)
      );

      showToast("Status Updated", `Vendor status successfully changed to ${newStatus}`, "success");

      // =========================================================
      // DISPATCH KYC EMAIL NOTIFICATION TO USER
      // =========================================================
      const targetVendor = vendors.find(v => v.id === vendorId);
      if (targetVendor && targetVendor.email) {
        fetch('/api/mailer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'kyc_status',
            email: targetVendor.email,
            businessName: targetVendor.business_name,
            status: newStatus
          })
        }).catch(err => console.error("KYC email delivery error:", err));
      }

    } catch (err) {
      console.error("KYC Update Error:", err);
      showToast("Update Failed", err.message || "Could not update database", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      return showToast("Required", "Please provide a subject and message.", "error");
    }

    const recipientEmails = vendors.map(v => v.email).filter(Boolean);
    if (recipientEmails.length === 0) {
      return showToast("No Recipients", "No vendor email addresses found.", "error");
    }

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
      if (!res.ok) throw new Error(data.error || "Failed to dispatch broadcast");

      showToast("Broadcast Sent!", `Message delivered to ${recipientEmails.length} vendors.`, "success");
      setBroadcastSubject("");
      setBroadcastMessage("");
      setShowBroadcastModal(false);

    } catch (err) {
      showToast("Broadcast Error", err.message, "error");
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: "40px", color: "#EF4444", fontWeight: "700" }}>
        Access Denied. Super Admin privileges required.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      
      {/* Header & Broadcast Trigger */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldIcon /> Admin Operations
          </div>
          <div style={{ color: "#64748B", marginTop: "4px", fontSize: "15px" }}>
            System-wide oversight for registered merchants and KYC verification.
          </div>
        </div>

        <button 
          onClick={() => setShowBroadcastModal(true)}
          className="btn-primary btn-hover"
          style={{ background: "#000000", color: "#FFFFFF", padding: "12px 20px", borderRadius: "8px", fontWeight: "800", fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send Broadcast
        </button>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>All Registered Vendors ({vendors.length})</h3>
      
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
        {vendors.map(v => (
          <div key={v.id} style={{ padding: "24px", borderBottom: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: "900", fontSize: "16px", color: "#0F172A" }}>{v.business_name || "Unnamed Business"}</div>
                <div style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>{v.email} {v.phone ? `• ${v.phone}` : ''}</div>
              </div>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", padding: "4px 10px", borderRadius: "12px", background: v.subscription_tier === 'premium' ? "#F3E8FF" : "#F1F5F9", color: v.subscription_tier === 'premium' ? "#7E22CE" : "#64748B", textTransform: "uppercase" }}>
                  {v.subscription_tier || "free"}
                </span>
                
                <span style={{ fontSize: "11px", fontWeight: "900", padding: "4px 10px", borderRadius: "12px", background: v.verification_status === 'approved' ? "#ECFDF5" : v.verification_status === 'pending' ? "#FEF3C7" : v.verification_status === 'rejected' ? "#FEF2F2" : "#F1F5F9", color: v.verification_status === 'approved' ? "#10B981" : v.verification_status === 'pending' ? "#D97706" : v.verification_status === 'rejected' ? "#EF4444" : "#64748B", textTransform: "uppercase" }}>
                  {v.verification_status || "unverified"}
                </span>
              </div>
            </div>

            {(v.verification_status === 'pending' || v.document_url) && (
              <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "8px", border: "1px dashed #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                  KYC Document Review
                </div>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {v.document_url && (
                    <a 
                      href={v.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-secondary btn-hover" 
                      style={{ padding: "8px 16px", fontSize: "12px", textDecoration: "none", color: "#3B82F6", border: "1px solid #BFDBFE", background: "#EFF6FF", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <span>View Upload</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}

                  {v.verification_status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(v.id, 'approved')}
                        disabled={loadingId === v.id}
                        className="btn-primary btn-hover" 
                        style={{ padding: "8px 16px", fontSize: "12px", background: "#10B981", border: "none" }}
                      >
                        {loadingId === v.id ? "Updating..." : "Approve"}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(v.id, 'rejected')}
                        disabled={loadingId === v.id}
                        className="btn-secondary btn-hover" 
                        style={{ padding: "8px 16px", fontSize: "12px", color: "#EF4444", border: "1px solid #FECACA", background: "#FEF2F2" }}
                      >
                        {loadingId === v.id ? "Updating..." : "Reject"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            
          </div>
        ))}
        {vendors.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No vendors registered yet.</div>}
      </div>

      {/* ========================================================= */}
      {/* BROADCAST MODAL                                          */}
      {/* ========================================================= */}
      {showBroadcastModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "550px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#0F172A" }}>Broadcast to All Vendors</h3>
              <button onClick={() => setShowBroadcastModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <p style={{ color: "#64748B", fontSize: "14px", marginTop: 0, marginBottom: "24px" }}>
              This message will be dispatched directly to all <strong>{vendors.length} registered merchant email addresses</strong>.
            </p>

            <form onSubmit={handleSendBroadcast}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Scheduled System Maintenance Notice" 
                  value={broadcastSubject} 
                  onChange={e => setBroadcastSubject(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Message</label>
                <textarea 
                  className="form-input" 
                  rows="6" 
                  placeholder="Type your message here..." 
                  value={broadcastMessage} 
                  onChange={e => setBroadcastMessage(e.target.value)} 
                  style={{ resize: "vertical" }}
                  required 
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => setShowBroadcastModal(false)} 
                  style={{ padding: "12px 20px", background: "#F1F5F9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sendingBroadcast} 
                  style={{ padding: "12px 24px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}
                >
                  {sendingBroadcast ? "Dispatching..." : "Send Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

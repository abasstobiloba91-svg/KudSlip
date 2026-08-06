import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldIcon } from '../components/Icons';

export default function SuperAdminDashboard({ user, showToast }) {
  const [vendors, setVendors] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchVendors();

      // =========================================================
      // REALTIME LISTENER: Sync vendor updates & new submissions
      // =========================================================
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

      // 1. Update the database AND request returned data (.select)
      const { data, error } = await supabase
        .from('vendors')
        .update({ verification_status: newStatus })
        .eq('id', vendorId)
        .select();

      // 2. Catch network / syntax errors
      if (error) throw error;

      // 3. Catch silent RLS policy blocks (0 rows updated)
      if (!data || data.length === 0) {
        throw new Error("Update failed. Please check Supabase RLS policies for admin role.");
      }

      // 4. Update local state only after DB write is verified
      setVendors(prevVendors => 
        prevVendors.map(v => v.id === vendorId ? { ...v, verification_status: newStatus } : v)
      );

      showToast("Status Updated", `Vendor status successfully changed to ${newStatus}`, "success");

    } catch (err) {
      console.error("KYC Update Error:", err);
      showToast("Update Failed", err.message || "Could not update database", "error");
    } finally {
      setLoadingId(null);
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
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "12px" }}>
        <ShieldIcon /> Admin Operations
      </div>
      <div style={{ color: "#64748B", marginBottom: "32px", fontSize: "15px" }}>System-wide oversight for registered merchants and KYC verification.</div>

      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>All Registered Vendors ({vendors.length})</h3>
      
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
        {vendors.map(v => (
          <div key={v.id} style={{ padding: "24px", borderBottom: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Top Row: Vendor Info & Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: "900", fontSize: "16px", color: "#0F172A" }}>{v.business_name || "Unnamed Business"}</div>
                <div style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>{v.email} {v.phone ? `• ${v.phone}` : ''}</div>
              </div>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", padding: "4px 10px", borderRadius: "12px", background: v.subscription_tier === 'premium' ? "#F3E8FF" : "#F1F5F9", color: v.subscription_tier === 'premium' ? "#7E22CE" : "#64748B", textTransform: "uppercase" }}>
                  {v.subscription_tier || "free"}
                </span>
                
                {/* Visual Status Badge */}
                <span style={{ fontSize: "11px", fontWeight: "900", padding: "4px 10px", borderRadius: "12px", background: v.verification_status === 'approved' ? "#ECFDF5" : v.verification_status === 'pending' ? "#FEF3C7" : v.verification_status === 'rejected' ? "#FEF2F2" : "#F1F5F9", color: v.verification_status === 'approved' ? "#10B981" : v.verification_status === 'pending' ? "#D97706" : v.verification_status === 'rejected' ? "#EF4444" : "#64748B", textTransform: "uppercase" }}>
                  {v.verification_status || "unverified"}
                </span>
              </div>
            </div>

            {/* Bottom Row: KYC Review Section */}
            {(v.verification_status === 'pending' || v.document_url) && (
              <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "8px", border: "1px dashed #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                  KYC Document Review
                </div>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  
                  {/* VIEW DOCUMENT BUTTON */}
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

                  {/* APPROVE / REJECT CONTROLS */}
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ProfileSettings({ user, showToast, onUpdate }) {
  const [businessName, setBusinessName] = useState(user?.business_name || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) return showToast("Action Required", "Business name cannot be empty.", "error");

    setLoading(true);
    const { error } = await supabase.from('vendors').update({ business_name: businessName }).eq('id', user.id);

    if (error) {
      showToast("Database Error", error.message, "error");
    } else {
      showToast("Profile Updated", "Your business details have been saved.", "success");
      onUpdate({ ...user, business_name: businessName });
    }
    setLoading(false);
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Profile Settings.</div>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Profile Settings</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your identity and account details.</div>

      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "32px" }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Account Email (Unchangeable)</label>
            <input className="form-input" value={user?.email || ""} disabled style={{ background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" }} />
            <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px" }}>Contact KudiSlip support if you need to migrate your account to a new email address.</div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Business Name</label>
            <input className="form-input" placeholder="Your Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
          </div>

          <button className="btn-primary btn-hover" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;

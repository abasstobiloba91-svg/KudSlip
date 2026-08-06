import React, { useState } from 'react';

export default function VerificationTab({ user, showToast, supabase }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(user?.kyc_status || 'unverified');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        return showToast("File too large", "Please upload an image or PDF under 2MB.", "error");
      }
      setFile(selectedFile);
    }
  };

  const submitKYC = async () => {
    if (!file) return showToast("No file", "Please select a document.", "error");
    setLoading(true);
    // ... (Keep your Supabase upload logic here exactly as we mapped out before) ...
    setLoading(false);
  };

  return (
    <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
      <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>Business Verification</h3>
      
      {/* STATUS: VERIFIED */}
      {kycStatus === 'verified' && (
        <div style={{ background: "#DCFCE7", padding: "16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Blue Verification SVG Badge */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.2332 2.22744C11.6669 1.92429 12.3331 1.92429 12.7668 2.22744L14.7171 3.5908C14.9317 3.74083 15.1979 3.80556 15.4599 3.77161L17.8427 3.46261C18.3712 3.39408 18.8475 3.77353 18.966 4.29177L19.4989 6.62095C19.5576 6.87747 19.7093 7.10091 19.922 7.24424L21.8546 8.54714C22.2831 8.83594 22.3929 9.42167 22.1136 9.85966L20.8569 11.8315C20.7186 12.0485 20.7186 12.327 20.8569 12.5441L22.1136 14.5159C22.3929 14.9539 22.2831 15.5396 21.8546 15.8284L19.922 17.1313C19.7093 17.2747 19.5576 17.4981 19.4989 17.7546L18.966 20.0838C18.8475 20.602 18.3712 20.9815 17.8427 20.913L15.4599 20.604C15.1979 20.57 14.9317 20.6347 14.7171 20.7848L12.7668 22.1481C12.3331 22.4513 11.6669 22.4513 11.2332 22.1481L9.28292 20.7848C9.06833 20.6347 8.80206 20.57 8.54009 20.604L6.15732 20.913C5.62885 20.9815 5.15254 20.602 5.03399 20.0838L4.50113 17.7546C4.44242 17.4981 4.29074 17.2747 4.07798 17.1313L2.14538 15.8284C1.71694 15.5396 1.60706 14.9539 1.88642 14.5159L3.14312 12.5441C3.28144 12.327 3.28144 12.0485 3.14312 11.8315L1.88642 9.85966C1.60706 9.42167 1.71694 8.83594 2.14538 8.54714L4.07798 7.24424C4.29074 7.10091 4.44242 6.87747 4.50113 6.62095L5.03399 4.29177C5.15254 3.77353 5.62885 3.39408 6.15732 3.46261L8.54009 3.77161C8.80206 3.80556 9.06833 3.74083 9.28292 3.5908L11.2332 2.22744Z" fill="#3B82F6"/>
            <path d="M10.6583 14.8876C10.4578 14.8876 10.2573 14.8111 10.1044 14.6582L7.34271 11.8965C7.03685 11.5906 7.03685 11.0947 7.34271 10.7889C7.64857 10.483 8.14446 10.483 8.45033 10.7889L10.6583 12.9969L15.5497 8.10555C15.8556 7.79969 16.3515 7.79969 16.6573 8.10555C16.9632 8.41141 16.9632 8.9073 16.6573 9.21316L11.2122 14.6582C11.0593 14.8111 10.8588 14.8876 10.6583 14.8876Z" fill="white"/>
          </svg>
          <div>
            <p style={{ fontWeight: "700", color: "#166534", margin: 0 }}>Verified Business</p>
            <p style={{ fontSize: "14px", color: "#166534", margin: 0, opacity: 0.9 }}>Your invoices display the trusted badge.</p>
          </div>
        </div>
      )}

      {/* STATUS: PENDING */}
      {kycStatus === 'pending' && (
        <div style={{ background: "#FEF9C3", padding: "16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Clock SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div>
            <p style={{ fontWeight: "700", color: "#854D0E", margin: 0 }}>Review in Progress</p>
            <p style={{ fontSize: "14px", color: "#854D0E", margin: 0, opacity: 0.9 }}>This usually takes 24 hours.</p>
          </div>
        </div>
      )}

      {/* STATUS: UNVERIFIED */}
      {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
        <div>
          <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px" }}>
            Upload your CAC Certificate or ID to unlock the "Verified" badge.
          </p>

          <div style={{ border: "2px dashed #CBD5E1", padding: "32px", borderRadius: "8px", textAlign: "center", marginBottom: "20px" }}>
            {/* Upload Cloud SVG */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "8px" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <br />
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: "none" }} id="kyc-upload" />
            <label htmlFor="kyc-upload" style={{ cursor: "pointer", color: "#2563EB", fontWeight: "600" }}>
              {file ? file.name : "Click to select a file (Max 2MB)"}
            </label>
          </div>

          <button onClick={submitKYC} disabled={loading || !file} style={{ width: "100%", padding: "12px", background: (loading || !file) ? "#94A3B8" : "#0F172A", color: "#FFFFFF", borderRadius: "8px", fontWeight: "700", border: "none", cursor: (loading || !file) ? "not-allowed" : "pointer" }}>
            {loading ? "Uploading Securely..." : "Submit for Verification"}
          </button>
        </div>
      )}
    </div>
  );
}

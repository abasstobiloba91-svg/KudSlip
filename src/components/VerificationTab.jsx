import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function VerificationTab({ user, showToast }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Status mapping
  const status = user?.verification_status || 'unverified';
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showToast("No File", "Please select a document first.", "error");

    setLoading(true);
    
    // 1. Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_kyc_${Date.now()}.${fileExt}`;
    const filePath = `kyc_docs/${fileName}`;

    try {
      // 2. Upload to Supabase Storage (Make sure you have a bucket named 'documents')
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the public URL for the admin to view
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 4. Update the vendor's database record
      const { error: dbError } = await supabase
        .from('vendors')
        .update({ 
          document_url: publicUrlData.publicUrl,
          verification_status: 'pending' 
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      showToast("Uploaded!", "Your document is now pending admin review.", "success");
      // Force page reload to reflect state, or update state via props
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      showToast("Upload Failed", err.message || "Could not upload document.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Business Verification</div>
      <div style={{ color: "#64748B", marginBottom: "32px", fontSize: "15px" }}>Upload your business documents (CAC) to get verified.</div>

      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px" }}>
        
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Current Status</div>
          <div style={{ fontSize: "20px", fontWeight: "900", marginTop: "8px", textTransform: "capitalize",
            color: status === 'approved' ? "#10B981" : status === 'pending' ? "#D97706" : status === 'rejected' ? "#EF4444" : "#0F172A" }}>
            {status}
          </div>
        </div>

        {status === 'approved' ? (
          <div style={{ background: "#ECFDF5", padding: "16px", borderRadius: "8px", color: "#065F46", fontWeight: "700" }}>
            ✅ Your business is fully verified!
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "6px" }}>Upload CAC Document (PDF or Image)</label>
              <input 
                type="file" 
                className="form-input" 
                accept="image/*,.pdf" 
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading || status === 'pending'} 
              />
            </div>
            
            <button 
              className="btn-primary btn-hover" 
              style={{ width: "100%" }} 
              type="submit" 
              disabled={loading || !file || status === 'pending'}
            >
              {loading ? "Uploading..." : status === 'pending' ? "Review in Progress" : "Submit Document"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function VerificationTab({ user, showToast }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Local state initialized with the user's current database status
  const [currentStatus, setCurrentStatus] = useState(user?.verification_status || 'unverified');

  // Keep local status updated if user prop changes
  useEffect(() => {
    if (user?.verification_status) {
      setCurrentStatus(user.verification_status);
    }
  }, [user?.verification_status]);

  // =========================================================
  // REALTIME LISTENER: Listens for Admin Approvals/Rejections
  // =========================================================
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`kyc-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendors',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          const newStatus = payload.new?.verification_status;
          if (newStatus && newStatus !== currentStatus) {
            setCurrentStatus(newStatus);

            if (newStatus === 'approved') {
              showToast("Verified!", "Your business has been officially verified!", "success");
            } else if (newStatus === 'rejected') {
              showToast("KYC Update", "Your document verification was rejected. Please re-upload.", "error");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentStatus, showToast]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showToast("No File", "Please select a document first.", "error");

    setLoading(true);
    
    // 1. Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_kyc_${Date.now()}.${fileExt}`;
    const filePath = `kyc_docs/${fileName}`;

    try {
      // 2. Upload to Supabase Storage
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

      // Instantly switch UI to pending
      setCurrentStatus('pending');
      showToast("Uploaded!", "Your document is now pending admin review.", "success");

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
          <div style={{ 
            fontSize: "20px", 
            fontWeight: "900", 
            marginTop: "8px", 
            textTransform: "capitalize",
            color: currentStatus === 'approved' ? "#10B981" : currentStatus === 'pending' ? "#D97706" : currentStatus === 'rejected' ? "#EF4444" : "#0F172A" 
          }}>
            {currentStatus}
          </div>
        </div>

        {currentStatus === 'approved' ? (
          <div style={{ 
            background: "#ECFDF5", 
            border: "1px solid #A7F3D0",
            padding: "16px 20px", 
            borderRadius: "8px", 
            color: "#065F46", 
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Your business is fully verified!</span>
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
                disabled={loading || currentStatus === 'pending'} 
              />
            </div>
            
            <button 
              className="btn-primary btn-hover" 
              style={{ width: "100%" }} 
              type="submit" 
              disabled={loading || !file || currentStatus === 'pending'}
            >
              {loading ? "Uploading..." : currentStatus === 'pending' ? "Review in Progress" : "Submit Document"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

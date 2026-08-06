import React, { useState } from 'react';
import { supabase, DESIGN } from '../supabaseClient';
import { PaintIcon, AlertIcon } from '../components/Icons';

function BrandSettings({ user, onUpdate, showToast }) {
  const [logoUrl, setLogoUrl] = useState(user?.logo_url || "");
  const [brandColor, setBrandColor] = useState(user?.brand_color || "#000000");
  const [customThankYou, setCustomThankYou] = useState(user?.custom_thank_you || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const handleLogoUpload = async (e) => {
    const file = e.target.files;
    if (!file) return;
    
    if (file.size > 5242880) {
      showToast("File Too Large", "Logos must be smaller than 5MB.", "error");
      return;
    }

    setUploading(true);
    setUploadPercent(0);
    
    const progressInterval = setInterval(() => {
      setUploadPercent((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 250);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
    
    try {
      const fileBlob = new Blob([file], { type: file.type });

      const uploadPromise = supabase.storage.from('LOGOS').upload(fileName, fileBlob, {
        cacheControl: '3600',
        upsert: false 
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timed out. Check your RLS target or network status.")), 8000)
      );

      const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      clearInterval(progressInterval);

      if (uploadError) { 
        setUploadPercent(0);
        setUploading(false);
        showToast("Upload Blocked", uploadError.message, "error"); 
        return; 
      }
      
      setUploadPercent(100);
      const { data: urlData } = supabase.storage.from('LOGOS').getPublicUrl(fileName);
      setLogoUrl(urlData.publicUrl);
      showToast("Logo Uploaded", "Image ready! Remember to click Save below.", "success");
      
      setTimeout(() => {
        setUploading(false);
        setUploadPercent(0);
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval);
      setUploadPercent(0);
      setUploading(false);
      showToast("System Timeout", err.message || "The backend dropped the connection payload.", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('vendors').update({ logo_url: logoUrl, brand_color: brandColor, custom_thank_you: customThankYou }).eq('id', user.id);
    if (error) { showToast("Database Error", error.message, "error"); }
    else {
      showToast("Brand Updated", "Your custom brand settings have been saved successfully.", "success");
      onUpdate({ ...user, logo_url: logoUrl, brand_color: brandColor, custom_thank_you: customThankYou });
    }
    setLoading(false);
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: DESIGN.textMuted }}>Support accounts cannot access Brand Settings.</div>;

  const isPremium = user?.subscription_tier === 'premium';

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}><PaintIcon /> Branding & Assets</div>
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px" }}>Customize how your invoices look to your clients.</div>
      
      <div style={{ position: "relative", background: "#FFFFFF", border: `1px solid ${DESIGN.border}`, borderRadius: 12, padding: "32px", overflow: "hidden" }}>
        
   {/* 🎯 THE UPGRADED GLASSMORPHISM PAYWALL */}
        {!isPremium && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(8px)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
             <div style={{ background: "#F5F3FF", color: DESIGN.premium, padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "900", marginBottom: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: `1px solid ${DESIGN.premium}` }}>💎 PREMIUM FEATURE</div>
             <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", margin: "0 0 12px 0" }}>Unlock Profit Analytics</h3>
             <p style={{ color: "#475569", fontSize: "15px", marginBottom: "28px", maxWidth: "320px", lineHeight: "1.6", fontWeight: "500" }}>Log business expenses to automatically calculate your true net profit.</p>
             <a href="/dashboard/billing" className="btn-primary btn-premium btn-hover" style={{ padding: "16px 32px", fontSize: "15px", boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.3)" }}>Upgrade to Premium</a>
          </div>
        )}

        <form onSubmit={handleSave} style={{ opacity: !isPremium ? 0.4 : 1, pointerEvents: !isPremium ? "none" : "auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700" }}>Upload Company Logo</label>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" style={{ width: "60px", height: "60px", objectFit: "contain", border: `1px solid ${DESIGN.border}`, borderRadius: "8px", padding: "4px" }} />
              ) : (
                <div style={{ width: "60px", height: "60px", background: "#F1F5F9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: DESIGN.textMuted }}>No Logo</div>
              )}
              <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} style={{ fontSize: "13px" }} />
            </div>
            
            {uploading && (
              <div style={{ fontSize: "13px", color: DESIGN.premium, marginTop: "8px", fontWeight: "700" }}>
                Uploading: {uploadPercent}% {uploadPercent === 100 ? " (Complete!)" : ""}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700" }}>Brand Color (Hex Code)</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width: "50px", height: "40px", border: "none", cursor: "pointer", background: "none" }} />
              <input className="form-input" placeholder="#000000" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700" }}>Custom Thank You Message</label>
            <textarea className="form-input" placeholder="e.g. Thank you for shopping with Acme Corp! We appreciate your business." value={customThankYou} onChange={e => setCustomThankYou(e.target.value)} style={{ minHeight: "80px", resize: "vertical" }} />
          </div>
          
          <button className="btn-primary btn-hover" type="submit" disabled={loading} style={{ width: "100%" }}>{loading ? "Saving..." : "Save Brand Settings"}</button>
        </form>
      </div>
    </div>
  );
}

export default BrandSettings;

import LandingPage from './pages/LandingPage';
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import VerificationTab from './components/VerificationTab';
import TaxLedgerTab from './components/TaxLedgerTab';
import auth from './Auth';
import auth from './UpdatePassword';

// --- ENVIRONMENTS & ARTIFACTS ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ""; 

let supabase = null;
let initializationError = null;

if (!SUPABASE_URL || SUPABASE_URL.includes("your-project")) {
  initializationError = "Missing VITE_SUPABASE_URL environment variable on Vercel.";
} else if (!SUPABASE_ANON_KEY) {
  initializationError = "Missing VITE_SUPABASE_ANON_KEY environment variable on Vercel.";
} else {
  try { supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } 
  catch (err) { initializationError = "Supabase initialization failed: " + err.message; }
}

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "030", name: "Heritage Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "090267", name: "Kuda Bank" },
  { code: "090405", name: "Moniepoint Microfinance Bank" },
  { code: "999992", name: "OPay" },
  { code: "090328", name: "PalmPay" },
  { code: "076", name: "Polaris Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
].sort((a, b) => a.name.localeCompare(b.name));

const DESIGN = {
  bg: "#F8FAFC", surface: "#FFFFFF", card: "#FFFFFF", border: "#E2E8F0",
  primary: "#000000", textMain: "#0F172A", textMuted: "#64748B", error: "#EF4444", success: "#10B981", premium: "#8B5CF6",
  chatBubble: "#E2E8F0", chatUser: "#000000"
};

// --- SVG ICONS ---
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const AlertIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const PaintIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path><path d="M12 18h.01"></path></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const MapPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const TagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>);
const MessageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);
const BellIcon = ({ count }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "8px" }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
    {count > 0 && <span style={{ position: "absolute", top: "0", right: "0", background: DESIGN.error, color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "900" }}>{count}</span>}
  </div>
);

const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    
    body { margin: 0; padding: 0; background: #F8FAFC; color: #0F172A; font-family: system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
    
    .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .btn-hover:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
    .btn-hover:active:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

    .btn-primary { padding: 14px 28px; background: #000000; color: #FFFFFF; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
    .btn-premium { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; border: none; }
    .btn-secondary { padding: 12px 24px; background: transparent; color: #000000; border: 2px solid #000000; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
    
    .form-input { width: 100%; padding: 14px 16px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; color: #0F172A; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
    .form-input:focus { border-color: #000000; }
    
    .menu-btn { display: block; width: 100%; padding: 16px 32px; background: transparent; border: none; border-left: 4px solid transparent; color: #64748B; text-align: left; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.15s ease; }
    .menu-btn:hover { background: #F8FAFC; color: #000000; }
    .menu-btn.active { background: #F1F5F9; border-left: 4px solid #000000; color: #000000; font-weight: 700; }
    
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08); }
    
    .dashboard-layout { display: flex; min-height: 100vh; flex-direction: row; }
    
.sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; padding-top: 32px; flex-shrink: 0; transition: transform 0.3s ease; height: 100vh; position: sticky; top: 0; overflow: hidden; }
.sidebar-menu { display: flex; flex-direction: column; width: 100%; flex: 1; overflow-y: auto; padding-bottom: 20px; }
.sidebar-footer { padding: 24px 32px; border-top: 1px solid #E2E8F0; background: #F8FAFC; display: block; margin-top: 0; }
    
    .mobile-dashboard-header { display: none; }
    .mobile-close-btn { display: none; }
    .sidebar-overlay { display: none; }
    
    .main-content { flex: 1; padding: 48px; overflow-y: auto; background: #F8FAFC; min-height: 100vh; }
    .metric-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
    
    .chat-container { display: flex; flex-direction: column; height: 500px; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFF; }
    .chat-messages { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; background: #F8FAFC; }
    .chat-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
    .chat-bubble.admin { background: #E2E8F0; color: #0F172A; align-self: flex-start; border-bottom-left-radius: 4px; }
    .chat-bubble.user { background: #000000; color: #FFFFFF; align-self: flex-end; border-bottom-right-radius: 4px; }
    .chat-input-area { padding: 16px; background: #FFF; border-top: 1px solid #E2E8F0; display: flex; gap: 12px; }

    @keyframes toastSlideIn { 0% { transform: translate(-50%, -100%); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
    .toast-container { animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .nav-buttons-desktop { display: flex; gap: 12px; }
    .mobile-menu-toggle { display: none; background: none; border: none; font-size: 28px; cursor: pointer; color: #0F172A; }
    .mobile-nav-dropdown { display: none; }

    /* 🎯 THE ULTIMATE A4 MOBILE PRINT FIX */
    @media print {
      @page { margin: 10mm; size: A4 portrait; }
      
      /* 1. DESTROY ALL SCROLL LOCKS: This is why it was blank before! We must allow the body to expand past the phone screen size just for the printer. */
      html, body, #root, .dashboard-layout, .main-content {
        background: #FFFFFF !important;
        color: #000000 !important;
        height: auto !important;
        min-height: auto !important;
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        display: block !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .no-print, .sidebar, .mobile-dashboard-header, .sidebar-overlay, .draggablesupport { 
        display: none !important; 
      }
      
      /* 2. FORCE DESKTOP WIDTH: Now that overflow is visible, we force the invoice to be 800px (Desktop A4 size). The mobile printer will see this and auto-shrink it to fit perfectly on the paper! */
      .invoice-page-wrapper {
        display: block !important;
        width: 800px !important;
        min-width: 800px !important;
        max-width: 800px !important;
        min-height: auto !important;
        padding: 0 !important;
        margin: 0 auto !important;
        background: #FFFFFF !important;
      }
      
      .invoice-content-wrapper {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .print-container {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      * { 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
      }
    }
    
    @media (max-width: 768px) {
      .hero-grid { grid-template-columns: 1fr !important; text-align: center !important; }
      .hero-text-container { padding-right: 0 !important; }
      .hero-title { font-size: 38px !important; }
      .nav-buttons-desktop { display: none !important; }
      .mobile-menu-toggle { display: block !important; }
      .mobile-nav-dropdown.open { display: flex !important; flex-direction: column; gap: 12px; padding: 16px 24px; background: #FFF; border-bottom: 1px solid #E2E8F0; }
      
      .dashboard-layout { flex-direction: column; height: 100dvh; overflow: hidden; }
      .mobile-dashboard-header { display: flex !important; justify-content: space-between; align-items: center; padding: 16px 24px; background: #FFFFFF; border-bottom: 1px solid #E2E8F0; z-index: 40; height: 68px; }
      
      .sidebar-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 45; display: none; }
      .sidebar-overlay.open { display: block !important; }
      
      .sidebar { position: fixed; top: 0; left: 0; height: 100%; width: 280px; z-index: 50; transform: translateX(-100%); padding: 24px 0; box-shadow: 4px 0 25px rgba(0,0,0,0.1); overflow-y: auto; }
      .sidebar.open { transform: translateX(0); }
      
      .mobile-close-btn { display: block !important; color: #64748B; padding: 8px; }
      .sidebar-header { padding: 0 24px 24px 24px !important; margin-bottom: 20px !important; }
      .sidebar-menu { border-top: none; padding: 0; overflow-x: hidden; flex-direction: column; }
      .menu-btn { padding: 16px 24px; border-left: 4px solid transparent; border-bottom: none; text-align: left; }
      .menu-btn.active { border-left: 4px solid #000000; border-bottom: none; }
      .sidebar-footer { padding: 24px; }
      
      .main-content { flex: 1; padding: 24px 16px 120px 16px; overflow-y: auto; height: calc(100dvh - 68px); }
      .support-text-mobile { display: none; } 
      @keyframes kudiBounce {
      0%, 100% { transform: scale(2.0) translateY(0); }
      50% { transform: scale(1.9) translateY(-16px); }
    }
    @keyframes textPulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    .bouncing-logo { animation: kudiBounce 1s infinite cubic-bezier(0.25, 1, 0.5, 1); }
    .pulsing-text { animation: textPulse 1s infinite ease-in-out; font-weight: 700; font-size: 14px; color: #0F172A; letter-spacing: 0.05em; text-transform: uppercase; }
    }
  `}</style>
);
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "#FFF1F2", color: "#0F172A", textAlign: "center" }}>
          <GlobalStyles />
          <AlertIcon />
          <h2 style={{ color: "#EF4444", marginTop: "16px" }}>App Rendering Error</h2>
          <p style={{ maxWidth: "500px", color: "#64748B", marginBottom: "24px" }}>{this.state.error?.toString()}</p>
          <button className="btn-primary btn-hover" onClick={() => window.location.reload()}>Reload KudiSlip</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const usePaystack = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
};

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const styles = {
    error: { bg: "#FEF2F2", border: "#FECACA", color: "#EF4444", icon: <AlertIcon /> },
    info: { bg: "#F8FAFC", border: "#E2E8F0", color: "#3B82F6", icon: <InfoIcon /> },
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#10B981", icon: <CheckIcon /> }
  }[toast.type] || { bg: "#ECFDF5", border: "#A7F3D0", color: "#10B981", icon: <CheckIcon /> };

  return (
    <div className="toast-container" style={{ position: "fixed", top: "24px", left: "50%", zIndex: 10000, background: styles.bg, border: `1px solid ${styles.border}`, padding: "16px 24px", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", display: "flex", alignItems: "flex-start", gap: "16px", minWidth: "320px", maxWidth: "90%" }}>
      <div style={{ color: styles.color, display: "flex", marginTop: "2px" }}>{styles.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "800", fontSize: "14px", color: "#0F172A", marginBottom: "4px" }}>{toast.title}</div>
        <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.4" }}>{toast.message}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px", display: "flex", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#0F172A"} onMouseOut={(e) => e.currentTarget.style.color = "#64748B"}>
        <CloseIcon />
      </button>
    </div>
  );
};

// =========================================================
// 2. BRAND SETTINGS (PRO FEATURE)
// =========================================================
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
// =========================================================
// 3. SUBSCRIPTION / BILLING DASHBOARD
// =========================================================
function SubscriptionManager({ user, onUpgradeSuccess, showToast }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isPremium = user?.subscription_tier === 'premium';

  const handleUpgrade = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in Vercel.", "error");

    setIsProcessing(true);
    
    // Dynamically call Paystack v2 Engine to bypass mobile Safari/Chrome iframe blocks
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    
    script.onload = () => {
      try {
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: PAYSTACK_PUBLIC_KEY,
          email: user?.email || "vendor@kudislip.com",
          amount: 15000 * 100, // ₦15,000 in kobo
          currency: "NGN",
          onSuccess: async function(transaction) {
            try {
              const { error } = await supabase.from('vendors').update({ subscription_tier: 'premium' }).eq('id', user.id);
              if (error) throw error;
              onUpgradeSuccess();
              showToast("Upgraded successfully!", "Welcome to Premium! Watermarks have been removed from your invoices.", "success");
            } catch (err) {
              showToast("Upgrade Error", err.message, "error");
            }
            setIsProcessing(false);
          },
          onCancel: function() {
            setIsProcessing(false);
            showToast("Cancelled", "Upgrade transaction closed.", "info");
          }
        });
      } catch (err) {
        setIsProcessing(false);
        showToast("Initialization Error", err.message, "error");
      }
    };

    script.onerror = () => {
      setIsProcessing(false);
      showToast("Network Error", "Failed to compile the secure checkout system window.", "error");
    };

    document.body.appendChild(script);
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: DESIGN.textMuted }}>Support accounts cannot access Billing.</div>;

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Billing & Plan</div>
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px" }}>Manage your KudiSlip subscription.</div>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ background: DESIGN.card, border: `2px solid ${!isPremium ? DESIGN.primary : DESIGN.border}`, borderRadius: 12, padding: "32px", flex: "1", minWidth: "280px", position: "relative" }}>
          {!isPremium && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: DESIGN.primary, color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>CURRENT PLAN</div>}
          <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>Free Forever</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "24px" }}>₦0<span style={{fontSize: "14px", color: DESIGN.textMuted}}>/mo</span></div>
          <ul style={{ paddingLeft: "20px", color: DESIGN.textMuted, fontSize: "14px", lineHeight: "1.8", margin: 0 }}>
            <li>Unlimited Invoices</li>
            <li>Unlimited Clients</li>
            <li>Instant Bank Settlements</li>
            <li><strong style={{color: DESIGN.textMain}}>KudiSlip Watermark Included</strong></li>
          </ul>
        </div>
        <div style={{ background: DESIGN.card, border: `2px solid ${isPremium ? DESIGN.premium : DESIGN.border}`, borderRadius: 12, padding: "32px", flex: "1", minWidth: "280px", position: "relative" }}>
          {isPremium && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: DESIGN.premium, color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>ACTIVE</div>}
          <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", color: DESIGN.premium }}>Enterprise Pro</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "24px" }}>₦15,000<span style={{fontSize: "14px", color: DESIGN.textMuted}}>/mo</span></div>
          <ul style={{ paddingLeft: "20px", color: DESIGN.textMuted, fontSize: "14px", lineHeight: "1.8", marginBottom: "32px" }}>
            <li>Everything in Free</li>
            <li><strong style={{color: DESIGN.textMain}}>Remove KudiSlip Watermark</strong></li>
            <li>Fully Independent Branding</li>
          </ul>
          {!isPremium && <button className="btn-primary btn-premium btn-hover" style={{ width: "100%", padding: "14px", display: "block" }} onClick={handleUpgrade} disabled={isProcessing}>{isProcessing ? "Opening Secure Checkout..." : "Upgrade Now"}</button>}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 4. SUPER ADMIN OPERATIONS DASHBOARD 
// =========================================================
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


// =========================================================
// 6. AUTHENTICATION (CLEAN URLs) - WITH FORGOT PASSWORD
// =========================================================
function KudiSlipAuth({ onLoginSuccess, initialIsSignUp, showToast }) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [isResettingPassword, setIsResettingPassword] = useState(false); // NEW STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // PASSWORD RESET FLOW
  // ==========================================
 const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Call your custom API endpoint instead of Supabase directly
      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link.");
      }
      
      showToast("Reset Link Sent!", "Check your inbox for the secure reset link.", "success");
      setIsResettingPassword(false);
    } catch (err) {
      setError(err.message);
      showToast("Reset Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  // ==========================================
  // MAIN AUTH FLOW (LOGIN/SIGNUP)
  // ==========================================
  const handleAuth = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError("");
    
    try {
      // 1. LOGIN FLOW (Early Return)
      if (!isSignUp) {
        const loginRes = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (loginRes.error) throw loginRes.error;
        
        const vendorRes = await supabase.from('vendors').select('*').eq('id', loginRes.data.user.id).single();
        const mergedUser = Object.assign({}, loginRes.data.user, vendorRes.data);
        onLoginSuccess(mergedUser);
        window.location.href = "/dashboard/invoices";
        return; 
      }
      
      // 2. SIGNUP FLOW (Flat Structure)
      if (!agreedToTerms) throw new Error("You must agree to the Terms and Privacy Policy to continue.");
      
      const authRes = await supabase.auth.signUp({ email: email, password: password });
      if (authRes.error) throw authRes.error;
      
      if (authRes.data.user) {
        const dbRes = await supabase.from('vendors').insert([{ 
          id: authRes.data.user.id, 
          business_name: businessName, 
          email: email 
        }]);
        if (dbRes.error) throw dbRes.error;
        
        // Using .catch() on a single line destroys the need for a nested try/catch block
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: email, businessName: businessName })
        }).catch(err => console.log(err));
      }
      
      showToast("Account Created", "Your setup is complete. Please log in to continue.", "success");
      setIsSignUp(false);
      setLoading(false);
      
    } catch (err) { 
      setError(err.message); 
      showToast("Authentication Error", err.message, "error"); 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#F8FAFC", gap: "24px", width: "100vw", position: "fixed", top: 0, left: 0, zIndex: 99999 }}>
      <img src="/logo.png" alt="KudiSlip Logo" className="bouncing-logo" style={{ height: "40px", transformOrigin: "center center" }} />
      <div className="pulsing-text" style={{ marginTop: "8px" }}>
        {isResettingPassword ? "Sending link..." : "Authenticating..."}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <GlobalStyles />
      <a href="/" style={{ textDecoration: "none", position: "absolute", top: "24px", left: "24px", color: "#64748B", fontWeight: "600", fontSize: "14px", padding: "8px" }} className="btn-hover">&larr; Back to Home</a>
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} /></div>
      
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>
          {isResettingPassword ? "Reset your password" : isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        
        <form onSubmit={isResettingPassword ? handleResetPassword : handleAuth}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          
          {isSignUp && !isResettingPassword && <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Business Name</label><input className="form-input" placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required /></div>}
          
          {/* Email is used in all 3 states */}
          <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Email Address</label><input className="form-input" type="email" placeholder="merchant@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          
          {!isResettingPassword && (
            <>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Password</label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input className="form-input" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: "48px" }} required />
                  <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748B" }}>
                    {showPassword ? ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> )}
                  </div>
                </div>
              </div>
              
              {/* Forgot Password Link strictly on Login */}
              {!isSignUp && (
                <div style={{ textAlign: "right", marginBottom: "24px" }}>
                   <span onClick={() => setIsResettingPassword(true)} style={{ fontSize: "12px", color: DESIGN.primary || "#8B5CF6", fontWeight: "700", cursor: "pointer", textDecoration: "none" }}>Forgot Password?</span>
                </div>
              )}

              {isSignUp && (
                <div style={{ marginBottom: "28px", marginTop: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ cursor: "pointer", marginTop: "2px" }} required />
                  <label htmlFor="terms" style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.5" }}>
                    I agree to the <a href="/terms" style={{ color: "#000", fontWeight: "800", textDecoration: "none" }} target="_blank">Terms & Conditions</a> and <a href="/privacy" style={{ color: "#000", fontWeight: "800", textDecoration: "none" }} target="_blank">Privacy Policy</a>.
                  </label>
                </div>
              )}
            </>
          )}

          <button className="btn-primary btn-hover" style={{ width: "100%", marginTop: isResettingPassword ? "24px" : "0" }} type="submit">
            {isResettingPassword ? "Send Reset Link" : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Dynamic Footer Toggle */}
        <div style={{ textAlign: "center", marginTop: "24px", color: "#64748B", fontSize: "14px" }}>
          {isResettingPassword ? (
             <span style={{ color: "#000000", fontWeight: "800", cursor: "pointer" }} onClick={() => { setIsResettingPassword(false); setError(""); }}>&larr; Back to Log In</span>
          ) : (
            <>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <span style={{ color: "#000000", fontWeight: "800", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>{isSignUp ? "Log In" : "Sign Up"}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
// =========================================================
// 7. CLIENTS CRM (WITH DYNAMIC CREDIT SCORING)
// =========================================================
function ClientsManager({ user, showToast }) {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    
    // Fetch clients
    supabase.from('clients').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setClients(data || []));
    
    // Fetch all invoices to calculate the credit score mathematically
    supabase.from('invoices').select('client_id, status, due_date').eq('vendor_id', user.id).then(({ data }) => setInvoices(data || []));
  }, []);

  const handleAddClient = async (e) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.from('clients').insert([{ vendor_id: user.id, name, email, phone }]).select().single();
    if (!error && data) { 
      setClients([data, ...clients]); setName(""); setEmail(""); setPhone(""); 
      showToast("Client Added", "Customer has been added successfully to your directory.", "success"); 
    }
    else if (error) { showToast("Database Error", "Failed to add client. Check database permissions.", "error"); }
    setLoading(false);
  };

  // 🎯 THE DYNAMIC CREDIT SCORE ENGINE
  const getClientScore = (clientId) => {
    const clientInvoices = invoices.filter(i => i.client_id === clientId);
    
    if (clientInvoices.length === 0) {
      return { label: "NEW", color: "#64748B", bg: "#F1F5F9", text: "No data" };
    }

    let score = 100;
    const now = new Date();
    now.setHours(0,0,0,0); // Normalize to midnight for accurate day comparison

    clientInvoices.forEach(inv => {
      const dueDate = new Date(inv.due_date);
      
      if (inv.status === 'paid') {
        score += 5; // Small boost for completed payments
      } else if (inv.status === 'pending' && dueDate < now) {
        score -= 35; // Massive penalty for holding overdue debt
      }
    });

    if (score >= 100) return { label: "A+ (Excellent)", color: "#10B981", bg: "#ECFDF5", text: "Pays on time" };
    if (score >= 70) return { label: "B (Good)", color: "#3B82F6", bg: "#EFF6FF", text: "Reliable" };
    if (score >= 40) return { label: "C (Slow)", color: "#D97706", bg: "#FEF3C7", text: "Often late" };
    return { label: "F (High Risk)", color: "#EF4444", bg: "#FEF2F2", text: "Overdue debt" };
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Client CRM.</div>;

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Client Directory</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your customer database and track payment reliability.</div>
      
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800" }}>Add New Client</h3>
        <form onSubmit={handleAddClient} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", alignItems: "end" }}>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Name</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Email (Optional)</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Phone</label><input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <button className="btn-primary btn-hover" type="submit" disabled={loading}>{loading ? "Saving..." : "Add Client"}</button>
        </form>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, overflowX: "auto" }}>
        {clients.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No clients added yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "700px" }}>
            <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
              <tr>
                <th style={{ padding: "16px 24px" }}>Client Name</th>
                <th style={{ padding: "16px 24px" }}>Contact Info</th>
                <th style={{ padding: "16px 24px" }}>Trust Score</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => {
                const score = getClientScore(c.id);
                return (
                  <tr key={c.id} style={{ borderTop: `1px solid #E2E8F0` }}>
                    <td style={{ padding: "16px 24px", fontWeight: "800", color: "#0F172A" }}>{c.name}</td>
                    <td style={{ padding: "16px 24px", color: "#64748B", fontSize: "13px", lineHeight: "1.6" }}>
                      {c.email && <div>✉️ {c.email}</div>}
                      {c.phone && <div>📞 {c.phone}</div>}
                      {(!c.email && !c.phone) && "—"}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ background: score.bg, color: score.color, padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {score.label}
                        </span>
                        <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", paddingLeft: "4px" }}>{score.text}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


// =========================================================
// 14. EXPENSES & NET PROFIT TRACKER (PRO FEATURE)
// =========================================================
function ExpensesManager({ user, showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    const [expRes, invRes] = await Promise.all([
      supabase.from('expenses').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('amount, status').eq('vendor_id', user.id).eq('status', 'paid')
    ]);
    
    if (expRes.data) setExpenses(expRes.data);
    if (invRes.data) setInvoices(invRes.data);
    setLoading(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (user?.subscription_tier !== 'premium') {
      return showToast("Premium Required", "Please upgrade to log expenses and track net profit.", "info");
    }
    if (!description || !amount) return;
    
    setSaving(true);
    const { error } = await supabase.from('expenses').insert([{ vendor_id: user.id, description, amount: Number(amount) }]);
    if (error) {
      showToast("Error", error.message, "error");
    } else {
      showToast("Expense Saved", "Successfully added to your ledger.", "success");
      setDescription(""); setAmount("");
      fetchData();
    }
    setSaving(false);
  };

  const handleDeleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id);
    showToast("Deleted", "Expense removed.", "info");
    fetchData();
  };

  const totalGross = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netProfit = totalGross - totalExpenses;
  
  const isPremium = user?.subscription_tier === 'premium';

  if (loading) return <div style={{ color: "#64748B", fontWeight: "600" }}>Loading Ledger...</div>;

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>Profit Analytics <span style={{fontSize: "12px", background: "#FEF08A", color: "#854D0E", padding: "4px 8px", borderRadius: "6px", verticalAlign: "middle"}}>PRO</span></div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Track your actual business margins.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="metric-card">
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Gross Revenue</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#0F172A", marginTop: "8px" }}>₦{totalGross.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Total Expenses</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#EF4444", marginTop: "8px" }}>- ₦{totalExpenses.toLocaleString()}</div>
        </div>
        <div className="metric-card" style={{ background: "#10B981", color: "#FFFFFF", borderColor: "#059669" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#ECFDF5", textTransform: "uppercase" }}>Actual Net Profit</div>
          <div style={{ fontSize: "28px", fontWeight: "900", marginTop: "8px" }}>₦{netProfit.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ position: "relative", background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "40px", overflow: "hidden" }}>
        
        {/* 🎯 THE GLASSMORPHISM PAYWALL */}
        {!isPremium && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(4px)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
             <div style={{ background: "#F5F3FF", color: DESIGN.premium, padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "900", marginBottom: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>PREMIUM FEATURE</div>
             <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", margin: "0 0 8px 0" }}>Unlock Profit Analytics</h3>
             <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px", maxWidth: "320px", lineHeight: "1.5" }}>Log business expenses to automatically calculate your true net profit.</p>
             <a href="/dashboard/billing" className="btn-primary btn-premium btn-hover">Upgrade to Premium</a>
          </div>
        )}

        <div style={{ opacity: !isPremium ? 0.4 : 1, pointerEvents: !isPremium ? "none" : "auto" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "800" }}>Log Business Expense</h3>
          <form onSubmit={handleAddExpense} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: "200px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Description</label>
              <input className="form-input" placeholder="e.g. Server Hosting, Office Rent" value={description} onChange={e=>setDescription(e.target.value)} required />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Amount (₦)</label>
              <input className="form-input" type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)} required />
            </div>
            <button className="btn-primary btn-hover" type="submit" disabled={saving}>{saving ? "Saving..." : "Add to Ledger"}</button>
          </form>
        </div>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Expense History</h3>
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, overflowX: "auto" }}>
        {expenses.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No expenses logged yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "500px" }}>
            <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
              <tr><th style={{ padding: "16px 24px" }}>Date</th><th style={{ padding: "16px 24px" }}>Description</th><th style={{ padding: "16px 24px", textAlign: "right" }}>Amount</th><th style={{ padding: "16px 24px", width: "50px" }}></th></tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderTop: `1px solid #E2E8F0` }}>
                  <td style={{ padding: "16px 24px", color: "#64748B", fontSize: "13px" }}>{new Date(exp.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "16px 24px", fontWeight: "600" }}>{exp.description}</td>
                  <td style={{ padding: "16px 24px", fontWeight: "900", color: "#EF4444", textAlign: "right" }}>-₦{Number(exp.amount).toLocaleString()}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontWeight: "800" }}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =========================================================
// 10. PAYOUT SETTINGS (WITH OTP SECURITY LOCK)
// =========================================================
function PayoutSettings({ user, showToast }) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 🛡️ NEW SECURITY STATES
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => {
    if (user?.bank_code) setBankCode(user.bank_code);
    if (user?.account_number) setAccountNumber(user.account_number);
    if (user?.account_name) setResolvedName(user.account_name); 
  }, [user]);

  const NIGERIAN_BANKS = [
    { name: "-- Select your bank --", code: "" },
    { name: "Access Bank", code: "044" },
    { name: "Ecobank Nigeria", code: "050" },
    { name: "Fidelity Bank", code: "070" },
    { name: "First Bank of Nigeria", code: "011" },
    { name: "First City Monument Bank (FCMB)", code: "214" },
    { name: "Globus Bank", code: "00103" },
    { name: "Guaranty Trust Bank (GTB)", code: "058" },
    { name: "Heritage Bank", code: "030" },
    { name: "Keystone Bank", code: "082" },
    { name: "Kuda Bank", code: "090267" },
    { name: "Moniepoint MFB", code: "090405" },
    { name: "OPay Digital Services", code: "999992" },
    { name: "PalmPay", code: "999991" },
    { name: "Polaris Bank", code: "076" },
    { name: "Providus Bank", code: "101" },
    { name: "Rubies MFB", code: "090175" },
    { name: "Stanbic IBTC Bank", code: "221" },
    { name: "Standard Chartered Bank", code: "068" },
    { name: "Sterling Bank", code: "232" },
    { name: "Taj Bank", code: "000302" },
    { name: "Union Bank of Nigeria", code: "032" },
    { name: "United Bank for Africa (UBA)", code: "033" },
    { name: "Unity Bank", code: "215" },
    { name: "VFD Microfinance Bank", code: "090110" },
    { name: "Wema Bank", code: "035" },
    { name: "Zenith Bank", code: "057" }
  ];

  useEffect(() => {
    if (isEditing || !user?.bank_code) {
      if (accountNumber.length === 10 && bankCode) {
        verifyAccount();
      } else {
        setResolvedName("");
      }
    }
  }, [accountNumber, bankCode, isEditing, user]);

  const verifyAccount = async () => {
    setIsResolving(true);
    setResolvedName("");
    try {
      const response = await fetch('/api/resolve-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode })
      });
      const data = await response.json();
      if (response.ok && data.account_name) setResolvedName(data.account_name);
      else showToast("Verification Failed", data.error || "Could not verify this account number.", "error");
    } catch (err) {
      showToast("Network Error", "Failed to contact bank servers.", "error");
    } finally {
      setIsResolving(false);
    }
  };

  // 🛡️ TRIGGER THE OTP EMAIL
  const handleRequestUpdate = async () => {
    setOtpSending(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, vendorId: user.id, businessName: user.business_name })
      });
      if (!res.ok) throw new Error("Failed to send security code.");
      
      setOtpMode(true);
      showToast("Verification Code Sent", "Please check your email for the 6-digit code.", "info");
    } catch (e) {
      showToast("Error", e.message, "error");
    } finally {
      setOtpSending(false);
    }
  };

  // 🛡️ VERIFY THE OTP TO UNLOCK THE FORM
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return showToast("Invalid Format", "OTP must be exactly 6 digits.", "error");
    
    setOtpVerifying(true);
    
    // Fetch the stored OTP securely directly from the database
    const { data, error } = await supabase.from('vendors').select('otp_code, otp_expires_at').eq('id', user.id).single();
    
    if (error || !data) {
      showToast("Security Error", "Could not verify authorization.", "error");
    } else if (data.otp_code !== otpCode) {
      showToast("Invalid Code", "The security code you entered is incorrect.", "error");
    } else if (new Date(data.otp_expires_at) < new Date()) {
      showToast("Code Expired", "This code has expired. Please request a new one.", "error");
    } else {
      // 🔓 SUCCESS! WIPE THE FORM CLEAN AND UNLOCK IT
      setOtpMode(false);
      setIsEditing(true);
      setOtpCode("");
      setBankCode(""); // Clears old bank
      setAccountNumber(""); // Clears old account number
      setResolvedName(""); // Clears old verified name
      showToast("Identity Verified", "You may now enter your new bank details.", "success");
    }
    
    setOtpVerifying(false);
  };

const handleLinkBank = async (e) => {
    e.preventDefault();
    if (!resolvedName) return showToast("Verification Required", "Please wait for your account name to be verified.", "error");
    setLoading(true);
    
    try {
      // 🧠 SMART ROUTING: Check if they already have a Paystack Subaccount
      const isUpdating = !!user.paystack_subaccount_code;
      const endpoint = isUpdating ? '/api/update-subaccount' : '/api/create-subaccount';
      
      const payload = isUpdating 
        ? {
            subaccount_code: user.paystack_subaccount_code, // Tell Paystack which one to overwrite
            account_number: accountNumber,
            bank_code: bankCode,
            business_name: user.business_name || "KudiSlip Vendor"
          }
        : {
            account_number: accountNumber,
            bank_code: bankCode,
            business_name: user.business_name || "KudiSlip Vendor",
            vendor_id: user.id,
            percentage_charge: 0 
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Paystack rejected these details.");

      // 💾 Save the new bank details to KudiSlip's Database
      const updateData = {
        bank_code: bankCode, 
        account_number: accountNumber,
        account_name: resolvedName
      };

      // If we created a BRAND NEW subaccount, save the new code to the database
      // If we just updated an old one, keep the existing code!
      if (!isUpdating && data.subaccount_code) {
        updateData.paystack_subaccount_code = data.subaccount_code;
      }

      const { error: dbError } = await supabase.from('vendors').update(updateData).eq('id', user.id);
      if (dbError) throw dbError;

      showToast("Bank Updated!", "Your new routing details have been verified and saved.", "success");
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err) {
      showToast("Link Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const hasLinkedBank = user?.bank_code && user?.account_number;
  const linkedBankName = NIGERIAN_BANKS.find(b => b.code === user?.bank_code)?.name || "Your Linked Bank";
  const maskedAccount = user?.account_number ? `•••• •••• ${user.account_number.slice(-4)}` : "";
  const displayAccountName = resolvedName || user?.account_name || "VERIFYING HOLDER...";
  const watermarkPattern = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ctext x='10' y='50' font-family='sans-serif' font-size='14' font-weight='bold' transform='rotate(-45 50 50)'%3EKudiSlip%3C/text%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div style={{ maxWidth: "600px" }}>
      
      {/* 🛡️ OTP MODAL OVERLAY */}
      {otpMode && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", textAlign: "center", animation: "toastSlideIn 0.3s ease" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6", margin: "0 auto 20px auto" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#0F172A" }}>Security Verification</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
              To protect your money, we sent a 6-digit verification code to <strong>{user.email}</strong>.
            </p>
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <input 
                className="form-input" 
                type="text" 
                maxLength="6"
                placeholder="Enter 6-digit code" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "900", padding: "16px" }}
                required 
              />
              <button className="btn-primary btn-hover" type="submit" disabled={otpVerifying} style={{ padding: "14px", fontSize: "15px" }}>
                {otpVerifying ? "Verifying..." : "Verify & Unlock"}
              </button>
              <button type="button" className="btn-secondary btn-hover" style={{ padding: "14px", border: "none", color: "#64748B", background: "transparent" }} onClick={() => setOtpMode(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Payout Settings</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your automated settlement destination.</div>
      
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
        
        {hasLinkedBank && !isEditing ? (
          <div style={{ padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              <div style={{ width: "48px", height: "48px", background: "#000000", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 4px 0", color: "#0F172A" }}>Settlement Route Active</h3>
                <div style={{ color: "#10B981", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified by Paystack
                </div>
              </div>
            </div>
            
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "32px" }}>
              Your automated payout destination is securely linked. All paid invoices will be routed directly to this verified bank account.
            </p>

            <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", backgroundImage: watermarkPattern + ", linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "32px", borderRadius: "20px", marginBottom: "32px", position: "relative", overflow: "hidden", color: "#FFF", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", position: "relative", zIndex: 1 }}>
                <div style={{ width: "45px", height: "35px", background: "linear-gradient(135deg, #FCD34D 0%, #D97706 100%)", borderRadius: "6px", opacity: 0.9 }}></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              </div>
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFFFFF", letterSpacing: "4px", fontFamily: "'Courier New', Courier, monospace", marginBottom: "24px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {maskedAccount}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Account Holder</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFFFFF", letterSpacing: "1px", textTransform: "uppercase" }}>{displayAccountName}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Bank</div>
                     <div style={{ fontSize: "14px", fontWeight: "800", color: "#FFFFFF" }}>{linkedBankName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🛡️ THE NEW SECURE UPDATE BUTTON */}
            <button onClick={handleRequestUpdate} disabled={otpSending} className="btn-secondary btn-hover" style={{ width: "100%", padding: "14px", background: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              {otpSending ? "Securing Session..." : "Securely Update Details"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleLinkBank} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Bank Name</label>
              <select className="form-input" value={bankCode} onChange={e => { setBankCode(e.target.value); setResolvedName(""); }} required>
                {NIGERIAN_BANKS.map((b) => <option key={b.name} value={b.code} disabled={b.code === ""}>{b.name}</option>)}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Account Number</label>
              <input type="number" className="form-input" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required placeholder="e.g. 0123456789" />
            </div>

            {isResolving && (
              <div style={{ padding: "12px", background: "#F1F5F9", borderRadius: "8px", color: "#64748B", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
                Verifying account details with NIBSS...
              </div>
            )}

            {resolvedName && !isResolving && (
              <div style={{ padding: "16px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#10B981", textTransform: "uppercase" }}>Verified Account Name</div>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#065F46" }}>{resolvedName}</div>
              </div>
            )}
            
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button className="btn-primary btn-hover" type="submit" disabled={loading || !resolvedName} style={{ padding: "16px", flex: 1, opacity: (!resolvedName) ? 0.5 : 1 }}>
                {loading ? "Linking..." : "Securely Link Bank"}
              </button>
              
              {hasLinkedBank && (
                <button type="button" onClick={() => { setIsEditing(false); setBankCode(user.bank_code); setAccountNumber(user.account_number); setResolvedName(user.account_name); }} className="btn-hover" style={{ padding: "16px 24px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
// =========================================================
// 13. SUPPORT DASHBOARD (TRAFFIC COP ROUTER & REALTIME)
// =========================================================
function SupportDashboard({ user, showToast }) {
  if (user?.role === 'admin' || user?.role === 'support') {
    return <AdminSupportInbox user={user} showToast={showToast} />;
  }
  return <VendorChat user={user} showToast={showToast} />;
}

// ---------------------------------------------------------
// 13A. VENDOR CHAT (WITH TYPING INDICATORS)
// ---------------------------------------------------------
function VendorChat({ user, showToast }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // 1. Listen for Database Messages
    const msgChannel = supabase.channel('vendor_realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `vendor_id=eq.${user.id}` }, (payload) => {
        setHistory(prev => {
          if (prev.find(msg => msg.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        setIsSupportTyping(false); // Stop typing animation if message arrives
      }).subscribe();

    // 2. Listen for 'Typing' Broadcasts (Invisible signals)
    const typeChannel = supabase.channel(`typing_${user.id}`, { config: { broadcast: { ack: false } } })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender === 'support') {
          setIsSupportTyping(true);
          clearTimeout(typingRef.current);
          typingRef.current = setTimeout(() => setIsSupportTyping(false), 2000);
        }
      }).subscribe();

    return () => { supabase.removeChannel(msgChannel); supabase.removeChannel(typeChannel); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, isSupportTyping]);

  const fetchMessages = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('support_messages').select('*').eq('vendor_id', user.id).order('created_at', { ascending: true });
    if (data) setHistory(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const tempMessage = message;
    setMessage(""); 
    
    await supabase.from('notifications').insert([{ user_id: 'SYSTEM_ADMIN', message: `Ticket Update: ${user.business_name} sent a new message.`, is_read: false }]);
    const { error } = await supabase.from('support_messages').insert([{ vendor_id: user.id, sender: 'user', message: tempMessage }]);
    if (error) { showToast("Error", error.message, "error"); setMessage(tempMessage); }
    else { fetchMessages(); }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    supabase.channel(`typing_${user.id}`).send({ type: 'broadcast', event: 'typing', payload: { sender: 'user' } });
  };

  const handleReopen = async () => {
    await supabase.from('support_messages').insert([{ vendor_id: user.id, sender: 'system', message: 'TICKET_REOPENED' }]);
    await supabase.from('notifications').insert([{ user_id: 'SYSTEM_ADMIN', message: `⚠️ ${user.business_name} REOPENED their support ticket.`, is_read: false }]);
    fetchMessages();
    showToast("Ticket Reopened", "Support has been notified.", "info");
  };

  const isClosed = history.length > 0 && history[history.length - 1].message === 'TICKET_CLOSED';

  return (
    <div style={{ maxWidth: "800px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Support Portal</div>
      <div style={{ color: "#64748B", marginBottom: "24px", fontSize: "15px" }}>Manage your secure ticket with KudiSlip engineers.</div>
      
      <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", flex: 1, minHeight: "500px", overflow: "hidden" }}>
         <div style={{ padding: "16px 24px", borderBottom: "1px solid #000000", background: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "900", fontSize: "16px", color: "#000000", textTransform: "uppercase", letterSpacing: "1px" }}>Ticket #TKT-{user.id.substring(0,6).toUpperCase()}</div>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", background: isClosed ? "#F1F5F9" : "#000000", color: isClosed ? "#64748B" : "#FFFFFF" }}>{isClosed ? "CLOSED" : "OPEN"}</span>
         </div>

         <div style={{ flex: 1, padding: "24px", overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ alignSelf: "flex-start", background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "16px", borderRadius: "0 16px 16px 16px", maxWidth: "80%", fontSize: "14px", color: "#000000", lineHeight: "1.6" }}>
              <strong>KudiSlip Support</strong><br/>Hello {user?.business_name}! Please describe the issue you are facing and an engineer will review it shortly.
            </div>
            
            {loading && <div style={{ textAlign: "center", color: "#64748B", fontSize: "12px" }}>Loading ticket data...</div>}
            
            {history.map((msg) => {
              if (msg.sender === 'system') {
                let txt = msg.message;
                if (txt === 'TICKET_CLOSED') txt = 'Admin has marked this ticket as CLOSED.';
                if (txt === 'TICKET_REOPENED') txt = 'Ticket REOPENED by user.';
                return <div key={msg.id} style={{ textAlign: "center", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", margin: "16px 0", letterSpacing: "1px" }}>— {txt} —</div>;
              }
              const isMe = msg.sender === 'user';
              return (
                <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", background: isMe ? "#000000" : "#FFFFFF", border: isMe ? "none" : "1px solid #E2E8F0", color: isMe ? "#FFFFFF" : "#000000", padding: "14px 18px", borderRadius: isMe ? "16px 16px 0 16px" : "16px 16px 16px 0", maxWidth: "80%", fontSize: "14px", lineHeight: "1.6", wordBreak: "break-word" }}>
                  {!isMe && <div style={{ fontWeight: "800", fontSize: "11px", marginBottom: "4px", color: "#64748B" }}>KudiSlip Support</div>}
                  {msg.message}
                </div>
              );
            })}
            
            {isSupportTyping && (
              <div style={{ alignSelf: "flex-start", background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "12px 18px", borderRadius: "0 16px 16px 16px", fontSize: "14px", color: "#64748B", fontStyle: "italic" }}>
                KudiSlip Support is typing...
              </div>
            )}
            <div ref={chatEndRef} />
         </div>

         {isClosed ? (
           <div style={{ padding: "24px", borderTop: "1px solid #E2E8F0", background: "#FFFFFF", textAlign: "center" }}>
             <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "12px" }}>This issue was marked as resolved. Need more help?</p>
             <button className="btn-secondary btn-hover" onClick={handleReopen}>Reopen Ticket</button>
           </div>
         ) : (
           <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "12px", background: "#FFFFFF" }}>
              <input className="form-input" style={{ flex: 1, margin: 0, background: "#F1F5F9", border: "none" }} placeholder="Type your reply..." value={message} onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button className="btn-primary btn-hover" onClick={handleSend}>Submit</button>
           </div>
         )}
      </div>
    </div>
  );
}
// ---------------------------------------------------------
// 13B. MASTER INBOX (WITH NAMES & TYPING INDICATORS)
// ---------------------------------------------------------
function AdminSupportInbox({ user, showToast }) {
  const [messages, setMessages] = useState([]);
  const [vendors, setVendors] = useState({});
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [reply, setReply] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    fetchData();
    const channel = supabase.channel('admin_realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => { fetchData(); })
      .subscribe();
    return () => { window.removeEventListener('resize', handleResize); supabase.removeChannel(channel); };
  }, []);

  // Dynamically listen for typing ONLY for the actively selected vendor
  useEffect(() => {
    if (!activeVendorId) return;
    setIsUserTyping(false);
    const typeChannel = supabase.channel(`typing_${activeVendorId}`, { config: { broadcast: { ack: false } } })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender === 'user') {
          setIsUserTyping(true);
          clearTimeout(typingRef.current);
          typingRef.current = setTimeout(() => setIsUserTyping(false), 2000);
        }
      }).subscribe();

    return () => supabase.removeChannel(typeChannel);
  }, [activeVendorId]);

 const fetchData = async () => {
    if (!supabase) return;
    const [msgRes, venRes] = await Promise.all([
      supabase.from('support_messages').select('*').order('created_at', { ascending: true }),
      supabase.from('vendors').select('id, business_name, email')
    ]);
    
    // 🚨 THIS WILL POP UP THE EXACT ERROR 🚨
    if (venRes.error) {
       showToast("Vendor Fetch Error", venRes.error.message, "error");
       console.error("Vendor fetch failed:", venRes.error);
    }

    if (msgRes.data) {
      setMessages(msgRes.data);
      setIsUserTyping(false); 
    }
    if (venRes.data) {
      const vMap = {};
      venRes.data.forEach(v => vMap[v.id] = v);
      setVendors(vMap);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !activeVendorId) return;
    const temp = reply; setReply(""); 
    
    await supabase.from('notifications').insert([{ user_id: activeVendorId, message: `Support replied to your ticket.`, is_read: false }]);
    const { error } = await supabase.from('support_messages').insert([{ vendor_id: activeVendorId, sender: 'support', message: temp }]);
    if (error) { showToast("Error", error.message, "error"); setReply(temp); } else { fetchData(); }
  };

  const handleTyping = (e) => {
    setReply(e.target.value);
    if (activeVendorId) {
      supabase.channel(`typing_${activeVendorId}`).send({ type: 'broadcast', event: 'typing', payload: { sender: 'support' } });
    }
  };

  const handleCloseTicket = async () => {
    if (!activeVendorId) return;
    await supabase.from('support_messages').insert([{ vendor_id: activeVendorId, sender: 'system', message: 'TICKET_CLOSED' }]);
    await supabase.from('notifications').insert([{ user_id: activeVendorId, message: `Your support ticket has been closed by an admin.`, is_read: false }]);
    fetchData();
    showToast("Ticket Closed", "The conversation is locked.", "success");
  };

  const conversations = {};
  messages.forEach(m => {
    if (!conversations[m.vendor_id]) conversations[m.vendor_id] = [];
    conversations[m.vendor_id].push(m);
  });

  const uniqueVendorIds = Object.keys(conversations);
  const activeChat = activeVendorId ? conversations[activeVendorId] : [];
  const isClosed = activeChat.length > 0 && activeChat[activeChat.length - 1].message === 'TICKET_CLOSED';
  const activeVendorName = vendors[activeVendorId]?.business_name || vendors[activeVendorId]?.email || "Vendor";

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeChat, isUserTyping]);

  const showList = !isMobile || !activeVendorId;
  const showChat = !isMobile || activeVendorId;

  return (
    <div style={{ maxWidth: "1000px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {!activeVendorId || !isMobile ? (
        <>
          <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Support Inbox</div>
          <div style={{ color: "#64748B", marginBottom: "24px", fontSize: "15px" }}>Manage and reply to all active vendor tickets.</div>
        </>
      ) : null}
      
      <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flex: 1, overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
         {showList && (
           <div style={{ width: isMobile ? "100%" : "280px", borderRight: isMobile ? "none" : "1px solid #E2E8F0", background: "#F8FAFC", overflowY: "auto", flex: isMobile ? 1 : "none" }}>
              {uniqueVendorIds.map(vid => {
                const v = vendors[vid] || {};
                const isActive = activeVendorId === vid;
                const convo = conversations[vid];
                const convoClosed = convo[convo.length - 1].message === 'TICKET_CLOSED';
                return (
                  <div key={vid} onClick={() => setActiveVendorId(vid)} className="card-hover" style={{ padding: "16px", borderBottom: "1px solid #E2E8F0", cursor: "pointer", background: isActive ? "#EFF6FF" : "transparent", borderLeft: isActive ? "4px solid #000000" : "4px solid transparent", opacity: convoClosed ? 0.6 : 1 }}>
                    <div style={{ fontWeight: "900", color: "#000000", fontSize: "14px", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.business_name || v.email || "Unknown Vendor"}</div>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>{convoClosed ? "🔒 Closed" : "Active Ticket"}</div>
                  </div>
                );
              })}
           </div>
         )}

         {showChat && (
           <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", height: "100%" }}>
              {activeVendorId ? (
                <>
                  <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E8F0", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "900", color: "#000000" }}>
                      {isMobile && <button onClick={() => setActiveVendorId(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#000000" }}>&larr;</button>}
                      <span>{activeVendorName}</span>
                    </div>
                    {!isClosed && <button onClick={handleCloseTicket} style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase" }}>Close Ticket</button>}
                  </div>
                  
                  <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {activeChat.map((msg) => {
                      if (msg.sender === 'system') return <div key={msg.id} style={{ textAlign: "center", fontSize: "11px", fontWeight: "800", color: "#64748B", margin: "16px 0", letterSpacing: "1px", textTransform: "uppercase" }}>— {msg.message} —</div>;
                      const isSupport = msg.sender === 'support';
                      return (
                        <div key={msg.id} style={{ alignSelf: isSupport ? "flex-end" : "flex-start", background: isSupport ? "#000000" : "#F1F5F9", color: isSupport ? "#FFFFFF" : "#000000", padding: "12px 16px", borderRadius: isSupport ? "16px 16px 0 16px" : "16px 16px 16px 0", maxWidth: "80%", fontSize: "14px", lineHeight: "1.5" }}>
                          {msg.message}
                        </div>
                      );
                    })}
                    
                    {isUserTyping && (
                      <div style={{ alignSelf: "flex-start", background: "#F1F5F9", padding: "10px 16px", borderRadius: "16px 16px 16px 0", fontSize: "13px", color: "#64748B", fontStyle: "italic" }}>
                        {activeVendorName} is typing...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {!isClosed && (
                    <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "12px" }}>
                      <input className="form-input" style={{ flex: 1, margin: 0 }} placeholder={`Reply to ${activeVendorName}...`} value={reply} onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && handleReply()} />
                      <button className="btn-primary btn-hover" onClick={handleReply}>Send</button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "14px", fontWeight: "600" }}>Select a ticket from the left to start replying.</div>
              )}
           </div>
         )}
      </div>
    </div>
  );
}
// =========================================================
// DRAGGABLE SUPPORT BUTTON COMPONENT (PREMIUM MONOCHROME)
// =========================================================
function DraggableSupportButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.target.setPointerCapture(e.pointerId); 
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    hasMoved.current = true;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <a
      href="/dashboard/support"
      onClick={(e) => { 
        if (hasMoved.current) e.preventDefault(); 
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} 
      className="btn-primary btn-hover"
      style={{ 
        position: "fixed", 
        bottom: "24px", 
        right: "24px", 
        transform: `translate(${pos.x}px, ${pos.y}px)`, 
        borderRadius: "50px", 
        padding: "14px 20px", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        zIndex: 9999, 
        boxShadow: isDragging ? "0 15px 35px -5px rgba(0,0,0,0.4)" : "0 10px 25px -5px rgba(0,0,0,0.3)", 
        textDecoration: "none", 
        touchAction: "none", 
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        color: "#FFFFFF",
        backgroundColor: "#000000", // 🎯 Updated to Premium Black
        fontFamily: "inherit"
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> 
      <span className="support-text-mobile" style={{ fontWeight: "700" }}>Support</span>
    </a>
  );
}


// =========================================================
// 15. USER PROFILE & IDENTITY HUB
// =========================================================
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

// =========================================================
// MAIN APP ROUTER (THE CLEAN URL INTERCEPTOR - BULLETPROOF)
// =========================================================
function AppRouter() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  
  const [activeNotifMenu, setActiveNotifMenu] = useState(null); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  const showToast = (title, message, type = "success") => { setToast({ title, message, type }); setTimeout(() => setToast(null), 5000); };

  // 🎯 SECURITY: Initialize 24-Hour Idle Tracker
  useIdleLogout(supabase);

  // 1. STATE NOW TRACKS CLEAN URL PATHS
  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/");

  // A helper function to safely navigate without full page reloads
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => { const splashTimer = setTimeout(() => setShowSplash(false), 3000); return () => clearTimeout(splashTimer); }, []);

  // 2. MAGIC ROUTER: INTERCEPTS CLICKS GLOBALLY
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    
    const handleGlobalClick = (e) => {
      const link = e.target.closest('a');
      
      if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
        if (link.getAttribute('target') === '_blank' || link.getAttribute('href').startsWith('http')) return;
        
        e.preventDefault();
        const newPath = link.getAttribute('href');
        navigateTo(newPath);
      }
    };
    
    document.addEventListener('click', handleGlobalClick);

    return () => { 
      window.removeEventListener("popstate", handlePopState); 
      document.removeEventListener('click', handleGlobalClick); 
    };
  }, []);

  useEffect(() => {
    const scrollTimer = setTimeout(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, 100);
    return () => clearTimeout(scrollTimer);
  }, [currentPath]);

  useEffect(() => { setSidebarOpen(false); }, [currentPath]);

  useEffect(() => {
    if (initializationError || !supabase) { setIsLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('vendors').select('*').eq('id', session.user.id).single().then(({ data }) => {
          const combinedUser = { ...session.user, ...data };
          setUser(combinedUser);
          setIsLoading(false);
          checkNotifications(combinedUser);

          const notifChannel = supabase.channel('realtime_notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
              if ((combinedUser.role === 'vendor' && payload.new.user_id === combinedUser.id) || 
                  (combinedUser.role === 'admin' && payload.new.user_id === 'SYSTEM_ADMIN')) {
                checkNotifications(combinedUser);
              }
            }).subscribe();

          const path = window.location.pathname;
          // Clean URL redirect logic
          if (path === "" || path === "/" || path === "/login" || path === "/signup") {
             navigateTo('/dashboard/invoices');
          }
        });
      } else { setIsLoading(false); }
    });

    return () => { supabase.removeAllChannels(); }
  }, []);

  const checkNotifications = async (userData) => {
    if (!supabase || !userData) return;
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
    if (userData.role === 'vendor') query = query.eq('user_id', userData.id);
    else query = query.eq('user_id', 'SYSTEM_ADMIN');
    
    const { data } = await query;
    if (data) { setNotifs(data); setUnreadCount(data.filter(n => !n.is_read).length); }
  };

  const markNotificationsRead = async () => {
    if (!user || unreadCount === 0) return;
    let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (user.role === 'vendor') query = query.eq('user_id', user.id);
    else query = query.eq('user_id', 'SYSTEM_ADMIN');
    
    await query;
    setUnreadCount(0);
    setNotifs(notifs.map(n => ({ ...n, is_read: true })));
  };

  const toggleNotifMenu = (menuId) => {
    if (activeNotifMenu === menuId) { setActiveNotifMenu(null); } else { setActiveNotifMenu(menuId); markNotificationsRead(); }
  };

  const renderView = () => {
    if (showSplash || isLoading) return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#F8FAFC", gap: "24px", width: "100vw", position: "fixed", top: 0, left: 0, zIndex: 99999 }}>
        <GlobalStyles />
        <img src="/logo.png" alt="KudiSlip Logo" className="bouncing-logo" style={{ height: "40px", transformOrigin: "center center" }} />
        <div className="pulsing-text" style={{ marginTop: "8px" }}>Loading Your Workspace...</div>
      </div>
    );

    if (initializationError) return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px", textAlign: "center", background: "#FFF1F2" }}>
        <GlobalStyles />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: DESIGN.error, marginBottom: "12px" }}>
          <AlertIcon />
          <div style={{ fontSize: "22px", fontWeight: "900" }}>Configuration Warning</div>
        </div>
        <div style={{ color: DESIGN.textMain, maxWidth: "500px", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>{initializationError}</div>
      </div>
    );

    if (currentPath.startsWith('/pay/')) {
      const cleanId = currentPath.replace('/pay/', '').replace(/[^a-zA-Z0-9-]/g, '');
      return <PublicInvoice invoiceId={cleanId} showToast={showToast} currentUser={user} />;
    }

    if (currentPath === "/update-password") return <UpdatePassword showToast={showToast} />;
    
    if (currentPath === "/terms") return <LegalPage type="terms" />;
    if (currentPath === "/privacy") return <LegalPage type="privacy" />;

    if (!user) {
      if (currentPath === "/login") return <KudiSlipAuth initialIsSignUp={false} showToast={showToast} onLoginSuccess={(u) => { setUser(u); navigateTo("/dashboard/invoices"); }} />;
      if (currentPath === "/signup") return <KudiSlipAuth initialIsSignUp={true} showToast={showToast} onLoginSuccess={(u) => { setUser(u); navigateTo("/dashboard/invoices"); }} />;
      return <LandingPage />;
    }

   // =========================================================
    // 🎯 THE FIX: BULLETPROOF ROUTE PARSING & FAILSAFE
    // =========================================================
    const pathParts = currentPath.split('/').filter(Boolean);
    const dashboardIndex = pathParts.indexOf('dashboard');
    
    let activeTab = "invoices"; 
    
    if (dashboardIndex !== -1 && pathParts.length > dashboardIndex + 1) {
      activeTab = pathParts[dashboardIndex + 1].toLowerCase();
    }
    
    // 🎯 ADDED 'profile' to Valid Tabs array
    const validTabs = ["invoices", "expenses", "clients", "payouts", "profile", "brand", "billing", "support", "admin"];
    if (!validTabs.includes(activeTab)) {
      activeTab = "invoices";
    }

    return (
      <div className="dashboard-layout">
        <GlobalStyles />
        
        {/* MOBILE HEADER */}
        <div className="mobile-dashboard-header" style={{ position: "sticky", top: 0, zIndex: 999, background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <a href="/dashboard/invoices" style={{ display: "block", textDecoration: "none" }}>
            <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "36px", transform: "scale(2.0)", transformOrigin: "left center" }} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative" }}>
               <div onClick={() => toggleNotifMenu('mobile')}><BellIcon count={unreadCount} /></div>
               {activeNotifMenu === 'mobile' && (
                 <div style={{ position: "absolute", top: "100%", right: "-10px", width: "300px", background: "#FFF", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", zIndex: 1000, overflow: "hidden", marginTop: "12px" }}>
                   <div style={{ padding: "12px 16px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontWeight: "800", fontSize: "13px", color: "#0F172A" }}>Notifications</div>
                   <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                     {notifs.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>No recent notifications.</div> : 
                      notifs.map(n => (
                        <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: n.is_read ? "#FFF" : "#EFF6FF", fontSize: "13px", color: "#0F172A", lineHeight: "1.5" }}>{n.message}</div>
                      ))
                     }
                   </div>
                 </div>
               )}
            </div>
            <button style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#0F172A" }} onClick={() => setSidebarOpen(true)}>☰</button>
          </div>
        </div>

        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => { setSidebarOpen(false); setActiveNotifMenu(null); }}></div>

        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img src="/logo.png" alt="KudiSlip" style={{ height: "40px", transform: "scale(2.2)", transformOrigin: "left center" }} />
            <button className="mobile-close-btn" style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer" }} onClick={() => setSidebarOpen(false)}>×</button>
          </div>
          
         <div className="sidebar-menu">
            {user.role !== 'support' && (
              <>
                <a href="/dashboard/invoices" className={`menu-btn ${activeTab === "invoices" ? "active" : ""}`}>Invoices & CRM</a>
                <a href="/dashboard/expenses" className={`menu-btn ${activeTab === "expenses" ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Profit Analytics <span style={{fontSize: "10px", background: "#FEF08A", color: "#854D0E", padding: "2px 6px", borderRadius: "4px", fontWeight: "800"}}>PRO</span>
                </a>
                <a href="/dashboard/clients" className={`menu-btn ${activeTab === "clients" ? "active" : ""}`}>Client Directory</a>
                <a href="/dashboard/payouts" className={`menu-btn ${activeTab === "payouts" ? "active" : ""}`}>Payout Settings</a>
                
                {/* 🎯 THE PROFILE SECTION LINK FOR BOTH MOBILE AND DESKTOP */}
                <a href="/dashboard/profile" className={`menu-btn ${activeTab === "profile" ? "active" : ""}`}>Profile Settings</a>
                
                <a href="/dashboard/brand" className={`menu-btn ${activeTab === "brand" ? "active" : ""}`}>Brand Settings</a>
                <a href="/dashboard/billing" className={`menu-btn ${activeTab === "billing" ? "active" : ""}`}>Billing & Plan</a>
              </>
            )}
            <a href="/dashboard/support" className={`menu-btn ${activeTab === "support" ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               {user.role === 'vendor' ? 'Helpdesk & Ticket' : 'Support Inbox'}
            </a>

            {user?.role === 'admin' && (
              <a href="/dashboard/admin" className={`menu-btn ${activeTab === "admin" ? "active" : ""}`} style={{ color: "#8B5CF6", borderTop: "1px dashed #E2E8F0", marginTop: "12px", paddingTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldIcon /> Admin Operations
              </a>
            )}
          </div>
          <div style={{ flex: 1 }} />
          
          {/* DESKTOP NOTIFICATION BELL */}
          <div style={{ padding: "0 32px", marginBottom: "24px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
               <div onClick={() => toggleNotifMenu('desktop')} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#64748B", fontWeight: "700", fontSize: "14px" }}>
                 <BellIcon count={unreadCount} /> Notifications
               </div>
               {activeNotifMenu === 'desktop' && (
                 <div style={{ position: "absolute", bottom: "100%", left: "0", width: "300px", background: "#FFF", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 -10px 25px -5px rgba(0,0,0,0.1)", zIndex: 1000, overflow: "hidden", marginBottom: "12px" }}>
                   <div style={{ padding: "12px 16px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontWeight: "800", fontSize: "13px", color: "#0F172A" }}>Notifications</div>
                   <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                     {notifs.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>No recent notifications.</div> : 
                      notifs.map(n => (
                        <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: n.is_read ? "#FFF" : "#EFF6FF", fontSize: "13px", color: "#0F172A", lineHeight: "1.5" }}>{n.message}</div>
                      ))
                     }
                   </div>
                 </div>
               )}
            </div>
          </div>

          <div className="sidebar-footer">
            <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {user?.business_name || user?.email}
            </div>
            <button className="btn-primary btn-hover" style={{ width: "100%", padding: "12px", background: "#FEF2F2", color: "#EF4444" }} onClick={() => supabase.auth.signOut().then(() => { setUser(null); navigateTo("/"); })}>Log Out</button>
          </div>
        </div>

       {/* MAIN VIEW CONTROLLER PANEL */}
        <div className="main-content" onClick={() => { if(activeNotifMenu) setActiveNotifMenu(null) }}>
          {activeTab === "invoices" && <KudiSlipInvoiceEngine user={user} showToast={showToast} />}
          {activeTab === "expenses" && <ExpensesManager user={user} showToast={showToast} />} 
          {activeTab === "clients" && <ClientsManager user={user} showToast={showToast} />}
          {activeTab === "payouts" && <PayoutSettings user={user} onSubaccountLinked={(code) => setUser({ ...user, paystack_subaccount_code: code })} showToast={showToast} />}
          
          {/* 🎯 RENDER THE NEW PROFILE HUB */}
          {activeTab === "profile" && <ProfileSettings user={user} showToast={showToast} onUpdate={(u) => setUser(u)} />}
          
          {activeTab === "brand" && <BrandSettings user={user} onUpdate={(u) => setUser(u)} showToast={showToast} />}
          {activeTab === "billing" && <SubscriptionManager user={user} onUpgradeSuccess={() => setUser({ ...user, subscription_tier: 'premium' })} showToast={showToast} />}
          {activeTab === "support" && <SupportDashboard user={user} showToast={showToast} />}
          {activeTab === "admin" && <SuperAdminDashboard user={user} showToast={showToast} />}
        </div>
      </div>
    );
  }; 

  return (
    <>
      <ErrorBoundary>
        {renderView()}
      </ErrorBoundary>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div className="no-print">
        {user && user.role === 'vendor' && currentPath !== "/dashboard/support" && !currentPath.startsWith("/pay/") && currentPath !== "/update-password" && (
          <DraggableSupportButton />
        )}
      </div>
    </>
  );
} 
// Security Hook
function useIdleLogout(supabaseClient) {
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (supabaseClient) {
          supabaseClient.auth.signOut().then(() => {
            window.location.href = '/login';
          });
        }
      }, 86400000); 
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); 

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [supabaseClient]);
}
export default AppRouter;

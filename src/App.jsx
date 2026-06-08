import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

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
    
    .sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; padding: 32px 0; flex-shrink: 0; transition: transform 0.3s ease; }
    .sidebar-header { padding: 0 32px; margin-bottom: 40px; display: flex; justifyContent: space-between; align-items: center; width: 100%; }
    .sidebar-menu { display: flex; flex-direction: column; width: 100%; }
    .sidebar-footer { padding: 16px 32px; margin-top: auto; display: block; }
    
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
// LEGAL PAGES (T&C and Privacy Policy)
// =========================================================
function LegalPage({ type }) {
  const isTerms = type === "terms";
  
  // 1. Create a physical anchor to the top of this component
  const topAnchorRef = useRef(null);
  
  // 2. Force the browser to snap to this exact element on load
  useEffect(() => {
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
    // Backup standard scroll just in case
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [type]);
  
  return (
    // 3. Attach the anchor directly to the parent wrapper
    <div ref={topAnchorRef} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
      <GlobalStyles />
      <nav style={{ padding: "24px", borderBottom: `1px solid ${DESIGN.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none", color: DESIGN.textMuted, fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }} className="btn-hover">&larr; Back Home</a>
        <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "24px", transform: "scale(1.5)" }} />
      </nav>
      
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px", color: DESIGN.textMain, lineHeight: "1.8", flex: 1 }}>
        <h1 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          {isTerms ? "Terms & Conditions" : "Privacy Policy"}
        </h1>
        <p style={{ color: DESIGN.textMuted, marginBottom: "40px", fontSize: "14px", fontWeight: "600" }}>
          Last updated: June 6, 2026
        </p>

        {isTerms ? (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>By accessing or using KudiSlip (kudislip.com.ng), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>2. Description of Service</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>KudiSlip provides a cloud-based Customer Relationship Management (CRM) and invoicing platform designed for merchants. The service allows users to generate invoices, manage client directories, track revenue, and receive automated payments via third-party payment gateways (e.g., Paystack).</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>3. Account Registration & KYC</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>To use KudiSlip, you must register for an account and provide accurate business information.</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>You are responsible for maintaining the security of your password and account.</li>
              <li>We reserve the right to suspend or terminate accounts that provide false information or fail our internal Know Your Customer (KYC) compliance checks.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>4. Subscriptions and Payments</h2>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Free Tier:</strong> KudiSlip offers a free tier that includes basic invoicing, CRM tools, and a KudiSlip watermark on generated receipts.</li>
              <li style={{ marginBottom: "8px" }}><strong>Premium Tier:</strong> Users may upgrade to a paid subscription (Premium) to unlock custom branding, remove watermarks, and access advanced features. Subscription fees are billed in advance on a recurring basis.</li>
              <li><strong>Transaction Fees:</strong> While KudiSlip does not charge a platform fee on the Free tier, standard payment processing fees applied by our gateway partner (Paystack) will be deducted from your settlements. KudiSlip is not responsible for funds held or delayed by third-party payment processors or banks.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>5. Acceptable Use</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>You agree not to use KudiSlip to:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Invoice for illegal, fraudulent, or heavily restricted goods and services.</li>
              <li style={{ marginBottom: "8px" }}>Upload malicious code, viruses, or attempt to breach the platform's security.</li>
              <li>Harass, abuse, or spam your clients using our automated reminder systems.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>6. Intellectual Property</h2>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Platform Rights:</strong> KudiSlip retains all rights, title, and interest in the platform’s code, design, and branding.</li>
              <li><strong>Your Data:</strong> You retain full ownership of the data you input into the platform, including your client lists, custom logos, and financial records.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>7. Limitation of Liability</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>KudiSlip provides the platform on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the service will be entirely uninterrupted or error-free. In no event shall KudiSlip be liable for any indirect, incidental, or consequential damages, including loss of profits, data, or business interruptions.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>8. Governing Law</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>1. Introduction</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>At KudiSlip, we take your privacy and the privacy of your clients very seriously. This Privacy Policy explains how we collect, use, and protect your personal and business information when you use our platform at kudislip.com.ng.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>2. Information We Collect</h2>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Account Information:</strong> When you sign up, we collect your business name, email address, phone number, and password.</li>
              <li style={{ marginBottom: "8px" }}><strong>Financial Information:</strong> To route your payments, we collect your bank account details. <em>Note: We do not store raw credit card numbers; all transactions are securely processed by Paystack.</em></li>
              <li style={{ marginBottom: "8px" }}><strong>CRM & Client Data:</strong> We store the client data you input (names, emails, phone numbers) and your invoice history so you can manage your business.</li>
              <li><strong>Usage Data:</strong> We collect basic analytics on how you use the platform (e.g., login times, features used) to help us improve the service.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>3. How We Use Your Information</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>We use your data to:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Provide, maintain, and improve the KudiSlip platform.</li>
              <li style={{ marginBottom: "8px" }}>Process your subscription payments and route your invoice settlements.</li>
              <li style={{ marginBottom: "8px" }}>Send you important administrative emails, support messages, and platform updates.</li>
              <li>Facilitate the automated email and WhatsApp invoice reminders you trigger for your clients.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>4. Data Sharing and Third Parties</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>We do not sell your personal or client data to anyone. We only share data with trusted third-party services strictly necessary to operate the platform:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Paystack:</strong> For securely processing payments and verifying bank subaccounts.</li>
              <li style={{ marginBottom: "8px" }}><strong>Supabase:</strong> For secure cloud database hosting and data storage.</li>
              <li><strong>Legal Compliance:</strong> We may disclose your information if required to do so by Nigerian law or subpoena.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>5. Data Security</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>We implement bank-grade security measures, including data encryption in transit and at rest, to protect your information. While we strive to use commercially acceptable means to protect your data, no method of transmission over the internet is 100% secure.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>6. Your Data Rights (NDPR Compliance)</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>Under the Nigeria Data Protection Regulation (NDPR), you have the right to:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Access the personal data we hold about you.</li>
              <li style={{ marginBottom: "8px" }}>Request corrections to inaccurate data.</li>
              <li>Request the complete deletion of your account and all associated data ("Right to be Forgotten").</li>
            </ul>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>To exercise any of these rights, please contact our support team.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>7. Contact Us</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>If you have any questions about this Privacy Policy or how we handle your data, please contact us at: <strong>support@kudislip.com.ng</strong>.</p>
          </>
        )}
      </main>
      
      <footer style={{ borderTop: `1px solid ${DESIGN.border}`, padding: "32px 24px", textAlign: "center", color: DESIGN.textMuted, fontSize: "13px" }}>
        © 2026 KudiSlip Technologies. All rights reserved.
      </footer>
    </div>
  );
}
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
    // 🎯 THE FIX: target.files[0] prevents the 90% hang by sending the actual image file
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB Limit)
    if (file.size > 5242880) {
      showToast("File Too Large", "Logos must be smaller than 5MB.", "error");
      return;
    }

    setUploading(true);
    setUploadPercent(0);
    
    // Smart UI Tracker: Animates smoothly up to 90%
    const progressInterval = setInterval(() => {
      setUploadPercent((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 250);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
    
    try {
      // SHIELD 1: Convert the raw file into an in-memory binary Blob to bypass mobile browser stream lockups
      const fileBlob = new Blob([file], { type: file.type });

      // SHIELD 2: Set an 8-second timeout racer so the upload can NEVER hang at 90% infinitely
      const uploadPromise = supabase.storage.from('LOGOS').upload(fileName, fileBlob, {
        cacheControl: '3600',
        upsert: false 
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timed out. Check your RLS target or network status.")), 8000)
      );

      // Execute race track conditions
      const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      clearInterval(progressInterval);

      if (uploadError) { 
        setUploadPercent(0);
        setUploading(false);
        showToast("Upload Blocked", uploadError.message, "error"); 
        return; 
      }
      
      // Success! Snap straight to 100%
      setUploadPercent(100);
      const { data: urlData } = supabase.storage.from('LOGOS').getPublicUrl(fileName);
      setLogoUrl(urlData.publicUrl);
      showToast("Logo Uploaded", "Image ready! Remember to click Save below.", "success");
      
      setTimeout(() => {
        setUploading(false);
        setUploadPercent(0);
      }, 1500);

    } catch (err) {
      // Forces any silent backend dropouts to reveal their logs to us directly on screen
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

  if (user?.subscription_tier !== 'premium') {
    return (
      <div style={{ maxWidth: "600px" }}>
        <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}><PaintIcon /> Branding & Assets</div>
        <div style={{ padding: "40px 32px", background: "#F5F3FF", border: `1px solid ${DESIGN.premium}`, borderRadius: "12px", textAlign: "center", marginTop: "24px" }}>
          <div style={{ fontSize: "18px", fontWeight: "800", color: DESIGN.premium, marginBottom: "12px" }}>Premium Feature</div>
          <div style={{ color: DESIGN.textMain, marginBottom: "24px", lineHeight: "1.6" }}>Upgrade your account to upload your custom business logo, alter colors, and set custom thank-you messages.</div>
          <a href="/dashboard/billing" className="btn-primary btn-premium btn-hover" style={{ display: "block", width: "100%" }}>Upgrade to Premium</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}><PaintIcon /> Branding & Assets</div>
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px" }}>Customize how your invoices look to your clients.</div>
      
      <div style={{ background: "#FFFFFF", border: `1px solid ${DESIGN.border}`, borderRadius: 12, padding: "32px" }}>
        <form onSubmit={handleSave}>
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
// 8. KUDISLIP UNIQUE INVOICE ENGINE (WITH ANALYTICS, PRO TOGGLES & EMAIL ENGINE)
// =========================================================
function KudiSlipInvoiceEngine({ user, showToast }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  
  const [items, setItems] = useState([{ description: "", quantity: 1, price: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [showLogoWarning, setShowLogoWarning] = useState(false);
  
  // PRO TOGGLES
  const [invoiceType, setInvoiceType] = useState("one-time");
  const [passFees, setPassFees] = useState(false); 

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcData, setCalcData] = useState({ currency: 'USD', amount: '', rate: 0, result: 0, loading: false });
  
  // EMAIL ENGINE STATE (Tracks exactly which invoice is sending)
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };

  useEffect(() => {
    if (!supabase) return;
    supabase.from('clients').select('*').eq('vendor_id', user.id).then(({ data }) => setClients(data || []));
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    const { data } = await supabase.from('invoices').select('*, clients(name, email, phone)').eq('vendor_id', user.id).order('created_at', { ascending: false });
    if(data) setInvoices(data);
  };

  const handleAddItem = () => setItems([...items, { description: "", quantity: 1, price: "" }]);
  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index, field, value) => { const newItems = [...items]; newItems[index][field] = value; setItems(newItems); };
  
  const calculateTotal = () => items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);

  const handleCalculateRate = async (e) => {
    e.preventDefault();
    if (!calcData.amount) return;
    setCalcData(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${calcData.currency}`);
      const data = await res.json();
      const rate = data.rates.NGN;
      setCalcData(prev => ({ ...prev, rate, result: Number(prev.amount) * rate, loading: false }));
    } catch (err) {
      showToast("API Error", "Could not fetch live market rates. Please check your network.", "error");
      setCalcData(prev => ({ ...prev, loading: false }));
    }
  };

  const applyCalculatedRate = () => {
    setItems([{ description: `${calcData.currency} Invoice Conversion`, quantity: 1, price: Math.round(calcData.result) }]);
    setCalcOpen(false);
    showToast("Rate Applied", `Converted to ₦${Math.round(calcData.result).toLocaleString()}`, "success");
  };

  const handleGenerateInvoice = async (force = false) => {
    if (!selectedClient || !dueDate) return showToast("Missing Fields", "Please select a client and a due date.", "error");
    if (user.subscription_tier === 'premium' && !user.logo_url && force !== true) {
      setShowLogoWarning(true);
      return;
    }
    
    setShowLogoWarning(false);
    setLoading(true);
    
    const finalItems = invoiceType !== "one-time" 
      ? items.map(i => ({ ...i, description: `[${invoiceType.toUpperCase()}] ${i.description}` })) 
      : items;
    
    const { data, error } = await supabase.from('invoices').insert([{ 
      vendor_id: user.id, 
      client_id: selectedClient, 
      amount: calculateTotal(), 
      items: finalItems, 
      due_date: dueDate, 
      currency: 'NGN',
      fee_passed_on: passFees,
      is_recurring: invoiceType !== "one-time", 
      recurring_frequency: invoiceType !== "one-time" ? invoiceType : null
    }]).select().single();
    
    if (error) { showToast("Database Error", error.message, "error"); } 
    else {
      showToast("Invoice Generated!", "A secure payment link has been created successfully.", "success");
      setItems([{ description: "", quantity: 1, price: "" }]); setSelectedClient(""); setDueDate(""); setInvoiceType("one-time"); setPassFees(false);
      fetchRecentInvoices();
    }
    setLoading(false);
  };

  // =========================================================
  // AUTOMATED EMAIL ENGINE LOGIC
  // =========================================================
  const handleSendEmail = async (inv) => {
    if (!inv || !inv.clients?.email) {
      showToast("Missing Info", "This client doesn't have an email address saved.", "error");
      return;
    }

    setSendingEmailId(inv.id);
    showToast("Sending...", "Dispatching email via Resend...", "info");

    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: inv.clients.email,
          clientName: inv.clients.name || "Valued Client",
          invoiceAmount: inv.amount,
          invoiceLink: `${window.location.origin}/pay/${inv.id}`,
          vendorName: user.business_name || "KudiSlip Merchant"
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast("Delivered!", `Invoice sent to ${inv.clients.email}`, "success");
      } else {
        showToast("Delivery Failed", data.error || "Could not send email.", "error");
      }
    } catch (error) {
      console.error("Email Error:", error);
      showToast("Network Error", "Something went wrong contacting the mail server.", "error");
    } finally {
      setSendingEmailId(null);
    }
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Invoices.</div>;

  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPending = totalBilled - totalPaid;

  const filteredInvoices = invoices.filter(inv => {
    const clientName = (inv.clients?.name || "").toLowerCase();
    const itemsStr = JSON.stringify(inv.items || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return clientName.includes(q) || itemsStr.includes(q);
  }).sort((a, b) => {
    if (sortOrder === "date-desc") return new Date(b.created_at) - new Date(a.created_at);
    if (sortOrder === "date-asc") return new Date(a.created_at) - new Date(b.created_at);
    if (sortOrder === "name-asc") return (a.clients?.name || "").localeCompare(b.clients?.name || "");
    if (sortOrder === "name-desc") return (b.clients?.name || "").localeCompare(a.clients?.name || "");
    return 0;
  });

  if (!user?.paystack_subaccount_code) return <div style={{ padding: "20px", background: "#FEF2F2", border: `1px solid #EF4444`, borderRadius: "8px", marginBottom: "24px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontWeight: "800", marginBottom: "6px" }}><h3 style={{ margin: 0 }}>Action Required</h3></div><div style={{ fontSize: "14px" }}>Link a bank account in <a href="/dashboard/payouts" style={{ color: "#EF4444" }}>Payout Settings</a> first.</div></div>;

  return (
    <div style={{ maxWidth: "900px" }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      {showLogoWarning && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", margin: "0 auto 16px auto" }}>⚠️</div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "10px", color: "#0F172A", textAlign: "center" }}>Missing Brand Logo</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px", textAlign: "center" }}>You are a Premium user, but you haven't uploaded a custom logo yet! The default KudiSlip logo will be used on this invoice.</p>
            <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
              <a href="#/dashboard/brand" className="btn-primary btn-premium btn-hover" style={{ textAlign: "center", padding: "14px", textDecoration: "none" }} onClick={() => setShowLogoWarning(false)}>Upload Logo Now</a>
              <button className="btn-secondary btn-hover" onClick={() => handleGenerateInvoice(true)} style={{ padding: "14px", border: "none", background: "#F1F5F9" }}>Ignore & Generate</button>
              <button onClick={() => setShowLogoWarning(false)} style={{ background: "none", border: "none", color: "#64748B", fontWeight: "700", marginTop: "4px", cursor: "pointer", padding: "10px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>CRM & Invoicing</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Bill your clients and monitor your business health.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Billed</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>₦{totalBilled.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Collected</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#10B981" }}>₦{totalPaid.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Pending Debt</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#EF4444" }}>₦{totalPending.toLocaleString()}</div></div>
      </div>

      {invoices.length > 0 && <RevenueChart invoices={invoices} />}

      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "40px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>Create New Invoice</h3>
        
        {calcOpen ? (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, color: "#1E3A8A", fontSize: "15px", fontWeight: "800" }}>Foreign Client Auto-Calculator</h4>
              <button onClick={() => setCalcOpen(false)} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer", fontWeight: "800" }}>Close</button>
            </div>
            <form onSubmit={handleCalculateRate} style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "800", color: "#3B82F6", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Currency</label>
                <select className="form-input" style={{ width: "110px", padding: "10px" }} value={calcData.currency} onChange={e => setCalcData({...calcData, currency: e.target.value})}>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "800", color: "#3B82F6", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Target Amount</label>
                <input className="form-input" type="number" style={{ width: "130px", padding: "10px" }} placeholder="e.g. 100" value={calcData.amount} onChange={e => setCalcData({...calcData, amount: e.target.value})} required />
              </div>
              <button className="btn-primary btn-hover" type="submit" disabled={calcData.loading} style={{ padding: "10px 20px", background: "#2563EB", fontSize: "14px" }}>
                {calcData.loading ? "Fetching..." : "Get Live Rate"}
              </button>
            </form>
            
            {calcData.result > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #BFDBFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#3B82F6", fontWeight: "600" }}>Live Rate: 1 {calcData.currency} = ₦{calcData.rate}</div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: "#1E3A8A" }}>Total: ₦{calcData.result.toLocaleString()}</div>
                </div>
                <button className="btn-primary btn-hover" onClick={applyCalculatedRate} style={{ padding: "8px 16px", background: "#10B981", fontSize: "13px", border: "none", color: "white" }}>Apply to Invoice</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setCalcOpen(true)} style={{ background: "transparent", border: "1px dashed #CBD5E1", color: "#3B82F6", width: "100%", padding: "14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", marginBottom: "32px", fontSize: "14px", transition: "all 0.2s" }} className="btn-hover">
            + Calculate Foreign Currency (USD/GBP)
          </button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Billed To (Client)</label>
            <select className="form-input" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}><option value="">-- Select Client --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          <div><label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Due Date</label><input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#D97706", display: "block", marginBottom: "8px" }}>Billing Frequency (Premium)</label>
            <select className="form-input" value={invoiceType} onChange={e => setInvoiceType(e.target.value)} disabled={user?.subscription_tier !== 'premium'} style={{ border: user?.subscription_tier === 'premium' ? "1px solid #FCD34D" : "1px solid #E2E8F0" }}>
              <option value="one-time">One-time Invoice</option>
              <option value="monthly">Monthly Recurring</option>
              <option value="weekly">Weekly Recurring</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#0F172A", background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <input type="checkbox" checked={passFees} onChange={(e) => setPassFees(e.target.checked)} disabled={user?.subscription_tier !== 'premium'} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
            Pass Paystack Transaction Fees to Client <span style={{fontSize: "10px", background: "#FEF08A", color: "#854D0E", padding: "2px 6px", borderRadius: "4px"}}>PRO</span>
          </label>
        </div>

        <div style={{ marginBottom: "24px" }}>
          {items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "8px", paddingLeft: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Item Description</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Qty</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Unit Price</div>
              <div style={{ width: "28px" }}></div>
            </div>
          )}
          
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "12px" }}>
              <input className="form-input" placeholder="e.g. Web Design" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
              <input className="form-input" type="number" min="1" placeholder="1" value={item.quantity === '' ? '' : item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))} />
              <input className="form-input" type="number" min="0" placeholder="e.g. 50000" value={item.price === '' ? '' : item.price} onChange={e => handleItemChange(idx, 'price', e.target.value === '' ? '' : Number(e.target.value))} />
              <button onClick={() => handleRemoveItem(idx)} style={{ background: "transparent", color: "#EF4444", border: "none", cursor: "pointer", fontWeight: "800", padding: "0 10px" }}>X</button>
            </div>
          ))}
          <button onClick={() => handleAddItem()} style={{ background: "transparent", color: "#000000", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "14px", padding: 0 }}>+ Add Line Item</button>
        </div>

        <div style={{ borderTop: `1px solid #E2E8F0`, paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900" }}>Total: ₦{calculateTotal().toLocaleString()}</div>
          <button className="btn-primary btn-hover" onClick={() => handleGenerateInvoice(false)} disabled={loading || clients.length === 0}>{loading ? "Generating..." : "Generate Invoice"}</button>
        </div>
      </div>

      {invoices.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Recent Invoices</h3>
            <div style={{ display: "flex", gap: "12px", flex: 1, justifyContent: "flex-end" }}>
              <input className="form-input" style={{ maxWidth: "250px", padding: "10px 16px" }} placeholder="Search name or item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select className="form-input" style={{ maxWidth: "160px", padding: "10px 16px" }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Client A-Z</option>
                <option value="name-desc">Client Z-A</option>
              </select>
            </div>
          </div>
          
          {filteredInvoices.map(inv => {
            const safeInvAmount = Number(inv.amount || 0);
            const invCurrency = inv.currency || "NGN";
            const sym = CURRENCY_SYMBOLS[invCurrency] || "₦";
            
            let parsedItems = [];
            try { parsedItems = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items; } catch(e) { parsedItems = []; }
            const itemSummary = parsedItems.map(i => `${i.description} (x${i.quantity})`).join(', ');

            return (
              <div key={inv.id} className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: "16px", padding: "24px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ wordBreak: "break-word" }}>
                    <div style={{ fontWeight: "900", fontSize: "18px", color: "#0F172A", marginBottom: "4px" }}>{inv.clients?.name}</div>
                    <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.4" }}>
                      <div>{inv.clients?.email}</div>
                      {inv.clients?.phone && <div>{inv.clients.phone}</div>}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "900", padding: "6px 12px", borderRadius: "20px", background: inv.status === 'pending' ? "#FEF3C7" : "#ECFDF5", color: inv.status === 'pending' ? "#D97706" : "#10B981", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
                    {inv.status}
                  </span>
                </div>

                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", color: "#0F172A", fontWeight: "500", border: "1px solid #F1F5F9" }}>
                  <span style={{ color: "#64748B", fontWeight: "800", marginRight: "4px" }}>Items:</span> {itemSummary || "N/A"}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px dashed #E2E8F0`, paddingTop: "16px", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A" }}>
                    {sym}{safeInvAmount.toLocaleString()}
                  </div>
                  
                  {/* ================================================= */}
                  {/* NEW ACTION BUTTONS ROW (WITH EMAIL BUTTON)        */}
                  {/* ================================================= */}
                  <div style={{ display: "flex", gap: "8px", flex: "1 1 auto", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button className="btn-secondary btn-hover" style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "140px" }} onClick={() => window.open("/pay/" + inv.id, '_blank')}>View Link</button>
                    
                    {inv.status === 'pending' && (
                      <button 
                        onClick={() => handleSendEmail(inv)} 
                        disabled={sendingEmailId === inv.id}
                        className="btn-secondary btn-hover"
                        style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "150px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: sendingEmailId === inv.id ? 0.7 : 1 }}
                      >
                        {sendingEmailId === inv.id ? (
                          <>
                            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                              <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Email Client
                          </>
                        )}
                      </button>
                    )}

                    {inv.status === 'pending' && (
                      <a href={`https://wa.me/?text=${encodeURIComponent(`Hello! Just a reminder that your invoice for ${sym}${safeInvAmount.toLocaleString()} from ${user.business_name || "us"} is due. You can pay securely here: https://${window.location.host}/pay/${inv.id}`)}`} target="_blank" rel="noopener noreferrer" className="btn-primary btn-hover" style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "160px", textAlign: "center" }}>WhatsApp Alert</a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
          {filteredInvoices.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No invoices found matching your search.</div>}
        </div>
      )}
    </div>
  );
}
// =========================================================
// 9. PUBLIC INVOICE VIEW (ORIGINAL LAYOUT + PRO LOGIC)
// =========================================================
function PublicInvoice({ invoiceId, showToast, currentUser }) {
  usePaystack();
  const [invoice, setInvoice] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  // Review System State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const starsArray = Array.from({ length: 5 }, function(_, i) { return i + 1; });
  const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !invoiceId) { setDebugError("No valid payload found."); setLoading(false); return; }
      const { data: invData, error: invError } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
      if (invError) { setDebugError(`Msg: ${invError.message}`); setLoading(false); return; }

      if (invData) {
        setInvoice(invData);
        const { data: venData } = await supabase.from('vendors').select('*').eq('id', invData.vendor_id).single();
        const { data: cliData } = await supabase.from('clients').select('*').eq('id', invData.client_id).single();
        setVendor(venData); setClient(cliData);
      } else { setDebugError("Invoice row empty."); }
      loading === true && setLoading(false);
    }
    fetchData();
  }, [invoiceId]);

  const triggerPDFCompilation = () => {
    window.print();
  };

const handlePayment = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in the system.", "error");
    if (!window.PaystackPop) return showToast("Loading", "Payment engine is loading, please wait...", "info");
    
    const baseAmount = Number(invoice?.amount || 0);
    const invoiceCurrency = invoice?.currency || "NGN";
    
    if (baseAmount <= 0) return showToast("Invalid Amount", "Cannot process payment. The invoice amount must be greater than 0.", "error");

    try {
      let finalAmount = baseAmount;
      
      if (invoice?.fee_passed_on && invoiceCurrency === "NGN" && vendor?.paystack_subaccount_code) {
        if (baseAmount < 2500) {
          finalAmount = baseAmount / 0.985;
        } else {
          const calculatedWithFees = (baseAmount + 100) / 0.985;
          const totalFeeCharged = calculatedWithFees - baseAmount;
          
          if (totalFeeCharged > 2000) {
            finalAmount = baseAmount + 2000;
          } else {
            finalAmount = calculatedWithFees;
          }
        }
      }

      const safeAmountInKobo = Math.round(finalAmount * 100);

      // THE PAYLOAD OBJECT
      let paystackPayload = {
        key: PAYSTACK_PUBLIC_KEY,
        email: client?.email || "customer@kudislip.com",
        amount: safeAmountInKobo, 
        currency: invoiceCurrency,
        callback: function(response) {
          supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id).then(() => {
            setInvoice({ ...invoice, status: 'paid' });
            showToast("Payment Successful", "Your secure payment has been processed and your receipt is saved.", "success");
            
            // 🚀 TRIGGER THE MERCHANT EMAIL ALERT
            if (vendor?.email) {
              fetch('/api/send-payment-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  vendorEmail: vendor.email,
                  vendorName: vendor.business_name || "Merchant",
                  clientName: client?.name || "A client",
                  amount: Number(invoice.amount).toLocaleString(),
                  currency: CURRENCY_SYMBOLS[invoiceCurrency] || invoiceCurrency,
                  invoiceId: invoice.id
                })
              }).catch(e => console.error("Alert failed to send:", e));
            }
          });
        },
        onClose: function() { console.log("Payment window closed."); }
      }; // <--- THIS WAS THE MISSING BRACKET THAT CRASHED VERCEL!

      if (invoiceCurrency === "NGN" && vendor?.paystack_subaccount_code) {
        paystackPayload.subaccount = vendor.paystack_subaccount_code;
        paystackPayload.bearer = "subaccount";
      }

      const handler = window.PaystackPop.setup(paystackPayload);
      handler.openIframe();
    } catch(err) {
      showToast("Browser Blocked", "Your mobile browser blocked the popup. Please click again or disable shields.", "error");
    }
  };
  const submitReview = async () => {
    if (rating === 0) return showToast("Action Required", "Please select a star rating first.", "info");
    
    await supabase.from('reviews').insert([{
      invoice_id: invoice.id,
      merchant_name: vendor?.business_name || "Unknown Merchant",
      rating,
      comment: reviewComment
    }]);
    
    setReviewSubmitted(true);
    showToast("Feedback Sent", "Thank you! Your review helps us keep the platform safe.", "success");
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Loading Secure Invoice...</div>;
  if (debugError) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#FFF1F2" }}>
      <GlobalStyles/>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", marginBottom: "16px" }}><AlertIcon /><h2 style={{ margin: 0 }}>System Routing Error</h2></div>
      <p style={{background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #FECACA", maxWidth: "600px"}}>{debugError}</p>
      <a href="/" className="btn-primary btn-hover" style={{marginTop: "16px"}}>Go to Dashboard</a>
    </div>
  );
  if (!invoice) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Invoice not found.</div>;

  let safeItems = [];
  try { safeItems = Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items || "[]"); } catch(e) { safeItems = []; }
  const safeAmount = Number(invoice.amount || 0);
  const safeDate = new Date(invoice.due_date || Date.now()).toLocaleDateString();
  const isFreeTier = !vendor?.subscription_tier || vendor.subscription_tier === 'free';
  const customColor = vendor?.brand_color || DESIGN.primary;
  const thankYouMessage = isFreeTier ? "Thank you for your payment! KudiSlip cares 💙." : (vendor.custom_thank_you || `Thank you for your payment! ${vendor.business_name} cares.`);
  
  const invoiceCurrency = invoice.currency || "NGN";
  const currencySymbol = CURRENCY_SYMBOLS[invoiceCurrency] || "₦";

  const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ cursor: "pointer", color: filled ? "#F59E0B" : "#E2E8F0", transition: "color 0.2s" }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  return (
    <>
      <GlobalStyles />
      <style>{`
        .invoice-page-wrapper {
          min-height: 100vh;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start; 
          background: ${DESIGN.bg};
          position: relative;
        }
        .invoice-max-width {
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 10;
        }
        .print-card {
          background: ${DESIGN.surface};
          border-radius: 12px;
          border: 1px solid ${DESIGN.border};
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
          height: max-content; 
        }
        @media (max-width: 768px) {
          .invoice-page-wrapper { padding: 24px 16px; }
          .print-card { padding: 24px; }
        }
        
        /* 🖨️ THE FIX: Forces perfect margins on every computer */
        @media print {
          @page { margin: 0; } 
          body, html, .invoice-page-wrapper { 
            background: #FFFFFF !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            display: block !important; 
          }
          .no-print { display: none !important; }
          .invoice-max-width { 
            max-width: 100% !important; 
            gap: 0 !important; 
            display: block !important; 
          }
          .print-card { 
            border: none !important; 
            box-shadow: none !important; 
            padding: 15mm !important; 
            border-radius: 0 !important; 
          }
        }
      `}</style>

      <div className="invoice-page-wrapper">
        {/* 🎯 KUDISLIP WATERMARK: Removed "no-print" so it naturally renders on the generated PDF! */}
        {isFreeTier && <div style={{ position: "fixed", top: "-50%", left: "-50%", right: "-50%", bottom: "-50%", backgroundImage: 'url("/logo.png")', backgroundRepeat: "repeat", backgroundSize: "200px", opacity: 0.03, pointerEvents: "none", zIndex: 1, transform: "rotate(-15deg)" }} />}
        
        <div className="invoice-max-width">
          
          {/* Top Download Button */}
          <div className="no-print" style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={triggerPDFCompilation} className="btn-hover" style={{ background: "#FFFFFF", color: "#0F172A", border: `1px solid ${DESIGN.border}`, padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
                 <polyline points="8 12 12 16 16 12"></polyline>
                 <line x1="12" y1="2" x2="12" y2="16"></line>
              </svg>
              Download PDF
            </button>
          </div>
          
          {/* 🎯 TOP HEADER LOGO: Removed "no-print" so it prints on the PDF too */}
          {isFreeTier && (
            <div style={{ textAlign: "center", marginBottom: "-8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: DESIGN.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Powered By</div>
              <img src="/logo.png" alt="KudiSlip" style={{ height: "24px", transform: "scale(1.5)" }} />
            </div>
          )}

          <div className="print-card card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
              <div>
                <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Billed By</div>
                {vendor?.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.business_name} style={{ maxHeight: "40px", objectFit: "contain" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/logo.png" alt="KudiSlip Default" style={{ maxHeight: "24px", objectFit: "contain" }} />
                    <div style={{ fontSize: "18px", fontWeight: "900", color: DESIGN.textMain }}>{vendor?.business_name || "Verified Merchant"}</div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Status</div>
                <div style={{ display: "inline-block", background: invoice.status === 'pending' ? "#FEF3C7" : "#ECFDF5", color: invoice.status === 'pending' ? "#D97706" : "#10B981", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>{invoice.status || 'PENDING'}</div>
              </div>
            </div>
            
            <div style={{ borderTop: `1px solid ${DESIGN.border}`, borderBottom: `1px solid ${DESIGN.border}`, padding: "24px 0", marginBottom: "32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Billed To</div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: DESIGN.textMain, marginTop: "4px" }}>{client?.name || "Client"}</div>
                <div style={{ fontSize: "14px", color: DESIGN.textMuted, marginTop: "2px" }}>{client?.email || "No email"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Due Date</div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: DESIGN.textMain, marginTop: "4px" }}>{safeDate}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "800", color: DESIGN.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${DESIGN.border}` }}>
                <div style={{ flex: 1 }}>Description</div>
                <div style={{ width: "60px", textAlign: "center" }}>Qty</div>
                <div style={{ width: "120px", textAlign: "right" }}>Amount</div>
              </div>
              
              {safeItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px dashed #E2E8F0" }}>
                  <div style={{ flex: 1, fontWeight: "600", fontSize: "14px", color: DESIGN.textMain, wordBreak: "break-word", paddingRight: "16px" }}>{item.description}</div>
                  <div style={{ width: "60px", textAlign: "center", fontSize: "14px", color: DESIGN.textMuted, fontWeight: "600" }}>{item.quantity}</div>
                  <div style={{ width: "120px", textAlign: "right", fontWeight: "800", fontSize: "14px", color: DESIGN.textMain }}>{currencySymbol}{Number(item.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
            
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", border: `1px solid ${DESIGN.border}` }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: DESIGN.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>Total Amount</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: customColor, textAlign: "right", wordBreak: "break-word" }}>{currencySymbol}{safeAmount.toLocaleString()}</div>
            </div>
            
            <div className="no-print">
              {invoice.status === 'pending' ? (
                <button className="btn-hover" style={{ width: "100%", padding: "18px", background: customColor, color: "#FFF", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} onClick={handlePayment}>
                  Proceed to Secure Payment
                </button>
              ) : (
                <div style={{ textAlign: "center", padding: "20px", background: "#ECFDF5", borderRadius: "12px", border: "1px solid #A7F3D0" }}>
                  <div style={{ color: DESIGN.success, fontWeight: "900", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}><CheckIcon /> Payment Complete</div>
                  <div style={{ fontSize: "14px", color: DESIGN.textMain, fontWeight: "600" }}>{thankYouMessage}</div>
                </div>
              )}
              
              {currentUser?.id === vendor?.id && (
                <a href="/dashboard/invoices" className="btn-secondary btn-hover" style={{ width: "100%", boxSizing: "border-box", padding: "16px", marginTop: "16px", display: "block", textAlign: "center" }}>Return to Dashboard</a>
              )}
            </div>
          </div>

          {/* Review Component */}
          {invoice.status === 'paid' && currentUser?.id !== vendor?.id && !reviewSubmitted && (
            <div className="no-print card-hover" style={{ background: "#FFFFFF", borderRadius: "16px", border: `1px solid ${DESIGN.border}`, padding: "32px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "8px" }}>How was your experience?</h3>
              <p style={{ fontSize: "14px", color: DESIGN.textMuted, marginBottom: "24px" }}>Your feedback helps us keep KudiSlip safe and professional.</p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                {starsArray.map(star => (
                  <StarIcon 
                    key={star} 
                    filled={star <= (hoverRating || rating)} 
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              
              {rating > 0 && (
                <div style={{ animation: "toastSlideIn 0.3s ease forwards" }}>
                  <textarea className="form-input" placeholder="Leave a comment (optional)..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ width: "100%", minHeight: "80px", marginBottom: "16px", resize: "vertical" }} />
                  <button className="btn-primary btn-hover" style={{ width: "100%" }} onClick={submitReview}>Submit Feedback</button>
                </div>
              )}
            </div>
          )}

          {invoice.status === 'paid' && currentUser?.id !== vendor?.id && (
             <a href="/" className="btn-secondary btn-hover no-print" style={{ width: "100%", boxSizing: "border-box", padding: "16px", background: "#FFFFFF", textAlign: "center", borderRadius: "12px", display: "block" }}>Return to KudiSlip Home</a>
          )}

        </div>
      </div>
    </>
  );
}
// =========================================================
// 5. LANDING PAGE (CLEAN URLs)
// =========================================================
function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%", flex: 1 }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid #E2E8F0` }}>
          <div style={{ width: "180px", display: "flex", alignItems: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "40px", transform: "scale(2.5)", transformOrigin: "left center" }} /></div>
          <div className="nav-buttons-desktop">
            <a href="/login" className="btn-secondary btn-hover">Log In</a>
            <a href="/signup" className="btn-primary btn-hover">Get Started Free</a>
          </div>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        </nav>
        <div className={`mobile-nav-dropdown ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="/login" className="btn-secondary btn-hover" style={{ width: "100%", display: "block" }}>Log In</a>
          <a href="/signup" className="btn-primary btn-hover" style={{ width: "100%", display: "block" }}>Get Started Free</a>
        </div>
        
        <main className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center", padding: "80px 0 60px" }}>
          <div className="hero-text-container" style={{ paddingRight: "40px" }}>
            <div style={{ display: "inline-block", padding: "6px 16px", background: "#F1F5F9", border: `1px solid #E2E8F0`, borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#64748B", marginBottom: "24px" }}>The #1 CRM & Invoicing Tool</div>
            <h1 className="hero-title" style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 24px", color: "#0F172A", lineHeight: "1.1" }}>Manage Customers.<br />Automate Payments.</h1>
            <p style={{ fontSize: "18px", color: "#64748B", margin: "0 0 40px", lineHeight: "1.6" }}>KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements through automated Paystack routing.</p>
            <a href="/signup" className="btn-primary btn-hover" style={{ padding: "16px 36px", fontSize: "16px" }}>Create Your Account</a>
          </div>
          <div>
            <img src="/hero-image.jpg" alt="KudiSlip Merchants" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", objectFit: "cover", border: "1px solid #E2E8F0" }} />
          </div>
        </main>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", paddingBottom: "80px" }}>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=150&q=80" alt="Invoicing Terminals" style={{ height: "60px", width: "60px", objectFit: "cover", borderRadius: "12px", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Professional Invoicing</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Generate clean, branded invoices and receipts for your clients in seconds.</p>
          </div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <img src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&w=150&q=80" alt="Digital Payments" style={{ height: "60px", width: "60px", objectFit: "cover", borderRadius: "12px", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Instant Settlements</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Link your Nigerian bank account and receive payments directly via Paystack.</p>
          </div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
            <img src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=150&q=80" alt="Market CRM" style={{ height: "60px", width: "60px", objectFit: "cover", borderRadius: "12px", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Customer CRM</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Track client history, outstanding payments, and contact details seamlessly.</p>
          </div>
        </div>

        <div style={{ background: "#F1F5F9", padding: "80px 24px", margin: "0 -24px", textAlign: "center", borderRadius: "24px", marginBottom: "80px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "40px" }}>Why Nigerian Businesses Choose KudiSlip</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px", maxWidth: "1000px", margin: "0 auto" }}>
            <div className="card-hover" style={{ textAlign: "left", background: "#FFF", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
               <div style={{ color: DESIGN.premium, marginBottom: "12px" }}><MapPinIcon /></div>
               <h4 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Built for the Local Market</h4>
               <p style={{ color: DESIGN.textMuted, lineHeight: "1.6", margin: 0, fontSize: "14px" }}>We understand the landscape. Receive instant Naira settlements directly to any of your local bank accounts via our secure Paystack integration.</p>
            </div>
            <div className="card-hover" style={{ textAlign: "left", background: "#FFF", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
               <div style={{ color: DESIGN.success, marginBottom: "12px" }}><TagIcon /></div>
               <h4 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Zero Hidden Fees</h4>
               <p style={{ color: DESIGN.textMuted, lineHeight: "1.6", margin: 0, fontSize: "14px" }}>Start for free. No setup fees, no monthly minimums. We only make money when you voluntarily upgrade to Premium for custom branding.</p>
            </div>
            <div className="card-hover" style={{ textAlign: "left", background: "#FFF", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
               <div style={{ color: DESIGN.textMain, marginBottom: "12px" }}><ShieldIcon /></div>
               <h4 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Bank-Grade Security</h4>
               <p style={{ color: DESIGN.textMuted, lineHeight: "1.6", margin: 0, fontSize: "14px" }}>Your data and your customers' money are protected by enterprise-level encryption. We never touch raw credit card numbers.</p>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ background: "#EFF6FF", color: "#3B82F6", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Platform Updates</span>
            <h2 style={{ fontSize: "36px", fontWeight: "900", marginTop: "16px", marginBottom: "12px" }}>Powerful new tools to scale your business.</h2>
            <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>Everything you need to manage your money, from automated reminders to cross-border payments.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#3B82F6" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Global Multi-Currency</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Bill clients across borders. Switch seamlessly between Naira (₦), US Dollars ($), and British Pounds (£) via Paystack.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: DESIGN.success }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Net Profit Tracker</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Stop guessing your income. Log your daily business expenses directly in the app to see your actual net profit in real-time.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: DESIGN.premium }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Automated Reminders</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Let our background engine chase your money. Automated midnight email drops and 1-click WhatsApp reminders for pending invoices.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#F59E0B" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 22 7 12 2"></polygon><polyline points="2 17 2 22 22 22 22 17"></polyline><line x1="6" y1="12" x2="6" y2="17"></line><line x1="10" y1="12" x2="10" y2="17"></line><line x1="14" y1="12" x2="14" y2="17"></line><line x1="18" y1="12" x2="18" y2="17"></line></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Built-In Tax Engine</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Stay compliant effortlessly. Apply the standard 7.5% government VAT to any invoice total with a single click.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: DESIGN.textMain }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Manual Transfer Logs</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Client paid in cash or via direct bank transfer? Bypass the payment gateway and mark invoices as paid manually to keep your CRM accurate.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#EAB308" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Premium Branding</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Upgrade to Pro to remove watermarks, upload your custom business logo, and tailor custom thank-you messages for your clients.</p>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: "100px", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "40px" }}>Meet The Team</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
            <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 16, padding: "32px", width: "260px" }}>
              <img src="/founder.jpg" alt="Tobiloba Abass" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" }} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: `4px solid ${DESIGN.bg}` }} />
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "4px" }}>Tobiloba Abass</h3>
              <p style={{ color: DESIGN.premium, fontSize: "14px", fontWeight: "700", margin: 0 }}>Founder & CEO</p>
            </div>
            <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 16, padding: "32px", width: "260px" }}>
              <img src="/marvelous.jpg" alt="Marvelous Fawole" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80" }} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: `4px solid ${DESIGN.bg}` }} />
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "4px" }}>Marvelous Fawole</h3>
              <p style={{ color: DESIGN.success, fontSize: "14px", fontWeight: "700", margin: 0 }}>Product Manager</p>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "12px" }}>Simple, transparent pricing.</h2>
            <p style={{ color: "#64748B", fontSize: "16px" }}>Start for free, upgrade when you need to remove our branding.</p>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ background: DESIGN.card, border: `1px solid ${DESIGN.border}`, borderRadius: 12, padding: "40px", flex: "1", minWidth: "300px", maxWidth: "400px" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>Free Tier</div>
              <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "24px" }}>₦0<span style={{fontSize: "16px", color: DESIGN.textMuted}}>/mo</span></div>
              <ul style={{ paddingLeft: "20px", color: DESIGN.textMuted, fontSize: "15px", lineHeight: "1.8", marginBottom: "32px" }}>
                <li>Unlimited Invoices & Clients</li>
                <li>Instant Bank Settlements</li>
                <li><strong style={{color: DESIGN.textMain}}>Includes KudiSlip Watermark</strong></li>
              </ul>
              <a href="/signup" className="btn-secondary btn-hover" style={{ width: "100%", display: "block" }}>Get Started Free</a>
            </div>
            <div style={{ background: DESIGN.card, border: `2px solid ${DESIGN.premium}`, borderRadius: 12, padding: "40px", flex: "1", minWidth: "300px", maxWidth: "400px", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.15)" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", color: DESIGN.premium }}>Premium Pro</div>
              <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "24px" }}>₦15,000<span style={{fontSize: "16px", color: DESIGN.textMuted}}>/mo</span></div>
              <ul style={{ paddingLeft: "20px", color: DESIGN.textMuted, fontSize: "15px", lineHeight: "1.8", marginBottom: "32px" }}>
                <li>Everything in Free</li>
                <li><strong style={{color: DESIGN.textMain}}>Remove KudiSlip Watermark</strong></li>
                <li>Fully Independent Branding</li>
              </ul>
              <a href="/signup" className="btn-primary btn-premium btn-hover" style={{ width: "100%", display: "block" }}>Upgrade to Premium</a>
            </div>
          </div>
        </div>
      </div>
      
      <footer style={{ borderTop: `1px solid ${DESIGN.border}`, padding: "40px 24px", textAlign: "center", color: DESIGN.textMuted, fontSize: "14px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>© 2026 KudiSlip Technologies. All rights reserved.</div>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="/terms" style={{ textDecoration: "none", color: DESIGN.textMuted }} className="btn-hover">Terms & Conditions</a>
            <a href="/privacy" style={{ textDecoration: "none", color: DESIGN.textMuted }} className="btn-hover">Privacy Policy</a>
            <a href="mailto:support@kudislip.com" style={{ textDecoration: "none", color: DESIGN.textMuted }} className="btn-hover">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
// =========================================================
// 6. AUTHENTICATION (CLEAN URLs)
// =========================================================
function KudiSlipAuth({ onLoginSuccess, initialIsSignUp, showToast }) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const handleAuth = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (isSignUp) {
        if (!agreedToTerms) throw new Error("You must agree to the Terms and Privacy Policy to continue.");
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (authData.user) {
          const { error: dbError } = await supabase.from('vendors').insert([{ id: authData.user.id, business_name: businessName, email: email }]);
          if (dbError) throw dbError;
          
          // 🚀 LOUD ERROR TRACKER: Forces the screen to show us exactly what Resend/Vercel is thinking
          try {
            const mailRes = await fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userEmail: email,
                businessName: businessName
              })
            });
            
            // Try to read the exact error message from the backend
            const mailData = await mailRes.json().catch(() => ({ error: "Failed to read server response." }));
            
            if (!mailRes.ok) {
              // This will pop up a red box telling us EXACTLY what broke!
              showToast("Mail Server Crash", mailData.error || JSON.stringify(mailData), "error");
            } else {
              showToast("Mail Delivered!", "Check your inbox immediately.", "success");
            }
          } catch (mailErr) {
            showToast("Network Drop", "The frontend couldn't find the /api/ folder. Check vercel.json.", "error");
          }
        }
        showToast("Account Created", "Your setup is complete! Please log in to continue.", "success");
        setIsSignUp(false);
        setLoading(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const { data: vendorData } = await supabase.from('vendors').select('*').eq('id', data.user.id).single();
        onLoginSuccess({ ...data.user, ...vendorData });
        window.location.href = "/dashboard/invoices";
      }
    } catch (err) { 
      setError(err.message); 
      showToast("Authentication Error", err.message, "error"); 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#F8FAFC", gap: "24px", width: "100vw", position: "fixed", top: 0, left: 0, zIndex: 99999 }}>
      <img src="/logo.png" alt="KudiSlip Logo" className="bouncing-logo" style={{ height: "40px", transformOrigin: "center center" }} />
      <div className="pulsing-text" style={{ marginTop: "8px" }}>Authenticating...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <GlobalStyles />
      <a href="/" style={{ textDecoration: "none", position: "absolute", top: "24px", left: "24px", color: "#64748B", fontWeight: "600", fontSize: "14px", padding: "8px" }} className="btn-hover">&larr; Back to Home</a>
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} /></div>
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>{isSignUp ? "Create your account" : "Welcome back"}</h2>
        <form onSubmit={handleAuth}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          {isSignUp && <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Business Name</label><input className="form-input" placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required /></div>}
          <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Email Address</label><input className="form-input" type="email" placeholder="merchant@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          
          <div style={{ marginBottom: isSignUp ? "16px" : "28px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input className="form-input" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: "48px" }} required />
              <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748B" }}>
                {showPassword ? ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> )}
              </div>
            </div>
          </div>

          {isSignUp && (
            <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ cursor: "pointer", marginTop: "2px" }} required />
              <label htmlFor="terms" style={{ fontSize: "12px", color: DESIGN.textMuted, lineHeight: "1.5" }}>
                I agree to the <a href="/terms" style={{ color: DESIGN.primary, fontWeight: "800", textDecoration: "none" }} target="_blank">Terms & Conditions</a> and <a href="/privacy" style={{ color: DESIGN.primary, fontWeight: "800", textDecoration: "none" }} target="_blank">Privacy Policy</a>.
              </label>
            </div>
          )}
          <button className="btn-primary btn-hover" style={{ width: "100%" }} type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
        </form>
        <div style={{ textAlign: "center", marginTop: "24px", color: "#64748B", fontSize: "14px" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span style={{ color: "#000000", fontWeight: "800", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>{isSignUp ? "Log In" : "Sign Up"}</span>
        </div>
      </div>
    </div>
  );
}
// =========================================================
// 7. CLIENTS CRM (FRICTIONLESS UPGRADE)
// =========================================================
function ClientsManager({ user, showToast }) {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('clients').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setClients(data || []));
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

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Client CRM.</div>;

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Client Directory</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your customer database.</div>
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
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "500px" }}>
            <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
              <tr><th style={{ padding: "16px 24px" }}>Name</th><th style={{ padding: "16px 24px" }}>Email</th><th style={{ padding: "16px 24px" }}>Phone</th></tr>
            </thead>
            <tbody>
              {clients.map(c => <tr key={c.id} style={{ borderTop: `1px solid #E2E8F0` }}><td style={{ padding: "16px 24px", fontWeight: "600" }}>{c.name}</td><td style={{ padding: "16px 24px", color: "#64748B" }}>{c.email || "—"}</td><td style={{ padding: "16px 24px", color: "#64748B" }}>{c.phone || "—"}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =========================================================
// 7.5. NATIVE REVENUE CHART COMPONENT
// =========================================================
function RevenueChart({ invoices }) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ label: d.toLocaleString('default', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), total: 0 });
  }

  invoices.forEach(inv => {
    if (inv.status === 'paid') {
      const date = new Date(inv.created_at);
      const match = months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
      if (match) match.total += Number(inv.amount || 0);
    }
  });

  const maxTotal = Math.max(...months.map(m => m.total), 1); 

  return (
    <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", marginBottom: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "900", marginBottom: "32px", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.05em" }}>6-Month Revenue Trend</h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px", paddingBottom: "12px", borderBottom: "1px dashed #E2E8F0" }}>
        {months.map((m, i) => {
          const heightPct = (m.total / maxTotal) * 100;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "8px", height: "100%" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#10B981", opacity: m.total > 0 ? 1 : 0 }}>
                {m.total > 1000 ? `₦${(m.total/1000).toFixed(1)}k` : `₦${m.total}`}
              </div>
              <div style={{ width: "100%", maxWidth: "48px", background: m.total > 0 ? "#10B981" : "#F1F5F9", height: `${Math.max(heightPct, 4)}%`, borderRadius: "6px 6px 0 0", transition: "height 0.8s ease" }}></div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "16px", paddingTop: "16px" }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "12px", fontWeight: "800", color: "#64748B" }}>{m.label}</div>
        ))}
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

      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "40px" }}>
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
          <button className="btn-primary btn-hover" type="submit" disabled={saving || user?.subscription_tier !== 'premium'}>{saving ? "Saving..." : "Add to Ledger"}</button>
        </form>
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
// 10. PAYOUT SETTINGS (PREMIUM ENTERPRISE UI)
// =========================================================
function PayoutSettings({ user, showToast }) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Controls hiding/showing the form

  // Auto-fill the form if the user already has a bank linked
  useEffect(() => {
    if (user?.bank_code) setBankCode(user.bank_code);
    if (user?.account_number) setAccountNumber(user.account_number);
  }, [user]);

  // Official Paystack Bank Codes for Nigeria
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

  const handleLinkBank = async (e) => {
    e.preventDefault();
    if (accountNumber.length !== 10) {
      showToast("Invalid Account", "Please enter a valid 10-digit account number.", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Send details to your secure backend to talk to Paystack
      const response = await fetch('/api/create-subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: bankCode,
          business_name: user.business_name || "KudiSlip Vendor",
          vendor_id: user.id,
          percentage_charge: 0 // 🎯 FORCE PLATFORM FEE TO 0% FOR 100% VENDOR SPLIT
        })
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
         throw new Error("Backend API route not found. We need to create the Vercel API function!");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Paystack rejected this account number.");
      }

      const subaccountCode = data.subaccount_code;

      // 2. Save to Supabase
      const { error: dbError } = await supabase
        .from('vendors')
        .update({ 
          bank_code: bankCode, 
          account_number: accountNumber,
          paystack_subaccount_code: subaccountCode 
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      showToast("Bank Verified!", "Paystack securely confirmed your account. Refreshing...", "success");
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      showToast("Verification Failed", err.message, "error");
      console.error("PAYSTACK VERIFICATION ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe checks for the Read-Only View
  const hasLinkedBank = user?.bank_code && user?.account_number;
  const linkedBankName = NIGERIAN_BANKS.find(b => b.code === user?.bank_code)?.name || "Your Linked Bank";
  const maskedAccount = user?.account_number ? `•••• •••• ${user.account_number.slice(-4)}` : "";

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Payout Settings</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your automated settlement destination.</div>
      
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
        
        {hasLinkedBank && !isEditing ? (
          
          /* =========================================
             THE LOCKED SUCCESS VIEW (PREMIUM UI)
             ========================================= */
          <div style={{ padding: "10px 0" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              <div style={{ width: "48px", height: "48px", background: "#000000", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)" }}>
                <ShieldIcon />
              </div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 4px 0", color: "#0F172A" }}>Settlement Route Active</h3>
                <div style={{ color: DESIGN.success, fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   Verified by Paystack
                </div>
              </div>
            </div>
            
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "32px" }}>
              Your automated payout destination is securely linked. All paid invoices will be routed directly to this verified bank account.
            </p>

            {/* Dark Mode Bank Card */}
            <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "28px", borderRadius: "16px", marginBottom: "32px", position: "relative", overflow: "hidden", color: "#FFF", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
              {/* Abstract decorative circles for premium feel */}
              <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }}></div>
              <div style={{ position: "absolute", bottom: "-40px", left: "-20px", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }}></div>
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Bank Name</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#FFFFFF", marginBottom: "24px" }}>{linkedBankName}</div>
                
                <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Account Number</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#FFFFFF", letterSpacing: "4px", fontFamily: "monospace" }}>{maskedAccount}</div>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(true)} 
              style={{ background: "transparent", border: "2px solid #E2E8F0", padding: "14px 24px", borderRadius: "8px", color: "#0F172A", fontWeight: "800", cursor: "pointer", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px" }} 
              className="btn-hover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Update Bank Details
            </button>
          </div>

        ) : (

          /* =========================================
             THE EDIT / SETUP FORM VIEW
             ========================================= */
          <form onSubmit={handleLinkBank} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Bank Name</label>
              <select className="form-input" value={bankCode} onChange={e => setBankCode(e.target.value)} required style={{ width: "100%", margin: 0, padding: "14px", cursor: "pointer" }}>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b.name} value={b.code} disabled={b.code === ""}>{b.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Account Number</label>
              <input 
                type="number"
                className="form-input" 
                value={accountNumber} 
                onChange={e => setAccountNumber(e.target.value)} 
                required 
                placeholder="e.g. 0123456789" 
                style={{ width: "100%", margin: 0, padding: "14px", boxSizing: "border-box" }} 
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button 
                className="btn-primary btn-hover" 
                type="submit" 
                disabled={loading || !bankCode || accountNumber.length !== 10} 
                style={{ 
                  padding: "16px", 
                  opacity: (!bankCode || accountNumber.length !== 10) ? 0.5 : 1,
                  flex: 1
                }}
              >
                {loading ? "Verifying with Paystack..." : "Securely Link Bank"}
              </button>
              
              {/* Show a Cancel button if they already have an account and change their mind */}
              {hasLinkedBank && (
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setBankCode(user.bank_code);
                    setAccountNumber(user.account_number);
                  }} 
                  className="btn-hover"
                  style={{ padding: "16px 24px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}
                >
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
// DRAGGABLE SUPPORT BUTTON COMPONENT (CLEAN URLs)
// =========================================================
function DraggableSupportButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleStart = (clientX, clientY) => { setIsDragging(true); hasMoved.current = false; dragStart.current = { x: clientX - pos.x, y: clientY - pos.y }; };
  const handleMove = (clientX, clientY) => { if (!isDragging) return; hasMoved.current = true; setPos({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y }); };
  const handleEnd = () => setIsDragging(false);

  return (
    <a
      href="/dashboard/support"
      onClick={(e) => { if (hasMoved.current) e.preventDefault(); }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches.clientX, e.touches.clientY)}
      onTouchMove={(e) => isDragging && handleMove(e.touches.clientX, e.touches.clientY)}
      onTouchEnd={handleEnd}
      className="btn-primary btn-hover"
      style={{ position: "fixed", bottom: "24px", right: "24px", transform: `translate(${pos.x}px, ${pos.y}px)`, borderRadius: "50px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "8px", zIndex: 9999, boxShadow: isDragging ? "0 15px 35px -5px rgba(0,0,0,0.4)" : "0 10px 25px -5px rgba(0,0,0,0.3)", textDecoration: "none", touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
    >
      <MessageIcon /> <span className="support-text-mobile">Support</span>
    </a>
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

  // 1. STATE NOW TRACKS CLEAN URL PATHS
  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/");

  // A helper function to safely navigate without full page reloads
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => { const splashTimer = setTimeout(() => setShowSplash(false), 3000); return () => clearTimeout(splashTimer); }, []);

  // 2. MAGIC ROUTER: INTERCEPTS CLICKS GLOBALLY - FIXED!
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    
    const handleGlobalClick = (e) => {
      // Find the closest anchor tag that was clicked
      const link = e.target.closest('a');
      
      // If it's a link, and it starts with a slash (internal link), intercept it
      if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
        // Do NOT intercept external links or links meant to open in a new tab
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

    if (currentPath === "/terms") return <LegalPage type="terms" />;
    if (currentPath === "/privacy") return <LegalPage type="privacy" />;

    if (!user) {
      if (currentPath === "/login") return <KudiSlipAuth initialIsSignUp={false} showToast={showToast} onLoginSuccess={(u) => { setUser(u); navigateTo("/dashboard/invoices"); }} />;
      if (currentPath === "/signup") return <KudiSlipAuth initialIsSignUp={true} showToast={showToast} onLoginSuccess={(u) => { setUser(u); navigateTo("/dashboard/invoices"); }} />;
      return <LandingPage />;
    }

    const activeTab = currentPath.replace('/dashboard/', '');

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
            <button style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: DESIGN.textMain }} onClick={() => setSidebarOpen(true)}>☰</button>
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
                <a href="/dashboard/brand" className={`menu-btn ${activeTab === "brand" ? "active" : ""}`}>Brand Settings</a>
                <a href="/dashboard/billing" className={`menu-btn ${activeTab === "billing" ? "active" : ""}`}>Billing & Plan</a>
              </>
            )}
            <a href="/dashboard/support" className={`menu-btn ${activeTab === "support" ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               {user.role === 'vendor' ? 'Helpdesk & Ticket' : 'Support Inbox'}
            </a>

            {user?.role === 'admin' && (
              <a href="/dashboard/admin" className={`menu-btn ${activeTab === "admin" ? "active" : ""}`} style={{ color: DESIGN.premium, borderTop: "1px dashed #E2E8F0", marginTop: "12px", paddingTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
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
            <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {user?.business_name || user?.email}
            </div>
            <button className="btn-primary btn-hover" style={{ width: "100%", padding: "12px", background: "#FEF2F2", color: DESIGN.error }} onClick={() => supabase.auth.signOut().then(() => { setUser(null); navigateTo("/"); })}>Log Out</button>
          </div>
        </div>

        {/* MAIN VIEW CONTROLLER PANEL */}
        <div className="main-content" onClick={() => { if(activeNotifMenu) setActiveNotifMenu(null) }}>
          {activeTab === "invoices" && <KudiSlipInvoiceEngine user={user} showToast={showToast} />}
          {activeTab === "expenses" && <ExpensesManager user={user} showToast={showToast} />} 
          {activeTab === "clients" && <ClientsManager user={user} showToast={showToast} />}
          {activeTab === "payouts" && <PayoutSettings user={user} onSubaccountLinked={(code) => setUser({ ...user, paystack_subaccount_code: code })} showToast={showToast} />}
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
      
      {user && user.role === 'vendor' && currentPath !== "/dashboard/support" && !currentPath.startsWith("/pay/") && (
        <DraggableSupportButton />
      )}
    </>
  );
}

export default AppRouter;

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
  primary: "#000000", textMain: "#0F172A", textMuted: "#64748B", error: "#EF4444", success: "#10B981", premium: "#8B5CF6"
};

// --- SVG ICONS ---
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);
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
    body { margin: 0; padding: 0; background: #F8FAFC; color: #0F172A; font-family: system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    
    .btn-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .btn-hover:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
    .btn-hover:active:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

    .btn-primary { padding: 14px 28px; background: #000000; color: #FFFFFF; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
    .btn-premium { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; border: none; }
    .btn-secondary { padding: 12px 24px; background: transparent; color: #000000; border: 2px solid #000000; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
    
    .form-input { width: 100%; padding: 14px 16px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; color: #0F172A; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s ease; }
    .form-input:focus { border-color: #000000; }
    
    .menu-btn { display: block; width: 100%; padding: 16px 32px; background: transparent; border: none; border-left: 4px solid transparent; color: #64748B; text-align: left; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.15s ease; }
    .menu-btn:hover { background: #F8FAFC; color: #000000; }
    .menu-btn.active { background: #F1F5F9; border-left: 4px solid #000000; color: #000000; font-weight: 700; }
    
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08); }
    
    .dashboard-layout { display: flex; min-height: 100vh; flex-direction: row; position: relative; }
    .sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; padding: 32px 0; flex-shrink: 0; z-index: 1000; transition: transform 0.3s ease; }
    .sidebar-header { padding: 0 32px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; }
    .sidebar-menu { display: flex; flex-direction: column; width: 100%; }
    .sidebar-footer { padding: 16px 32px; margin-top: auto; }
    
    .mobile-top-bar { display: none; background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 16px 24px; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 990; }
    .main-content { flex: 1; padding: 48px; box-sizing: border-box; overflow-y: auto; height: 100vh; }
    .metric-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
    
    .chat-container { display: flex; flex-direction: column; height: 500px; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFF; }
    .chat-messages { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; background: #F8FAFC; }
    .chat-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
    .chat-bubble.admin { background: #E2E8F0; color: #0F172A; align-self: flex-start; border-bottom-left-radius: 4px; }
    .chat-bubble.user { background: #000000; color: #FFFFFF; align-self: flex-end; border-bottom-right-radius: 4px; }
    .chat-input-area { padding: 16px; background: #FFF; border-top: 1px solid #E2E8F0; display: flex; gap: 12px; }

    @keyframes toastSlideIn { 0% { transform: translate(-50%, -100%); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
    .toast-container { animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    /* SYSTEM PRINT INSTRUCTIONS - Forces iOS/Safari to print the <img> element */
    @media print {
      body { background: #FFFFFF !important; color: #000000 !important; }
      .no-print { display: none !important; }
      .print-container { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    
    @media (max-width: 768px) {
      .hero-grid { grid-template-columns: 1fr !important; text-align: center !important; }
      .hero-text-container { padding-right: 0 !important; }
      .hero-title { font-size: 38px !important; }
      .nav-buttons { display: none !important; }
      .dashboard-layout { flex-direction: column; }
      
      /* Mobile Hamburger Menu Overrides */
      .mobile-top-bar { display: flex !important; }
      .sidebar { position: fixed; top: 0; bottom: 0; left: 0; height: 100vh; transform: translateX(-100%); padding-top: 24px; }
      .sidebar.open { transform: translateX(0); }
      .sidebar-header { display: none !important; } /* Hidden inside sidebar, handled by top-bar */
      .main-content { padding: 24px 16px; }
    }
  `}</style>
);

const usePaystack = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);
};

// =========================================================
// CUSTOM UI TOAST NOTIFICATION
// =========================================================
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
// LEGAL PAGES (T&C and Privacy)
// =========================================================
function LegalPage({ type }) {
  const isTerms = type === "terms";
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
      <GlobalStyles />
      <nav style={{ padding: "24px", borderBottom: `1px solid ${DESIGN.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#/" style={{ textDecoration: "none", color: DESIGN.textMuted, fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }} className="btn-hover">
          &larr; Back Home
        </a>
        <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "24px", transform: "scale(1.5)" }} />
      </nav>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px", color: DESIGN.textMain, lineHeight: "1.8", flex: 1 }}>
        <h1 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          {isTerms ? "Terms & Conditions" : "Privacy Policy"}
        </h1>
        <p style={{ color: DESIGN.textMuted, marginBottom: "40px", fontSize: "14px", fontWeight: "600" }}>Last updated: May 24, 2026</p>
        
        {isTerms ? (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>By accessing KudiSlip, you agree to these foundational terms. We provide an invoicing and CRM software to help merchants automate their financial workflows securely.</p>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>2. Merchant Responsibilities</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>Merchants must use KudiSlip for lawful transactions only. Any attempt to process fraudulent invoices, manipulate the routing architecture, or breach the API will result in immediate termination.</p>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>3. Subscriptions & Fees</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>KudiSlip operates a transparent pricing model. Free tier users are subject to KudiSlip watermarks. Pro subscriptions are billed monthly. Transaction processing fees are governed directly by our partner, Paystack.</p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>1. Information We Collect</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>We collect business identities, contact emails, and basic CRM data to facilitate your invoicing process. We never sell your personal or client data to third parties.</p>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>2. Payment Security</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>All transactions are processed securely via Paystack. KudiSlip never sees, processes, or stores your clients' raw credit card data or banking PINs.</p>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>3. Data Retention</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>Your invoice history and client lists are securely stored on cloud infrastructure. You may request a total deletion of your vendor account and associated records at any time by contacting support.</p>
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
// 1. PUBLIC INVOICE VIEW
// =========================================================
function PublicInvoice({ invoiceId, showToast, currentUser }) {
  usePaystack();
  const [invoice, setInvoice] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

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
      setLoading(false);
    }
    fetchData();
  }, [invoiceId]);

  const triggerPDFCompilation = () => window.print();

  const handlePayment = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in the system.", "error");
    if (!vendor?.paystack_subaccount_code) return showToast("Action Required", "This merchant has not linked a settlement bank account yet.", "error");
    if (!window.PaystackPop) return showToast("Loading", "Payment engine is loading, please wait...", "info");
    
    const safeAmount = Number(invoice?.amount || 0);
    if (safeAmount <= 0) return showToast("Invalid Amount", "Cannot process payment. The invoice amount must be greater than ₦0.", "error");

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: client?.email || "customer@kudislip.com",
        amount: safeAmount * 100,
        currency: "NGN",
        subaccount: vendor.paystack_subaccount_code,
        callback: function(response) {
          supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id).then(() => {
            setInvoice({ ...invoice, status: 'paid' });
            showToast("Payment Successful", "Your secure payment has been processed and your receipt is saved.", "success");
          });
        },
        onClose: function() {
          console.log("Payment window closed.");
        }
      });
      handler.openIframe();
    } catch(err) {
      showToast("Browser Blocked", "Your mobile browser blocked the popup. Please click again or disable shields.", "error");
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Loading Secure Invoice...</div>;
  if (debugError) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#FFF1F2" }}>
      <GlobalStyles/>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", marginBottom: "16px" }}><AlertIcon /><h2 style={{ margin: 0 }}>System Routing Error</h2></div>
      <p style={{background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #FECACA", maxWidth: "600px"}}>{debugError}</p>
      <a href="#/" className="btn-primary btn-hover" style={{marginTop: "16px"}}>Go to Dashboard</a>
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

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", background: DESIGN.bg, position: "relative", overflow: "hidden" }}>
      <GlobalStyles />
      
      {/* PHYSICAL IMAGE WATERMARK FOR iOS PRINTING */}
      {isFreeTier && (
        <img 
          src="/logo.png" 
          alt="" 
          style={{ position: "fixed", top: "50%", left: "50%", width: "400px", transform: "translate(-50%, -50%) rotate(-15deg)", opacity: 0.05, zIndex: 0, pointerEvents: "none" }} 
        />
      )}

      {/* Main Content Wrapper */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        <div className="no-print" style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={triggerPDFCompilation} className="btn-hover" style={{ background: "#FFFFFF", color: "#0F172A", border: `1px solid ${DESIGN.border}`, padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <DownloadIcon /> Download PDF
          </button>
        </div>

        {isFreeTier && (
          <div className="no-print" style={{ textAlign: "center", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: DESIGN.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Powered By</div>
            <img src="/logo.png" alt="KudiSlip" style={{ height: "24px", transform: "scale(1.5)" }} />
          </div>
        )}
        
        <div className="print-container card-hover" style={{ background: DESIGN.surface, borderRadius: "16px", border: `1px solid ${DESIGN.border}`, padding: "40px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Billed By</div>
              
              {/* LOGO FALLBACK SYSTEM */}
              {vendor?.logo_url ? (
                <>
                  <img src={vendor.logo_url} alt={vendor.business_name} style={{ maxHeight: "40px", marginTop: "8px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; document.getElementById('biz-name-fallback').style.display = 'block'; }} />
                  <div id="biz-name-fallback" style={{ fontSize: "20px", fontWeight: "900", color: DESIGN.textMain, display: "none" }}>{vendor.business_name}</div>
                </>
              ) : (
                <div style={{ fontSize: "20px", fontWeight: "900", color: DESIGN.textMain }}>{vendor?.business_name || "Verified Merchant"}</div>
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
              <div style={{ fontWeight: "700" }}>{client?.name || "Client"}</div>
              <div style={{ fontSize: "14px", color: DESIGN.textMuted }}>{client?.email || "No email"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Due Date</div>
              <div style={{ fontWeight: "700" }}>{safeDate}</div>
            </div>
          </div>
          
          <div style={{ marginBottom: "40px" }}>
            {safeItems.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", gap: "16px", marginBottom: "12px", fontSize: "14px", fontWeight: "500" }}>
                <span>{item.description}</span><span style={{textAlign: "center", color: DESIGN.textMuted}}>{item.quantity}</span><span style={{textAlign: "right"}}>₦{Number(item.price || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: DESIGN.textMuted }}>Total Amount</div>
            <div style={{ fontSize: "28px", fontWeight: "900", color: customColor }}>₦{safeAmount.toLocaleString()}</div>
          </div>
          
          <div className="no-print">
            {invoice.status === 'pending' ? (
              <button className="btn-hover" style={{ width: "100%", padding: "18px", background: customColor, color: "#FFF", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }} onClick={handlePayment}>
                Proceed to Payment
              </button>
            ) : (
              <div style={{ textAlign: "center", padding: "24px", background: "#ECFDF5", borderRadius: "12px", border: "1px solid #A7F3D0" }}>
                <div style={{ color: DESIGN.success, fontWeight: "800", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                  <CheckIcon /> Payment Successful
                </div>
                <div style={{ fontSize: "14px", color: DESIGN.textMain, fontWeight: "600" }}>
                  {thankYouMessage}
                </div>
              </div>
            )}

            {/* Smart Redirect for the Vendor checking their own invoice */}
            {currentUser?.id === vendor?.id && (
              <a href="#/dashboard/invoices" className="btn-secondary btn-hover" style={{ width: "100%", boxSizing: "border-box", padding: "16px", marginTop: "16px", display: "block" }}>Return to Dashboard</a>
            )}
          </div>
        </div>
      </div>
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

  // Auto Color Extractor
  const handleExtractColor = () => {
    if (!logoUrl) return showToast("No Image", "Please paste a logo URL first.", "info");
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Try to bypass basic CORS
    img.src = logoUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // Get center pixel color
        const data = ctx.getImageData(img.width/2, img.height/2, 1, 1).data;
        const hex = "#" + ((1 << 24) + (data << 16) + (data << 8) + data).toString(16).slice(1);
        setBrandColor(hex);
        showToast("Color Extracted", `Found color: ${hex}`, "success");
      } catch (err) {
        showToast("Extraction Failed", "This image host blocks color extraction. Please select a color manually.", "error");
      }
    };
    img.onerror = () => showToast("Image Error", "Could not load image to extract color.", "error");
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
          <a href="#/dashboard/billing" className="btn-primary btn-premium btn-hover">Upgrade to Premium</a>
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
            <label style={{ fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700" }}>Company Logo URL</label>
            <input className="form-input" placeholder="https://example.com/my-logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            <div style={{ fontSize: "12px", color: DESIGN.textMuted, marginTop: "8px" }}>Provide a direct link to your transparent PNG logo.</div>
          </div>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700" }}>Brand Color (Hex Code)</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width: "50px", height: "40px", border: "none", cursor: "pointer", background: "none" }} />
              <input className="form-input" placeholder="#000000" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ flex: 1 }} />
              <button type="button" onClick={handleExtractColor} className="btn-secondary btn-hover" style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>Auto Extract</button>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700" }}>Custom Thank You Message</label>
            <textarea className="form-input" placeholder="e.g. Thank you for shopping with Acme Corp! We appreciate your business." value={customThankYou} onChange={e => setCustomThankYou(e.target.value)} style={{ minHeight: "80px", resize: "vertical" }} />
            <div style={{ fontSize: "12px", color: DESIGN.textMuted, marginTop: "8px" }}>This shows up on the receipt after a client pays.</div>
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
  usePaystack();
  const [isProcessing, setIsProcessing] = useState(false);
  const isPremium = user?.subscription_tier === 'premium';

  const handleUpgrade = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in Vercel.", "error");
    if (!window.PaystackPop) return showToast("Browser Blocked", "Your browser is blocking the secure payment window. Please disable adblockers.", "error");

    setIsProcessing(true);
    
    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user?.email || "vendor@kudislip.com",
        amount: 15000 * 100, // NGN 15,000
        currency: "NGN",
        callback: async function(response) {
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
        onClose: function() {
          setIsProcessing(false);
          showToast("Cancelled", "Upgrade transaction closed.", "info");
        }
      });
      handler.openIframe();
    } catch (err) {
      setIsProcessing(false);
      showToast("System Error", "Could not securely launch the payment window due to browser restrictions.", "error");
    }
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
          {!isPremium && <button className="btn-primary btn-premium btn-hover" style={{ width: "100%", padding: "14px" }} onClick={handleUpgrade} disabled={isProcessing}>{isProcessing ? "Loading Payment..." : "Upgrade Now"}</button>}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 4. SUPER ADMIN OPERATIONS DASHBOARD 
// =========================================================
function SuperAdminDashboard({ showToast }) {
  const [globalVendors, setGlobalVendors] = useState([]);
  const [globalInvoices, setGlobalInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function collectGlobalMetrics() {
      if (!supabase) return;
      const { data: vendors } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      const { data: invoices } = await supabase.from('invoices').select('*');
      if (vendors) setGlobalVendors(vendors);
      if (invoices) setGlobalInvoices(invoices);
      setLoading(false);
    }
    collectGlobalMetrics();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase.from('vendors').update({ role: newRole }).eq('id', userId);
    if (error) showToast("Error", error.message, "error");
    else {
      showToast("Role Updated", "User access level has been updated.", "success");
      setGlobalVendors(globalVendors.map(v => v.id === userId ? { ...v, role: newRole } : v));
    }
  };

  const totalPlatformVolume = globalInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const paidInvoices = globalInvoices.filter(inv => inv.status === 'paid');
  const accumulatedFees = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount || 0) * 0.015), 0);
  const premiumVendorsCount = globalVendors.filter(v => v.subscription_tier === 'premium').length;
  const estimatedSaaSMRR = premiumVendorsCount * 15000;

  if (loading) return <div style={{ fontSize: "15px", fontWeight: "600" }}>Querying Master Ledger Network...</div>;

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>SuperAdmin Mission Control</div>
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px" }}>Global telemetry oversight and team role management.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="metric-card">
          <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Platform Volume (TPV)</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>₦{totalPlatformVolume.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Transaction Fees (1.5%)</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: DESIGN.success }}>₦{accumulatedFees.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Estimated SaaS MRR</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: DESIGN.premium }}>₦{estimatedSaaSMRR.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Total Accounts</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>{globalVendors.length} Users</div>
        </div>
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Global Account Registry & Roles</h3>
      <div style={{ background: "#FFFFFF", border: `1px solid ${DESIGN.border}`, borderRadius: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
          <thead style={{ background: "#F1F5F9", fontSize: "12px", color: DESIGN.textMuted, textTransform: "uppercase" }}>
            <tr><th style={{ padding: "16px 24px" }}>Business Identity</th><th style={{ padding: "16px 24px" }}>System ID</th><th style={{ padding: "16px 24px" }}>Tier</th><th style={{ padding: "16px 24px" }}>Platform Role</th></tr>
          </thead>
          <tbody>
            {globalVendors.map(vendor => (
              <tr key={vendor.id} style={{ borderTop: `1px solid ${DESIGN.border}` }}>
                <td style={{ padding: "16px 24px", fontWeight: "700" }}>{vendor.business_name}</td>
                <td style={{ padding: "16px 24px", color: DESIGN.textMuted, fontSize: "13px" }}>{vendor.id}</td>
                <td style={{ padding: "16px 24px" }}><span style={{ fontSize: "11px", fontWeight: "800", padding: "4px 8px", borderRadius: "12px", background: vendor.subscription_tier === 'premium' ? "#F5F3FF" : "#F1F5F9", color: vendor.subscription_tier === 'premium' ? DESIGN.premium : DESIGN.textMuted }}>{vendor.subscription_tier.toUpperCase()}</span></td>
                <td style={{ padding: "16px 24px" }}>
                  <select className="form-input" style={{ padding: "8px", fontSize: "13px", width: "120px" }} value={vendor.role || 'vendor'} onChange={(e) => handleRoleChange(vendor.id, e.target.value)}>
                    <option value="vendor">Vendor</option>
                    <option value="support">Support</option>
                    <option value="admin">Super Admin</option>
                  </select>
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
// 5. LANDING PAGE 
// =========================================================
function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box", flex: 1 }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid #E2E8F0` }}>
          <div style={{ width: "180px", display: "flex", alignItems: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "40px", transform: "scale(2.5)", transformOrigin: "left center" }} /></div>
          <div className="nav-buttons" style={{ display: "flex", gap: "12px" }}>
            <a href="#/login" className="btn-secondary btn-hover">Log In</a>
            <a href="#/signup" className="btn-primary btn-hover">Get Started Free</a>
          </div>
        </nav>
        
        <main className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center", padding: "80px 0 60px" }}>
          <div className="hero-text-container" style={{ paddingRight: "40px" }}>
            <div style={{ display: "inline-block", padding: "6px 16px", background: "#F1F5F9", border: `1px solid #E2E8F0`, borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#64748B", marginBottom: "24px" }}>The #1 CRM & Invoicing Tool</div>
            <h1 className="hero-title" style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 24px", color: "#0F172A", lineHeight: "1.1" }}>Manage Customers.<br />Automate Payments.</h1>
            <p style={{ fontSize: "18px", color: "#64748B", margin: "0 0 40px", lineHeight: "1.6" }}>KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements through automated Paystack routing.</p>
            <a href="#/signup" className="btn-primary btn-hover" style={{ padding: "16px 36px", fontSize: "16px" }}>Create Your Account</a>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" alt="Nigerian Professional Dashboard" style={{ width: "100%", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} />
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
              <a href="#/signup" className="btn-secondary btn-hover" style={{ width: "100%" }}>Get Started Free</a>
            </div>
            <div style={{ background: DESIGN.card, border: `2px solid ${DESIGN.premium}`, borderRadius: 12, padding: "40px", flex: "1", minWidth: "300px", maxWidth: "400px", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.15)" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", color: DESIGN.premium }}>Premium Pro</div>
              <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "24px" }}>₦15,000<span style={{fontSize: "16px", color: DESIGN.textMuted}}>/mo</span></div>
              <ul style={{ paddingLeft: "20px", color: DESIGN.textMuted, fontSize: "15px", lineHeight: "1.8", marginBottom: "32px" }}>
                <li>Everything in Free</li>
                <li><strong style={{color: DESIGN.textMain}}>Remove KudiSlip Watermark</strong></li>
                <li>Fully Independent Branding</li>
              </ul>
              <a href="#/signup" className="btn-primary btn-premium btn-hover" style={{ width: "100%" }}>Upgrade to Premium</a>
            </div>
          </div>
        </div>
      </div>
      
      <footer style={{ borderTop: `1px solid ${DESIGN.border}`, padding: "40px 24px", textAlign: "center", color: DESIGN.textMuted, fontSize: "14px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>© 2026 KudiSlip Technologies. All rights reserved.</div>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="#/terms" style={{ textDecoration: "none", color: DESIGN.textMuted }} className="btn-hover">Terms & Conditions</a>
            <a href="#/privacy" style={{ textDecoration: "none", color: DESIGN.textMuted }} className="btn-hover">Privacy Policy</a>
            <a href="mailto:support@kudislip.com" style={{ textDecoration: "none", color: DESIGN.textMuted }} className="btn-hover">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =========================================================
// 6. AUTHENTICATION
// =========================================================
function KudiSlipAuth({ onLoginSuccess, initialIsSignUp, showToast }) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (isSignUp) {
        if (!agreedToTerms) throw new Error("You must agree to the Terms and Privacy Policy to continue.");
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (authData.user) {
          const { error: dbError } = await supabase.from('vendors').insert([{ id: authData.user.id, business_name: businessName }]);
          if (dbError) throw dbError;
        }
        showToast("Account Created", "Your setup is complete! Please log in to continue.", "success");
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const { data: vendorData } = await supabase.from('vendors').select('*').eq('id', data.user.id).single();
        onLoginSuccess({ ...data.user, ...vendorData });
        window.location.hash = "#/dashboard/invoices";
      }
    } catch (err) { setError(err.message); showToast("Authentication Error", err.message, "error"); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <GlobalStyles />
      <a href="#/" style={{ textDecoration: "none", position: "absolute", top: "24px", left: "24px", color: "#64748B", fontWeight: "600", fontSize: "14px", padding: "8px" }} className="btn-hover">&larr; Back to Home</a>
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} /></div>
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>{isSignUp ? "Create your account" : "Welcome back"}</h2>
        <form onSubmit={handleAuth}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          {isSignUp && <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Business Name</label><input className="form-input" placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required /></div>}
          <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Email Address</label><input className="form-input" type="email" placeholder="merchant@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div style={{ marginBottom: isSignUp ? "16px" : "28px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          
          {isSignUp && (
            <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ cursor: "pointer", marginTop: "2px" }} required />
              <label htmlFor="terms" style={{ fontSize: "12px", color: DESIGN.textMuted, lineHeight: "1.5" }}>
                I agree to the <a href="#/terms" style={{ color: DESIGN.primary, fontWeight: "800", textDecoration: "none" }} target="_blank">Terms & Conditions</a> and <a href="#/privacy" style={{ color: DESIGN.primary, fontWeight: "800", textDecoration: "none" }} target="_blank">Privacy Policy</a>.
              </label>
            </div>
          )}

          <button className="btn-primary btn-hover" style={{ width: "100%" }} type="submit" disabled={loading}>{loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}</button>
        </form>
        <div style={{ textAlign: "center", marginTop: "24px", color: "#64748B", fontSize: "14px" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span style={{ color: "#000000", fontWeight: "800", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 10. HELPDESK & SUPPORT TICKETING SYSTEM
// =========================================================
function SupportDashboard({ user, showToast }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [subject, setSubject] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchTickets = async () => {
    let query = supabase.from('tickets').select('*, vendors(business_name, email)');
    if (user.role === 'vendor') query = query.eq('vendor_id', user.id);
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setTickets(data);
    setLoading(false);
  };

  useEffect(() => { if (supabase) fetchTickets(); }, []);

  useEffect(() => {
    if (activeTicket) {
      supabase.from('ticket_messages').select('*').eq('ticket_id', activeTicket.id).order('created_at', { ascending: true }).then(({ data }) => setMessages(data || []));
    }
  }, [activeTicket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleCreateTicket = async (e) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.from('tickets').insert([{ vendor_id: user.id, subject }]).select().single();
    if (error) showToast("Error", error.message, "error");
    else {
      showToast("Ticket Created", "A support agent will be with you shortly.", "success");
      setSubject("");
      fetchTickets();
      await supabase.from('notifications').insert([{ user_id: user.id, title: "New Support Ticket", message: `${user.business_name || 'A user'} opened a ticket: ${subject}` }]);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = newMessage; setNewMessage("");
    
    const { error } = await supabase.from('ticket_messages').insert([{ ticket_id: activeTicket.id, sender_id: user.id, message: msg }]);
    if (error) { showToast("Error", error.message, "error"); return; }
    
    setMessages([...messages, { id: Date.now(), sender_id: user.id, message: msg, created_at: new Date().toISOString() }]);

    if (user.role !== 'vendor') {
      await supabase.from('notifications').insert([{ user_id: activeTicket.vendor_id, title: "Support Reply", message: `Admin replied to your ticket: ${activeTicket.subject}` }]);
    }
  };

  const closeTicket = async () => {
    await supabase.from('tickets').update({ status: 'closed' }).eq('id', activeTicket.id);
    setActiveTicket({ ...activeTicket, status: 'closed' });
    fetchTickets();
    showToast("Closed", "Ticket has been closed.", "info");
  };

  if (activeTicket) {
    return (
      <div style={{ maxWidth: "800px" }}>
        <button onClick={() => setActiveTicket(null)} className="btn-hover" style={{ background: "none", border: "none", cursor: "pointer", color: DESIGN.textMuted, fontWeight: "700", marginBottom: "16px", display: "flex", gap: "8px" }}>&larr; Back to Tickets</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>{activeTicket.subject}</h2>
          {activeTicket.status === 'open' && user.role !== 'vendor' && <button className="btn-secondary btn-hover" onClick={closeTicket}>Close Ticket</button>}
          {activeTicket.status === 'closed' && <span style={{ padding: "6px 12px", background: "#FEF2F2", color: "#EF4444", borderRadius: "16px", fontSize: "12px", fontWeight: "800" }}>CLOSED</span>}
        </div>
        
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 && <div style={{ textAlign: "center", color: DESIGN.textMuted, marginTop: "20px" }}>No messages yet. Send a message to start.</div>}
            {messages.map(m => {
              const isMe = m.sender_id === user.id;
              return (
                <div key={m.id} className={`chat-bubble ${isMe ? 'user' : 'admin'}`}>
                  <div style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>{isMe ? "You" : "Support Team"}</div>
                  <div>{m.message}</div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          {activeTicket.status === 'open' ? (
             <form onSubmit={handleSendMessage} className="chat-input-area">
              <input className="form-input" style={{ flex: 1, margin: 0 }} placeholder="Type your message..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} required />
              <button className="btn-primary btn-hover" type="submit">Send</button>
            </form>
          ) : (
            <div style={{ padding: "16px", textAlign: "center", background: "#F1F5F9", color: DESIGN.textMuted, fontWeight: "600", fontSize: "14px" }}>This ticket is closed.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}><MessageIcon /> {user.role === 'vendor' ? 'Help & Support' : 'Support Inbox'}</div>
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px" }}>{user.role === 'vendor' ? 'Need help? Open a ticket and our team will assist you.' : 'Manage and respond to customer tickets.'}</div>

      {user.role === 'vendor' && (
        <div style={{ background: "#FFFFFF", border: `1px solid ${DESIGN.border}`, borderRadius: 12, padding: "32px", marginBottom: "40px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Create New Ticket</h3>
          <form onSubmit={handleCreateTicket} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input className="form-input" style={{ flex: 1, minWidth: "200px" }} placeholder="Briefly describe your issue..." value={subject} onChange={e=>setSubject(e.target.value)} required />
            <button className="btn-primary btn-hover" type="submit" disabled={loading}>{loading ? "..." : "Open Ticket"}</button>
          </form>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>{user.role === 'vendor' ? 'Your Tickets' : 'All Open Tickets'}</h3>
        {loading ? <div style={{ color: DESIGN.textMuted }}>Loading tickets...</div> : tickets.length === 0 ? <div style={{ padding: "40px", textAlign: "center", background: "#FFF", borderRadius: "12px", border: `1px dashed ${DESIGN.border}`, color: DESIGN.textMuted }}>No tickets found.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tickets.map(t => (
              <div key={t.id} className="card-hover" style={{ background: "#FFFFFF", border: `1px solid ${DESIGN.border}`, borderRadius: 12, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setActiveTicket(t)}>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "4px" }}>{t.subject}</div>
                  <div style={{ fontSize: "12px", color: DESIGN.textMuted }}>{user.role !== 'vendor' ? `From: ${t.vendors?.business_name || 'Vendor'}` : new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", padding: "4px 8px", borderRadius: "12px", background: t.status === 'open' ? "#FEF3C7" : "#F1F5F9", color: t.status === 'open' ? "#D97706" : DESIGN.textMuted }}>{t.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// MAIN APP ROUTER (With Mobile Sidebar Overlay)
// =========================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Toggle State
  
  const [toast, setToast] = useState(null);
  const showToast = (title, message, type = "success") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [hash, setHash] = useState(window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || "#/");
      setIsSidebarOpen(false); // Auto-close sidebar on route change
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (initializationError || !supabase) { setIsLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('vendors').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setUser({ ...session.user, ...data });
          setIsLoading(false);
          checkNotifications({ ...session.user, ...data });
          if (window.location.hash === "" || window.location.hash === "#/" || window.location.hash === "#/login" || window.location.hash === "#/signup") {
             window.location.hash = "#/dashboard/invoices";
          }
        });
      } else { setIsLoading(false); }
    });
  }, []);

  const checkNotifications = async (userData) => {
    if (!supabase || !userData) return;
    let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('is_read', false);
    if (userData.role === 'vendor') query = query.eq('user_id', userData.id);
    const { count } = await query;
    if (count !== null) setUnreadCount(count);
  };

  const clearNotifications = async () => {
    if (!user || unreadCount === 0) { window.location.hash = "#/dashboard/support"; return; }
    let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (user.role === 'vendor') query = query.eq('user_id', user.id);
    await query;
    setUnreadCount(0);
    window.location.hash = "#/dashboard/support";
  };

  const renderView = () => {
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

    // 1. PUBLIC INVOICE ROUTE 
    if (hash.startsWith('#/pay/')) {
      const cleanId = hash.replace('#/pay/', '').replace(/[^a-zA-Z0-9-]/g, '');
      return <PublicInvoice invoiceId={cleanId} showToast={showToast} currentUser={user} />;
    }

    // 2. PUBLIC LEGAL ROUTES
    if (hash === "#/terms") return <LegalPage type="terms" />;
    if (hash === "#/privacy") return <LegalPage type="privacy" />;

    // 3. SECURE LOADING STATE
    if (isLoading) return <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "600"}}><GlobalStyles />Loading Workspace...</div>;

    // 4. AUTH & LANDING ROUTES
    if (!user) {
      if (hash === "#/login") return <KudiSlipAuth initialIsSignUp={false} showToast={showToast} onLoginSuccess={(u) => { setUser(u); window.location.hash = "#/dashboard/invoices"; }} />;
      if (hash === "#/signup") return <KudiSlipAuth initialIsSignUp={true} showToast={showToast} onLoginSuccess={(u) => { setUser(u); window.location.hash = "#/dashboard/invoices"; }} />;
      return <LandingPage />;
    }

    // 5. SECURE DASHBOARD ROUTES
    const activeTab = hash.replace('#/dashboard/', '');

    return (
      <div className="dashboard-layout">
        <GlobalStyles />
        
        {/* Mobile Header (Hamburger Menu) */}
        <div className="mobile-top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: "none", border: "none", color: DESIGN.textMain, cursor: "pointer", padding: "4px" }}>
              <MenuIcon />
            </button>
            <img src="/logo.png" alt="KudiSlip" style={{ height: "24px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div onClick={clearNotifications}><BellIcon count={unreadCount} /></div>
          </div>
        </div>

        {/* Mobile Dark Overlay */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img src="/logo.png" alt="KudiSlip" style={{ height: "40px", transform: "scale(2.2)", transformOrigin: "left center" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div onClick={clearNotifications}><BellIcon count={unreadCount} /></div>
            </div>
          </div>
          
          <div className="sidebar-menu">
            {user.role !== 'support' && (
              <>
                <a href="#/dashboard/invoices" className={`menu-btn ${activeTab === "invoices" ? "active" : ""}`}>Invoices & Analytics</a>
                <a href="#/dashboard/clients" className={`menu-btn ${activeTab === "clients" ? "active" : ""}`}>Client Directory</a>
                <a href="#/dashboard/payouts" className={`menu-btn ${activeTab === "payouts" ? "active" : ""}`}>Payout Settings</a>
                <a href="#/dashboard/brand" className={`menu-btn ${activeTab === "brand" ? "active" : ""}`}>Brand Settings</a>
                <a href="#/dashboard/billing" className={`menu-btn ${activeTab === "billing" ? "active" : ""}`}>Billing & Plan</a>
              </>
            )}
            <a href="#/dashboard/support" className={`menu-btn ${activeTab === "support" ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               {user.role === 'vendor' ? 'Helpdesk & Chat' : 'Support Inbox'}
            </a>

            {user?.role === 'admin' && (
              <a href="#/dashboard/admin" className={`menu-btn ${activeTab === "admin" ? "active" : ""}`} style={{ color: DESIGN.premium, borderTop: "1px dashed #E2E8F0", marginTop: "12px", paddingTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldIcon /> Admin Operations
              </a>
            )}
            
            {/* Mobile Logout (Appears at bottom of menu links on phone) */}
            <button className="mobile-nav-logout" onClick={() => supabase.auth.signOut().then(() => { setUser(null); window.location.hash = "#/"; })}>Log Out</button>
          </div>
          <div style={{ flex: 1 }} />
          <div className="sidebar-footer">
            <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {user?.business_name || user?.email}
            </div>
            <button className="menu-btn btn-hover" style={{ padding: "0", color: DESIGN.error }} onClick={() => supabase.auth.signOut().then(() => { setUser(null); window.location.hash = "#/"; })}>Log Out</button>
          </div>
        </div>

        <div className="main-content">
          {/* Strictly guard content renders to roles to prevent direct URL sneaking */}
          {activeTab === "invoices" && user.role !== 'support' && (
             user.subscription_tier === 'premium' && !user.logo_url && false /* We will handle modal locally */ ? null :
            <InvoiceGenerator user={user} showToast={showToast} />
          )}
          {activeTab === "clients" && user.role !== 'support' && <ClientsManager user={user} showToast={showToast} />}
          {activeTab === "payouts" && user.role !== 'support' && <PayoutSettings user={user} onSubaccountLinked={(code) => setUser(prev => ({ ...prev, paystack_subaccount_code: code }))} showToast={showToast} />}
          {activeTab === "brand" && user.role !== 'support' && <BrandSettings user={user} onUpdate={(updatedUser) => setUser(updatedUser)} showToast={showToast} />}
          {activeTab === "billing" && user.role !== 'support' && <SubscriptionManager user={user} onUpgradeSuccess={() => setUser({ ...user, subscription_tier: 'premium' })} showToast={showToast} />}
          {activeTab === "support" && <SupportDashboard user={user} showToast={showToast} />}
          {activeTab === "admin" && user.role === 'admin' && <SuperAdminDashboard showToast={showToast} />}
        </div>
      </div>
    );
  };

  // 3. Premium Logo Blocker Logic
  const isDashboardPremium = user && user.subscription_tier === 'premium';
  const hasNoLogo = isDashboardPremium && !user.logo_url;
  const isAttemptingInvoice = hash === "#/dashboard/invoices";
  const [showLogoPrompt, setShowLogoPrompt] = useState(false);

  useEffect(() => {
    if (isAttemptingInvoice && hasNoLogo) {
      setShowLogoPrompt(true);
    } else {
      setShowLogoPrompt(false);
    }
  }, [hash, user]);

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* PREMIUM LOGO PROMPT MODAL */}
      {showLogoPrompt && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFF", padding: "40px", borderRadius: "16px", maxWidth: "400px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ color: DESIGN.premium, marginBottom: "16px", display: "flex", justifyContent: "center" }}><PaintIcon /></div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 16px" }}>Add Your Logo</h2>
            <p style={{ color: DESIGN.textMuted, lineHeight: "1.6", marginBottom: "32px", fontSize: "14px" }}>You are a Premium subscriber! Before generating invoices, please upload your business logo so it appears on your receipts instead of the default branding.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-secondary btn-hover" style={{ flex: 1 }} onClick={() => setShowLogoPrompt(false)}>Skip for now</button>
              <button className="btn-primary btn-premium btn-hover" style={{ flex: 1 }} onClick={() => { setShowLogoPrompt(false); window.location.hash = "#/dashboard/brand"; }}>Upload Logo</button>
            </div>
          </div>
        </div>
      )}

      {renderView()}
      
      {/* FLOATING SUPPORT BUTTON (Only for vendors not already in the support tab) */}
      {user && user.role === 'vendor' && hash !== "#/dashboard/support" && !hash.startsWith("#/pay/") && (
        <button 
          className="btn-primary btn-hover" 
          onClick={() => window.location.hash = "#/dashboard/support"}
          style={{ position: "fixed", bottom: "32px", right: "32px", borderRadius: "50px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "8px", zIndex: 999, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
        >
          <MessageIcon /> Support
        </button>
      )}
    </>
  );
}

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// --- ENVIRONMENTS & ARTIFACTS ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ""; 

// Diagnostic Safety Initialization
let supabase = null;
let initializationError = null;

if (!SUPABASE_URL || SUPABASE_URL.includes("your-project")) {
  initializationError = "Missing VITE_SUPABASE_URL environment variable on Vercel.";
} else if (!SUPABASE_ANON_KEY) {
  initializationError = "Missing VITE_SUPABASE_ANON_KEY environment variable on Vercel.";
} else {
  try { 
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 
  } catch (err) { 
    initializationError = "Supabase initialization failed: " + err.message; 
  }
}

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "058", name: "GTBank" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
];

const DESIGN = {
  bg: "#F8FAFC", surface: "#FFFFFF", card: "#FFFFFF", border: "#E2E8F0",
  primary: "#000000", textMain: "#0F172A", textMuted: "#64748B", error: "#EF4444", success: "#10B981", premium: "#8B5CF6"
};

const GlobalStyles = () => (
  <style>{`
    body { margin: 0; padding: 0; background: #F8FAFC; color: #0F172A; font-family: system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    .btn-primary { padding: 14px 28px; background: #000000; color: #FFFFFF; border: none; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s ease; text-decoration: none; display: inline-block; text-align: center; }
    .btn-primary:hover:not(:disabled) { background: #333333; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-premium { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: white; border: none; }
    .btn-secondary { padding: 12px 24px; background: transparent; color: #000000; border: 2px solid #000000; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s ease; text-decoration: none; display: inline-block; text-align: center; }
    .btn-secondary:hover { background: #F1F5F9; transform: translateY(-2px); }
    .form-input { width: 100%; padding: 14px 16px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; color: #0F172A; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s ease; }
    .form-input:focus { border-color: #000000; }
    .menu-btn { display: block; width: 100%; padding: 16px 32px; background: transparent; border: none; border-left: 4px solid transparent; color: #64748B; text-align: left; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.15s ease; }
    .menu-btn:hover { background: #F8FAFC; color: #000000; }
    .menu-btn.active { background: #F1F5F9; border-left: 4px solid #000000; color: #000000; font-weight: 700; }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08); }
    .dashboard-layout { display: flex; min-height: 100vh; flex-direction: row; }
    .sidebar { width: 260px; background: #FFFFFF; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; padding: 32px 0; flex-shrink: 0; }
    .sidebar-menu { display: flex; flex-direction: column; width: 100%; }
    .main-content { flex: 1; padding: 48px; box-sizing: border-box; overflow-y: auto; }
    .metric-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
    @media (max-width: 768px) {
      .hero-title { font-size: 38px !important; }
      .nav-buttons { display: none !important; }
      .dashboard-layout { flex-direction: column; }
      .sidebar { width: 100%; border-right: none; border-bottom: 1px solid #E2E8F0; padding: 16px 0 0 0; min-height: auto; }
      .sidebar-logo-container { padding: 0 24px 16px 24px !important; }
      .sidebar-menu { flex-direction: row; overflow-x: auto; padding: 0 16px; white-space: nowrap; border-top: 1px solid #F1F5F9; }
      .menu-btn { padding: 14px 20px; border-left: none; border-bottom: 3px solid transparent; text-align: center; }
      .menu-btn.active { border-left: none; border-bottom: 3px solid #000000; }
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
// 1. PUBLIC INVOICE VIEW (DEBUG MODE)
// =========================================================
function PublicInvoice({ invoiceId }) {
  usePaystack();
  const [invoice, setInvoice] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !invoiceId) return;
      
      const { data: invData, error: invError } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
      
      if (invError) {
        setDebugError(`Msg: ${invError.message} | Details: ${invError.details} | Hint: ${invError.hint}`);
        setLoading(false);
        return;
      }

      if (invData) {
        setInvoice(invData);
        const { data: venData } = await supabase.from('vendors').select('*').eq('id', invData.vendor_id).single();
        const { data: cliData } = await supabase.from('clients').select('*').eq('id', invData.client_id).single();
        setVendor(venData); setClient(cliData);
      }
      setLoading(false);
    }
    fetchData();
  }, [invoiceId]);

  const handlePayment = () => {
    if (!window.PaystackPop) return alert("Payment engine loading, please try again in a second.");
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: client?.email || "customer@kudislip.com",
      amount: invoice.amount * 100,
      currency: "NGN",
      subaccount: vendor?.paystack_subaccount_code,
      callback: async function(response) {
        await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id);
        setInvoice({ ...invoice, status: 'paid' });
        alert("Payment Successful! Receipt saved.");
      }
    });
    handler.openIframe();
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Loading Secure Invoice...</div>;
  
  if (debugError) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#FFF1F2" }}>
      <GlobalStyles/>
      <h2 style={{color: "#EF4444"}}>🚨 Database Blocked the Request</h2>
      <p style={{background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #FECACA", maxWidth: "600px", wordWrap: "break-word"}}>{debugError}</p>
    </div>
  );

  if (!invoice) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Invoice not found.</div>;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", display: "flex", justifyContent: "center", background: DESIGN.bg }}>
      <GlobalStyles />
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {(!vendor?.subscription_tier || vendor.subscription_tier === 'free') && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: DESIGN.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Powered By</div>
            <img src="/logo.png" alt="KudiSlip" style={{ height: "24px", transform: "scale(1.5)" }} />
          </div>
        )}
        <div className="card-hover" style={{ background: DESIGN.surface, borderRadius: "16px", border: `1px solid ${DESIGN.border}`, padding: "40px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Billed By</div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: DESIGN.textMain }}>{vendor?.business_name || "Verified Merchant"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Status</div>
              <div style={{ display: "inline-block", background: invoice.status === 'pending' ? "#FEF3C7" : "#ECFDF5", color: invoice.status === 'pending' ? "#D97706" : "#10B981", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>{invoice.status}</div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${DESIGN.border}`, borderBottom: `1px solid ${DESIGN.border}`, padding: "24px 0", marginBottom: "32px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Billed To</div>
              <div style={{ fontWeight: "700" }}>{client?.name}</div>
              <div style={{ fontSize: "14px", color: DESIGN.textMuted }}>{client?.email}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Due Date</div>
              <div style={{ fontWeight: "700" }}>{new Date(invoice.due_date).toLocaleDateString()}</div>
            </div>
          </div>
          <div style={{ marginBottom: "40px" }}>
            {invoice.items.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", gap: "16px", marginBottom: "12px", fontSize: "14px", fontWeight: "500" }}>
                <span>{item.description}</span><span style={{textAlign: "center", color: DESIGN.textMuted}}>{item.quantity}</span><span style={{textAlign: "right"}}>₦{item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: DESIGN.textMuted }}>Total Amount</div>
            <div style={{ fontSize: "28px", fontWeight: "900", color: DESIGN.textMain }}>₦{invoice.amount.toLocaleString()}</div>
          </div>
          {invoice.status === 'pending' ? (
            <button className="btn-primary" style={{ width: "100%", padding: "18px" }} onClick={handlePayment}>Proceed to Payment</button>
          ) : (
            <div style={{ textAlign: "center", color: DESIGN.success, fontWeight: "800", fontSize: "16px", padding: "16px" }}>✓ Invoice Paid Securely</div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 2. SUBSCRIPTION / BILLING DASHBOARD
// =========================================================
function SubscriptionManager({ user, onUpgradeSuccess }) {
  usePaystack();
  const isPremium = user?.subscription_tier === 'premium';

  const handleUpgrade = () => {
    if (!window.PaystackPop) return alert("Payment engine loading...");
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user?.email || "vendor@kudislip.com",
      amount: 15000 * 100,
      currency: "NGN",
      callback: async function(response) {
        await supabase.from('vendors').update({ subscription_tier: 'premium' }).eq('id', user.id);
        onUpgradeSuccess();
        alert("Welcome to Premium! Watermarks have been removed from your invoices.");
      }
    });
    handler.openIframe();
  };

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
          {!isPremium && <button className="btn-primary btn-premium" style={{ width: "100%", padding: "14px" }} onClick={handleUpgrade}>Upgrade Now</button>}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 3. SUPER ADMIN OPERATIONS DASHBOARD 
// =========================================================
function SuperAdminDashboard() {
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

  const totalPlatformVolume = globalInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const paidInvoices = globalInvoices.filter(inv => inv.status === 'paid');
  const accumulatedFees = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) * 0.015), 0);
  const premiumVendorsCount = globalVendors.filter(v => v.subscription_tier === 'premium').length;
  const estimatedSaaSMRR = premiumVendorsCount * 15000;

  if (loading) return <div style={{ fontSize: "15px", fontWeight: "600" }}>Querying Master Ledger Network...</div>;

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>SuperAdmin Mission Control</div>
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px" }}>Global telemetry oversight of all transaction nodes and merchants.</div>
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
          <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", textTransform: "uppercase" }}>Total Merchants</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>{globalVendors.length} Businesses</div>
        </div>
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Global Merchant Registry</h3>
      <div style={{ background: "#FFFFFF", border: `1px solid ${DESIGN.border}`, borderRadius: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
          <thead style={{ background: "#F1F5F9", fontSize: "12px", color: DESIGN.textMuted, textTransform: "uppercase" }}>
            <tr><th style={{ padding: "16px 24px" }}>Business Identity</th><th style={{ padding: "16px 24px" }}>System Account ID</th><th style={{ padding: "16px 24px" }}>Subscription Tier</th><th style={{ padding: "16px 24px" }}>Paystack Node Reference</th></tr>
          </thead>
          <tbody>
            {globalVendors.map(vendor => (
              <tr key={vendor.id} style={{ borderTop: `1px solid ${DESIGN.border}` }}>
                <td style={{ padding: "16px 24px", fontWeight: "700" }}>{vendor.business_name}</td>
                <td style={{ padding: "16px 24px", color: DESIGN.textMuted, fontSize: "13px" }}>{vendor.id}</td>
                <td style={{ padding: "16px 24px" }}><span style={{ fontSize: "11px", fontWeight: "800", padding: "4px 8px", borderRadius: "12px", background: vendor.subscription_tier === 'premium' ? "#F5F3FF" : "#F1F5F9", color: vendor.subscription_tier === 'premium' ? DESIGN.premium : DESIGN.textMuted }}>{vendor.subscription_tier.toUpperCase()}</span></td>
                <td style={{ padding: "16px 24px", fontSize: "13px", color: DESIGN.textMuted }}>{vendor.paystack_subaccount_code || "— Not Configured"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================
// 4. LANDING PAGE 
// =========================================================
function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box", flex: 1 }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid #E2E8F0` }}>
          <div style={{ width: "180px", display: "flex", alignItems: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "40px", transform: "scale(2.5)", transformOrigin: "left center" }} /></div>
          <div className="nav-buttons" style={{ display: "flex", gap: "12px" }}>
            <button className="btn-secondary" onClick={() => onNavigate("auth", false)}>Log In</button>
            <button className="btn-primary" onClick={() => onNavigate("auth", true)}>Get Started Free</button>
          </div>
        </nav>
        <main style={{ textAlign: "center", padding: "80px 0 60px" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "#F1F5F9", border: `1px solid #E2E8F0`, borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#64748B", marginBottom: "24px" }}>The #1 CRM & Invoicing Tool</div>
          <h1 className="hero-title" style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 24px", color: "#0F172A", lineHeight: "1.1" }}>Manage Customers.<br />Automate Payments.</h1>
          <p style={{ fontSize: "18px", color: "#64748B", maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.6" }}>KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements through automated Paystack routing.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ padding: "16px 36px", fontSize: "16px" }} onClick={() => onNavigate("auth", true)}>Create Your Account</button>
          </div>
        </main>
        
        {/* Features Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", paddingBottom: "80px" }}>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}><h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Professional Invoicing</h3><p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Generate clean, branded invoices and receipts for your clients in seconds.</p></div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}><h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Instant Settlements</h3><p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Link your Nigerian bank account and receive payments directly via Paystack.</p></div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}><h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Customer CRM</h3><p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Track client history, outstanding payments, and contact details seamlessly.</p></div>
        </div>

        {/* Pricing Section */}
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
              <button className="btn-secondary" style={{ width: "100%" }} onClick={() => onNavigate("auth", true)}>Get Started Free</button>
            </div>
            <div style={{ background: DESIGN.card, border: `2px solid ${DESIGN.premium}`, borderRadius: 12, padding: "40px", flex: "1", minWidth: "300px", maxWidth: "400px", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.15)" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", color: DESIGN.premium }}>Premium Pro</div>
              <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "24px" }}>₦15,000<span style={{fontSize: "16px", color: DESIGN.textMuted}}>/mo</span></div>
              <ul style={{ paddingLeft: "20px", color: DESIGN.textMuted, fontSize: "15px", lineHeight: "1.8", marginBottom: "32px" }}>
                <li>Everything in Free</li>
                <li><strong style={{color: DESIGN.textMain}}>Remove KudiSlip Watermark</strong></li>
                <li>Fully Independent Branding</li>
              </ul>
              <button className="btn-primary btn-premium" style={{ width: "100%" }} onClick={() => onNavigate("auth", true)}>Upgrade to Premium</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${DESIGN.border}`, padding: "40px 24px", textAlign: "center", color: DESIGN.textMuted, fontSize: "14px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>© 2026 KudiSlip Technologies. All rights reserved.</div>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => alert("Terms & Conditions will go here.")}>Terms & Conditions</span>
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => alert("Privacy Policy will go here.")}>Privacy Policy</span>
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => alert("Contact Support at support@kudislip.com")}>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =========================================================
// 5. AUTHENTICATION
// =========================================================
function KudiSlipAuth({ onLoginSuccess, initialIsSignUp, onBack }) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (authData.user) {
          const { error: dbError } = await supabase.from('vendors').insert([{ id: authData.user.id, business_name: businessName }]);
          if (dbError) throw dbError;
        }
        alert("Account setup complete! Please log in.");
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const { data: vendorData } = await supabase.from('vendors').select('*').eq('id', data.user.id).single();
        onLoginSuccess({ ...data.user, ...vendorData });
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <GlobalStyles />
      <button onClick={onBack} style={{ position: "absolute", top: "24px", left: "24px", background: "none", border: "none", color: "#64748B", cursor: "pointer", fontWeight: "600", fontSize: "14px", padding: "8px" }}>&larr; Back to Home</button>
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} /></div>
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>{isSignUp ? "Create your account" : "Welcome back"}</h2>
        <form onSubmit={handleAuth}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          {isSignUp && <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Business Name</label><input className="form-input" placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required /></div>}
          <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Email Address</label><input className="form-input" type="email" placeholder="merchant@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div style={{ marginBottom: "28px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button className="btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>{loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}</button>
        </form>
        <div style={{ textAlign: "center", marginTop: "24px", color: "#64748B", fontSize: "14px" }}>{isSignUp ? "Already have an account? " : "Don't have an account? "}<span style={{ color: "#000000", fontWeight: "800", cursor: "pointer", textDecoration: "underline" }} onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>{isSignUp ? "Log In" : "Sign Up"}</span></div>
      </div>
    </div>
  );
}

// =========================================================
// 6. CLIENTS CRM
// =========================================================
function ClientsManager({ user }) {
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
    if (!error && data) { setClients([data, ...clients]); setName(""); setEmail(""); setPhone(""); alert("Client added successfully!"); }
    else if (error) { alert("Failed to add client. Check database permissions."); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Client Directory</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your customer database.</div>
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800" }}>Add New Client</h3>
        <form onSubmit={handleAddClient} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", alignItems: "end" }}>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Name</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Phone</label><input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Add Client"}</button>
        </form>
      </div>
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, overflowX: "auto" }}>
        {clients.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No clients added yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "500px" }}>
            <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
              <tr><th style={{ padding: "16px 24px" }}>Name</th><th style={{ padding: "16px 24px" }}>Email</th><th style={{ padding: "16px 24px" }}>Phone</th></tr>
            </thead>
            <tbody>
              {clients.map(c => <tr key={c.id} style={{ borderTop: `1px solid #E2E8F0` }}><td style={{ padding: "16px 24px", fontWeight: "600" }}>{c.name}</td><td style={{ padding: "16px 24px", color: "#64748B" }}>{c.email}</td><td style={{ padding: "16px 24px", color: "#64748B" }}>{c.phone || "—"}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// =========================================================
// 7. INVOICE GENERATOR & VENDOR ANALYTICS
// =========================================================
function InvoiceGenerator({ user }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('clients').select('*').eq('vendor_id', user.id).then(({ data }) => setClients(data || []));
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    const { data } = await supabase.from('invoices').select('*, clients(name)').eq('vendor_id', user.id).order('created_at', { ascending: false });
    if(data) setInvoices(data);
  };

  const handleAddItem = () => setItems([...items, { description: "", quantity: 1, price: 0 }]);
  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index, field, value) => { const newItems = [...items]; newItems[index][field] = value; setItems(newItems); };
  const calculateTotal = () => items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleGenerateInvoice = async () => {
    if (!selectedClient || !dueDate) return alert("Select a client and due date.");
    setLoading(true);
    
    // Attempt to save the invoice
    const { data, error } = await supabase.from('invoices').insert([{ 
      vendor_id: user.id, 
      client_id: selectedClient, 
      amount: calculateTotal(), 
      items: items, 
      due_date: dueDate 
    }]).select().single();
    
    // If it fails, print exactly what Supabase says is wrong!
    if (error) {
      alert("Database Error: " + error.message + "\nDetails: " + (error.details || "None"));
    } else {
      alert("Invoice Generated! Link created.");
      setItems([{ description: "", quantity: 1, price: 0 }]); setSelectedClient(""); setDueDate("");
      fetchRecentInvoices();
    }
    setLoading(false);
  };

  // Vendor Analytics Calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPending = totalBilled - totalPaid;

  if (!user?.paystack_subaccount_code) return <div style={{ padding: "20px", background: "#FEF2F2", border: `1px solid #EF4444`, borderRadius: "8px" }}><div style={{ color: "#EF4444", fontWeight: "800", marginBottom: "6px" }}>Action Required</div><div style={{ fontSize: "14px" }}>Link a bank account in <strong>Payout Settings</strong> first.</div></div>;

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>CRM & Invoicing</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Bill your clients and monitor your business health.</div>

      {/* VENDOR ANALYTICS DASHBOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="metric-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Billed</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>₦{totalBilled.toLocaleString()}</div>
        </div>
        <div className="metric-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Collected</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#10B981" }}>₦{totalPaid.toLocaleString()}</div>
        </div>
        <div className="metric-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Pending Debt</div>
          <div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#EF4444" }}>₦{totalPending.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "40px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>Create New Invoice</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Billed To (Client)</label>
            <select className="form-input" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              <option value="">-- Select Client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Due Date</label><input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "12px" }}>
              <input className="form-input" placeholder="Item description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
              <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} />
              <input className="form-input" type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', Number(e.target.value))} />
              <button onClick={() => handleRemoveItem(idx)} style={{ background: "transparent", color: "#EF4444", border: "none", cursor: "pointer", fontWeight: "800", padding: "0 10px" }}>X</button>
            </div>
          ))}
          <button onClick={handleAddItem} style={{ background: "transparent", color: "#000000", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "14px", padding: 0 }}>+ Add Line Item</button>
        </div>
        <div style={{ borderTop: `1px solid #E2E8F0`, paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900" }}>Total: ₦{calculateTotal().toLocaleString()}</div>
          <button className="btn-primary" onClick={handleGenerateInvoice} disabled={loading || clients.length === 0}>{loading ? "Generating..." : "Generate Invoice"}</button>
        </div>
      </div>
      {invoices.length > 0 && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Recent Invoices</h3>
          {invoices.map(inv => (
            <div key={inv.id} style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
              <div><div style={{ fontWeight: "700" }}>{inv.clients?.name}</div><div style={{ fontSize: "13px", color: "#64748B" }}>₦{inv.amount.toLocaleString()}</div></div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", padding: "4px 8px", borderRadius: "12px", background: inv.status === 'pending' ? "#FEF3C7" : "#ECFDF5", color: inv.status === 'pending' ? "#D97706" : "#10B981" }}>{inv.status.toUpperCase()}</span>
                <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={() => window.open(`/pay/${inv.id}`, '_blank')}>View Link</button>
                
                {/* WHATSAPP ONE-CLICK CHASER */}
                {inv.status === 'pending' && (
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hello! Just a reminder that your invoice for ₦${inv.amount.toLocaleString()} from ${user.business_name || "us"} is due. You can pay securely here: https://${window.location.host}/pay/${inv.id}`)}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "8px 16px", fontSize: "14px" }}>
                    Send Reminder
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================
// 8. PAYOUT CONFIGURATION (WITH PAYSTACK FAILSAFE)
// =========================================================
function PayoutSettings({ user, onSubaccountLinked }) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetupPayout = async (e) => {
    e.preventDefault();
    if (accountNumber.length !== 10) return alert("Account number must be 10 digits.");
    setLoading(true);
    
    // THE FAILSAFE: If the database is lagging, force a name through so Paystack accepts it.
    const safeBusinessName = user?.business_name || user?.email || "KudiSlip Verified Merchant";

    try {
      const res = await fetch("/api/create-subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          business_name: safeBusinessName, 
          bank_code: bankCode, 
          account_number: accountNumber 
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      await supabase.from("vendors").update({ paystack_subaccount_code: result.subaccount_code }).eq("id", user.id);
      onSubaccountLinked(result.subaccount_code);
      alert("Bank linked successfully!");
    } catch (error) { 
      alert("Failed to link bank. Error: " + error.message); 
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: "550px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Payout Configuration</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Connect your bank account to receive settlements.</div>
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px" }}>
        {user?.paystack_subaccount_code ? (
          <div style={{ padding: "20px", background: "#ECFDF5", border: `1px solid #10B981`, borderRadius: "8px", textAlign: "center" }}><div style={{ color: "#10B981", fontWeight: "800", fontSize: "16px" }}>✓ Settlements Active</div><div style={{ color: "#0F172A", fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>Paystack ID: {user.paystack_subaccount_code}</div></div>
        ) : (
          <form onSubmit={handleSetupPayout}>
            <div style={{ marginBottom: "20px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Bank</label><select className="form-input" value={bankCode} onChange={e=>setBankCode(e.target.value)} required><option value="">-- Select Bank --</option>{NIGERIAN_BANKS.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></div>
            <div style={{ marginBottom: "28px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Account Number</label><input className="form-input" maxLength={10} value={accountNumber} onChange={e=>setAccountNumber(e.target.value.replace(/\D/g,""))} required /></div>
            <button className="btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>{loading ? "Verifying..." : "Securely Link Bank Account"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// =========================================================
// MAIN APP ROUTER 
// =========================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("loading"); 
  const [activeTab, setActiveTab] = useState("invoices");
  const [publicInvoiceId, setPublicInvoiceId] = useState(null);

  useEffect(() => {
    if (initializationError) { setView("diagnostic_error"); return; }
    
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/pay/')) {
      // THE FIX: Automatically scrub any stray commas, spaces, or symbols from the URL!
      const rawId = currentPath.split('/pay/');
      const cleanId = rawId.replace(/[^a-zA-Z0-9-]/g, ''); 
      
      setPublicInvoiceId(cleanId);
      setView("public_invoice");
      return;
    }
    
    if (!supabase) { setView("landing"); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('vendors').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setUser({ ...session.user, ...data });
          setView("dashboard");
        });
      } else {
        setView("landing");
      }
    });
  }, []);

  if (view === "diagnostic_error") return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px", textAlign: "center", background: "#FFF1F2" }}>
      <GlobalStyles />
      <div style={{ color: DESIGN.error, fontSize: "22px", fontWeight: "900", marginBottom: "12px" }}>🚨 Configuration Warning</div>
      <div style={{ color: DESIGN.textMain, maxWidth: "500px", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>{initializationError}</div>
    </div>
  );

  if (view === "loading") return <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "600"}}><GlobalStyles />Loading Workspace...</div>;
  if (view === "public_invoice") return <PublicInvoice invoiceId={publicInvoiceId} />;
  if (view === "landing") return <LandingPage onNavigate={(v) => setView("auth")} />;
  if (view === "auth") return <KudiSlipAuth initialIsSignUp={false} onBack={() => setView("landing")} onLoginSuccess={(u) => { setUser(u); setView("dashboard"); }} />;

  return (
    <div className="dashboard-layout">
      <GlobalStyles />
      <div className="sidebar">
        <div className="sidebar-logo-container" style={{ padding: "0 32px", marginBottom: "40px" }}><img src="/logo.png" alt="KudiSlip" style={{ height: "40px", transform: "scale(2.2)", transformOrigin: "left center" }} /></div>
        <div className="sidebar-menu">
          <button className={`menu-btn ${activeTab === "invoices" ? "active" : ""}`} onClick={() => setActiveTab("invoices")}>Invoices & Analytics</button>
          <button className={`menu-btn ${activeTab === "clients" ? "active" : ""}`} onClick={() => setActiveTab("clients")}>Client Directory</button>
          <button className={`menu-btn ${activeTab === "payouts" ? "active" : ""}`} onClick={() => setActiveTab("payouts")}>Payout Settings</button>
          <button className={`menu-btn ${activeTab === "billing" ? "active" : ""}`} onClick={() => setActiveTab("billing")}>Billing & Plan</button>
          {user?.is_admin && (
            <button className={`menu-btn ${activeTab === "admin" ? "active" : ""}`} style={{ color: DESIGN.premium, borderTop: "1px dashed #E2E8F0", marginTop: "12px", paddingTop: "16px" }} onClick={() => setActiveTab("admin")}>🚨 Admin Operations</button>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: "16px 32px", marginTop: "auto" }}>
          <div style={{ fontSize: "12px", color: DESIGN.textMuted, fontWeight: "700", marginBottom: "12px" }}>{user?.business_name || user?.email}</div>
          <button className="menu-btn" style={{ padding: "0", color: DESIGN.error }} onClick={() => supabase.auth.signOut().then(() => setView("landing"))}>Log Out</button>
        </div>
      </div>
      <div className="main-content">
        {activeTab === "invoices" && <InvoiceGenerator user={user} />}
        {activeTab === "clients" && <ClientsManager user={user} />}
        {activeTab === "payouts" && <PayoutSettings user={user} onSubaccountLinked={(code) => setUser(prev => ({ ...prev, paystack_subaccount_code: code }))} />}
        {activeTab === "billing" && <SubscriptionManager user={user} onUpgradeSuccess={() => setUser({ ...user, subscription_tier: 'premium' })} />}
        {activeTab === "admin" && user?.is_admin && <SuperAdminDashboard />}
      </div>
    </div>
  );
}

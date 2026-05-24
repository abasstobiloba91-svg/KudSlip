import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// --- SUPABASE ARCHITECTURE CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- NIGERIAN COMMERCIAL BANKING CODES ---
const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "GTBank" },
  { code: "030", name: "Heritage Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "039", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "232", name: "Sterling Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

// --- CSS INJECTION FOR RESPONSIVENESS & HOVER EFFECTS ---
const GlobalStyles = () => (
  <style>{`
    body {
      margin: 0;
      padding: 0;
      background: #F8FAFC;
      color: #0F172A;
      font-family: system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Buttons & Hover Effects */
    .btn-primary {
      padding: 14px 28px;
      background: #000000;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary:hover:not(:disabled) {
      background: #333333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: transparent;
      color: #000000;
      border: 2px solid #000000;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background: #F1F5F9;
      transform: translateY(-2px);
    }

    .card-hover {
      transition: all 0.3s ease;
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
    }

    /* Inputs */
    .form-input {
      width: 100%;
      padding: 14px 16px;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      color: #0F172A;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }
    .form-input:focus {
      border-color: #000000;
    }

    /* Dashboard Layout */
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      flex-direction: row;
    }
    .sidebar {
      width: 260px;
      background: #FFFFFF;
      border-right: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      padding: 32px 0;
      flex-shrink: 0;
    }
    .sidebar-menu {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .menu-btn {
      display: block;
      width: 100%;
      padding: 16px 32px;
      background: transparent;
      border: none;
      border-left: 4px solid transparent;
      color: #64748B;
      text-align: left;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.15s ease;
    }
    .menu-btn:hover {
      background: #F8FAFC;
      color: #000000;
    }
    .menu-btn.active {
      background: #F1F5F9;
      border-left: 4px solid #000000;
      color: #000000;
      font-weight: 700;
    }
    .main-content {
      flex: 1;
      padding: 48px;
      box-sizing: border-box;
      overflow-y: auto;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 38px !important;
      }
      .nav-buttons {
        display: none !important; /* Hide auth buttons on mobile nav for clean look */
      }
      .features-grid {
        grid-template-columns: 1fr !important;
      }
      .dashboard-layout {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #E2E8F0;
        padding: 16px 0 0 0;
        min-height: auto;
      }
      .sidebar-logo-container {
        padding: 0 24px 16px 24px !important;
      }
      .sidebar-menu {
        flex-direction: row;
        overflow-x: auto;
        padding: 0 16px;
        white-space: nowrap;
        border-top: 1px solid #F1F5F9;
      }
      .menu-btn {
        padding: 14px 20px;
        border-left: none;
        border-bottom: 3px solid transparent;
        text-align: center;
      }
      .menu-btn.active {
        border-left: none;
        border-bottom: 3px solid #000000;
      }
      .main-content {
        padding: 24px 16px;
      }
      .auth-card {
        padding: 24px !important;
      }
    }
  `}</style>
);

// =========================================================
// 1. LANDING PAGE
// =========================================================
function LandingPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
        
        {/* Navigation */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid #E2E8F0` }}>
          <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
          <div className="nav-buttons" style={{ display: "flex", gap: "12px" }}>
            <button className="btn-secondary" onClick={() => onNavigate("auth", false)}>Log In</button>
            <button className="btn-primary" onClick={() => onNavigate("auth", true)}>Get Started Free</button>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ textAlign: "center", padding: "80px 0 60px" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "#F1F5F9", border: `1px solid #E2E8F0`, borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#64748B", marginBottom: "24px" }}>
            The #1 CRM & Invoicing Tool
          </div>
          <h1 className="hero-title" style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 24px", color: "#0F172A", lineHeight: "1.1" }}>
            Manage Customers.<br />Automate Payments.
          </h1>
          <p style={{ fontSize: "18px", color: "#64748B", maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.6" }}>
            KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements through automated Paystack routing.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ padding: "16px 36px", fontSize: "16px" }} onClick={() => onNavigate("auth", true)}>Create Your Account</button>
            {/* Mobile login button (hidden on desktop nav, shown here) */}
            <button className="btn-secondary" style={{ padding: "16px 36px", fontSize: "16px", display: window.innerWidth <= 768 ? "block" : "none" }} onClick={() => onNavigate("auth", false)}>Log In</button>
          </div>
        </main>

        {/* Feature Highlights */}
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", paddingBottom: "100px" }}>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Professional Invoicing</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Generate clean, branded invoices and receipts for your clients in seconds.</p>
          </div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Instant Settlements</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Link your Nigerian bank account and receive payments directly via Paystack.</p>
          </div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px 24px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Customer CRM</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Track client history, outstanding payments, and contact details seamlessly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 2. AUTHENTICATION
// =========================================================
function KudiSlipAuth({ onLoginSuccess, initialIsSignUp, onBack }) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData.user) {
          const { error: dbError } = await supabase.from('vendors').insert([
            { id: authData.user.id, business_name: businessName }
          ]);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <GlobalStyles />
      <button onClick={onBack} style={{ position: "absolute", top: "24px", left: "24px", background: "none", border: "none", color: "#64748B", cursor: "pointer", fontWeight: "600", fontSize: "14px", padding: "8px" }}>
        &larr; Back to Home
      </button>
      
      <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "54px", width: "auto", marginBottom: "24px", objectFit: "contain" }} />
      
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>

        <form onSubmit={handleAuth}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          
          {isSignUp && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Business Name</label>
              <input className="form-input" placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
            </div>
          )}
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Email Address</label>
            <input className="form-input" type="email" placeholder="merchant@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div style={{ marginBottom: "28px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button className="btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
          </button>
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
// 3. PAYOUT SETTINGS (DASHBOARD)
// =========================================================
function PayoutSettings({ user, onSubaccountLinked }) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSetupPayout = async (e) => {
    e.preventDefault();
    if (accountNumber.length !== 10) {
      setErr("Nigerian account numbers must be exactly 10 digits long.");
      return;
    }
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/create-subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: user.business_name || "KudiSlip Merchant",
          bank_code: bankCode,
          account_number: accountNumber
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Paystack connection timeout.");

      const { error: dbError } = await supabase
        .from("vendors")
        .update({ paystack_subaccount_code: result.subaccount_code })
        .eq("id", user.id);

      if (dbError) throw dbError;

      onSubaccountLinked(result.subaccount_code);
      alert("Banking details verified and linked successfully!");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "550px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Payout Configuration</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px", lineHeight: "1.6" }}>
        Connect your bank account. Invoices generated through your dashboard will automatically settle into this account, deducting our standard 1.5% platform fee.
      </div>
      
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        {user.paystack_subaccount_code ? (
          <div style={{ padding: "20px", background: "#ECFDF5", border: `1px solid #10B981`, borderRadius: "8px", textAlign: "center" }}>
            <div style={{ color: "#10B981", fontWeight: "800", fontSize: "16px", marginBottom: "4px" }}>✓ Settlements Active</div>
            <div style={{ color: "#0F172A", fontSize: "13px", fontWeight: "600" }}>Paystack ID: <span style={{color: "#64748B"}}>{user.paystack_subaccount_code}</span></div>
          </div>
        ) : (
          <form onSubmit={handleSetupPayout}>
            {err && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{err}</div>}
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Financial Institution</label>
              <select className="form-input" value={bankCode} onChange={e => setBankCode(e.target.value)} required>
                <option value="">-- Select Bank --</option>
                {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: "28px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>10-Digit Account Number</label>
              <input className="form-input" type="text" maxLength={10} placeholder="0123456789" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))} required />
            </div>
            
            <button className="btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Verifying..." : "Securely Link Bank Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// =========================================================
// 4. MAIN APP ROUTER & DASHBOARD CONTAINER
// =========================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("landing"); //

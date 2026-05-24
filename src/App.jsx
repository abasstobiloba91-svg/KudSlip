import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// --- SUPABASE CONFIGURATION ---
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

// --- ENTERPRISE MONOCHROME DESIGN SYSTEM ---
const DESIGN = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E8F0",
  primary: "#000000", // Solid black to match the logo
  primaryHover: "#333333",
  textMain: "#0F172A",
  textMuted: "#64748B",
  error: "#EF4444",
  success: "#10B981"
};

const styles = {
  appWrapper: { minHeight: "100vh", background: DESIGN.bg, color: DESIGN.textMain, fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid ${DESIGN.border}` },
  card: { background: DESIGN.card, border: `1px solid ${DESIGN.border}`, borderRadius: 12, padding: "32px", boxSizing: "border-box", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
  input: { width: "100%", padding: "14px 16px", background: "#F1F5F9", border: `1px solid ${DESIGN.border}`, borderRadius: 8, color: DESIGN.textMain, fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  buttonPrimary: { padding: "14px 28px", background: DESIGN.primary, color: "#FFF", border: "none", borderRadius: 8, fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "background 0.2s" },
  buttonSecondary: { padding: "14px 28px", background: "transparent", color: DESIGN.primary, border: `2px solid ${DESIGN.primary}`, borderRadius: 8, fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "background 0.2s" },
  label: { fontSize: "12px", color: DESIGN.textMuted, display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
  sidebar: { width: "260px", background: DESIGN.surface, borderRight: `1px solid ${DESIGN.border}`, display: "flex", flexDirection: "column", padding: "32px 0", minHeight: "100vh" },
  sidebarBtn: (isActive) => ({ display: "block", width: "100%", padding: "16px 32px", background: isActive ? "#F1F5F9" : "transparent", border: "none", borderLeft: isActive ? `4px solid ${DESIGN.primary}` : "4px solid transparent", color: isActive ? DESIGN.primary : DESIGN.textMuted, textAlign: "left", cursor: "pointer", fontWeight: isActive ? "700" : "500", fontSize: "14px" }),
};

// =========================================================
// 1. LANDING PAGE
// =========================================================
function LandingPage({ onNavigate }) {
  return (
    <div style={styles.appWrapper}>
      <div style={styles.container}>
        {/* Navigation */}
        <nav style={styles.navbar}>
          <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "40px" }} />
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ ...styles.buttonSecondary, padding: "10px 20px", fontSize: "14px" }} onClick={() => onNavigate("auth", false)}>Log In</button>
            <button style={{ ...styles.buttonPrimary, padding: "10px 20px", fontSize: "14px" }} onClick={() => onNavigate("auth", true)}>Get Started Free</button>
          </div>
        </nav>

        {/* Hero Section */}
        <main style={{ textAlign: "center", padding: "100px 0 80px" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: "#F1F5F9", border: `1px solid ${DESIGN.border}`, borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: DESIGN.textMuted, marginBottom: "24px" }}>
            The #1 CRM & Invoicing Tool
          </div>
          <h1 style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 24px", color: DESIGN.textMain, lineHeight: "1.1" }}>
            Manage Customers.<br />Automate Payments.
          </h1>
          <p style={{ fontSize: "18px", color: DESIGN.textMuted, maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.6" }}>
            KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements through automated Paystack routing.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <button style={{ ...styles.buttonPrimary, padding: "16px 36px", fontSize: "16px" }} onClick={() => onNavigate("auth", true)}>Create Your Account</button>
          </div>
        </main>

        {/* Feature Highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", paddingBottom: "100px" }}>
          <div style={{ ...styles.card, padding: "32px 24px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Professional Invoicing</h3>
            <p style={{ color: DESIGN.textMuted, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Generate clean, branded invoices and receipts for your clients in seconds.</p>
          </div>
          <div style={{ ...styles.card, padding: "32px 24px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Instant Settlements</h3>
            <p style={{ color: DESIGN.textMuted, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Link your Nigerian bank account and receive payments directly via Paystack.</p>
          </div>
          <div style={{ ...styles.card, padding: "32px 24px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Customer CRM</h3>
            <p style={{ color: DESIGN.textMuted, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Track client history, outstanding payments, and contact details seamlessly.</p>
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
    <div style={{ ...styles.appWrapper, justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <button onClick={onBack} style={{ position: "absolute", top: "24px", left: "24px", background: "none", border: "none", color: DESIGN.textMuted, cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
        &larr; Back to Home
      </button>
      
      <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "60px", marginBottom: "24px" }} />
      
      <div style={{ ...styles.card, width: "100%", maxWidth: "420px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>

        <form onSubmit={handleAuth}>
          {error && <div style={{ color: DESIGN.error, background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          
          {isSignUp && (
            <div style={{ marginBottom: "16px" }}>
              <label style={styles.label}>Business Name</label>
              <input style={styles.input} placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
            </div>
          )}
          
          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" placeholder="merchant@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div style={{ marginBottom: "28px" }}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button style={{ ...styles.buttonPrimary, width: "100%" }} type="submit" disabled={loading}>
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", color: DESIGN.textMuted, fontSize: "14px" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span style={{ color: DESIGN.primary, fontWeight: "800", cursor: "pointer" }} onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
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
      <div style={{ color: DESIGN.textMuted, marginBottom: "36px", fontSize: "15px", lineHeight: "1.6" }}>
        Connect your bank account. Invoices generated through your dashboard will automatically settle into this account, deducting our standard 1.5% platform fee.
      </div>
      
      <div style={styles.card}>
        {user.paystack_subaccount_code ? (
          <div style={{ padding: "20px", background: "#ECFDF5", border: `1px solid ${DESIGN.success}`, borderRadius: "8px", textAlign: "center" }}>
            <div style={{ color: DESIGN.success, fontWeight: "800", fontSize: "16px", marginBottom: "4px" }}>✓ Settlements Active</div>
            <div style={{ color: DESIGN.textMain, fontSize: "13px", fontWeight: "600" }}>Paystack ID: <span style={{color: DESIGN.textMuted}}>{user.paystack_subaccount_code}</span></div>
          </div>
        ) : (
          <form onSubmit={handleSetupPayout}>
            {err && <div style={{ color: DESIGN.error, background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{err}</div>}
            
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.label}>Financial Institution</label>
              <select style={styles.input} value={bankCode} onChange={e => setBankCode(e.target.value)} required>
                <option value="">-- Select Bank --</option>
                {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: "28px" }}>
              <label style={styles.label}>10-Digit Account Number</label>
              <input style={styles.input} type="text" maxLength={10} placeholder="0123456789" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))} required />
            </div>
            
            <button type="submit" style={{ ...styles.buttonPrimary, width: "100%" }} disabled={loading}>
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
  const [view, setView] = useState("landing"); // 'landing', 'auth', 'dashboard'
  const [authSignUpIntent, setAuthSignUpIntent] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('vendors').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setUser({ ...session.user, ...data });
          setView("dashboard");
        });
      }
      setLoadingWorkspace(false);
    });
  }, []);

  const handleNavigateToAuth = (isSignUp) => {
    setAuthSignUpIntent(isSignUp);
    setView("auth");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("landing");
  };

  if (loadingWorkspace) {
    return (
      <div style={{ ...styles.appWrapper, alignItems: "center", justifyContent: "center" }}>
        <img src="/logo.png" alt="KudiSlip" style={{ height: "40px", marginBottom: "16px" }} />
        <div style={{ color: DESIGN.textMuted, fontSize: "14px", fontWeight: "500" }}>Loading KudiSlip...</div>
      </div>
    );
  }

  if (view === "landing") {
    return <LandingPage onNavigate={(v, isSignUp) => handleNavigateToAuth(isSignUp)} />;
  }

  if (view === "auth") {
    return <KudiSlipAuth initialIsSignUp={authSignUpIntent} onBack={() => setView("landing")} onLoginSuccess={(u) => { setUser(u); setView("dashboard"); }} />;
  }

  // Dashboard View
  return (
    <div style={{ ...styles.appWrapper, flexDirection: "row" }}>
      <div style={styles.sidebar}>
        <div style={{ padding: "0 32px", marginBottom: "40px" }}>
          <img src="/logo.png" alt="KudiSlip" style={{ height: "32px" }} />
        </div>
        <button style={styles.sidebarBtn(activeTab === "invoices")} onClick={() => setActiveTab("invoices")}>Invoices & CRM</button>
        <button style={styles.sidebarBtn(activeTab === "payouts")} onClick={() => setActiveTab("payouts")}>Payout Settings</button>
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 32px", marginBottom: "16px", fontSize: "12px", color: DESIGN.textMuted, fontWeight: "600" }}>
          {user.business_name}
        </div>
        <button style={styles.sidebarBtn(false)} onClick={handleLogout}>Log Out</button>
      </div>

      <div style={styles.mainContent}>
        {activeTab === "payouts" && (
          <PayoutSettings user={user} onSubaccountLinked={(code) => setUser(prev => ({ ...prev, paystack_subaccount_code: code }))} />
        )}
        {activeTab === "invoices" && (
          <div>
            <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>CRM & Invoicing</div>
            <div style={{ color: DESIGN.textMuted, fontSize: "15px", marginBottom: "28px" }}>Create and manage customer invoices here.</div>
            
            {!user.paystack_subaccount_code ? (
              <div style={{ padding: "20px", background: "#FEF2F2", border: `1px solid ${DESIGN.error}`, borderRadius: "8px", display: "inline-block", maxWidth: "600px" }}>
                <div style={{ color: DESIGN.error, fontWeight: "800", marginBottom: "6px", fontSize: "15px" }}>Action Required: Payout Target Missing</div>
                <div style={{ color: DESIGN.textMain, fontSize: "14px", lineHeight: "1.6" }}>
                  You cannot generate active billing links for customers until you link a direct payout institution. Please click on <strong>Payout Settings</strong> on your sidebar to connect your bank account.
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px", background: DESIGN.card, border: `1px dashed ${DESIGN.border}`, borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Ready to create your first invoice</div>
                <div style={{ color: DESIGN.textMuted, fontSize: "14px", marginBottom: "24px" }}>Click below to generate a new billing link for a customer.</div>
                <button style={styles.buttonPrimary}>+ Create New Invoice</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

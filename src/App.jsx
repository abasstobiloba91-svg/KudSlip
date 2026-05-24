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

// --- KUDISLIP PREMIUM DARK DESIGN SYSTEM ---
const DESIGN_SYSTEM = {
  bg: "#0A0D14",
  surface: "#121620",
  card: "#1A1F2B",
  border: "rgba(255,255,255,0.08)",
  primary: "#00E676", // Money Green
  textMain: "#FFFFFF",
  textMuted: "#8B95A5",
  error: "#FF3B30"
};

const styles = {
  appWrapper: { minHeight: "100vh", background: DESIGN_SYSTEM.bg, color: DESIGN_SYSTEM.textMain, fontFamily: "system-ui, sans-serif", display: "flex" },
  authWrapper: { minHeight: "100vh", background: DESIGN_SYSTEM.bg, color: DESIGN_SYSTEM.textMain, fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" },
  sidebar: { width: "260px", background: DESIGN_SYSTEM.surface, borderRight: `1px solid ${DESIGN_SYSTEM.border}`, display: "flex", flexDirection: "column", padding: "32px 0" },
  sidebarMenuBtn: (isActive) => ({ display: "block", width: "100%", padding: "16px 32px", background: isActive ? "rgba(0, 230, 118, 0.06)" : "transparent", border: "none", borderLeft: isActive ? `4px solid ${DESIGN_SYSTEM.primary}` : "4px solid transparent", color: isActive ? DESIGN_SYSTEM.textMain : DESIGN_SYSTEM.textMuted, textAlign: "left", cursor: "pointer", fontWeight: isActive ? "700" : "500", fontSize: "14px", outline: "none", transition: "all 0.15s ease" }),
  mainContent: { flex: 1, padding: "48px", boxSizing: "border-box", overflowY: "auto" },
  card: { background: DESIGN_SYSTEM.card, border: `1px solid ${DESIGN_SYSTEM.border}`, borderRadius: 16, padding: "28px", boxSizing: "border-box", marginBottom: "24px" },
  input: { width: "100%", padding: "14px 16px", background: DESIGN_SYSTEM.surface, border: `1px solid ${DESIGN_SYSTEM.border}`, borderRadius: 10, color: DESIGN_SYSTEM.textMain, fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  buttonPrimary: { padding: "14px 28px", background: DESIGN_SYSTEM.primary, color: "#000", border: "none", borderRadius: 10, fontWeight: "800", fontSize: "15px", cursor: "pointer", transition: "opacity 0.2s" },
  label: { fontSize: "11px", color: DESIGN_SYSTEM.textMuted, display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }
};

// =========================================================
// FEATURE 1: CORE GATEWAY AUTHENTICATION (SPRINT 1)
// =========================================================
function KudiSlipAuth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
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
    <div style={styles.authWrapper}>
      <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "6px", letterSpacing: "-1px" }}>
        KudiSlip<span style={{ color: DESIGN_SYSTEM.primary }}>.</span>
      </div>
      <div style={{ color: DESIGN_SYSTEM.textMuted, fontSize: "14px", marginBottom: "36px" }}>Professional invoicing with instant payout settlement splits.</div>
      
      <div style={{ ...styles.card, width: "100%", maxWidth: "420px" }}>
        <form onSubmit={handleAuth}>
          {error && <div style={{ color: DESIGN_SYSTEM.error, marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{error}</div>}
          
          {isSignUp && (
            <div style={{ marginBottom: "16px" }}>
              <label style={styles.label}>Registered Trading / Business Name</label>
              <input style={styles.input} placeholder="e.g. Famous Stores" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
            </div>
          )}
          
          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" placeholder="merchant@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div style={{ marginBottom: "28px" }}>
            <label style={styles.label}>Secure Account Password</label>
            <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button style={{ ...styles.buttonPrimary, width: "100%" }} type="submit" disabled={loading}>
            {loading ? "Authorizing Profile..." : (isSignUp ? "Create Merchant Account" : "Access Workspace")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", color: DESIGN_SYSTEM.textMuted, fontSize: "14px" }}>
          {isSignUp ? "Already operating on KudiSlip? " : "New to the automated ledger? "}
          <span style={{ color: DESIGN_SYSTEM.primary, fontWeight: "700", cursor: "pointer" }} onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
            {isSignUp ? "Sign In" : "Sign Up Free"}
          </span>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// FEATURE 2: AUTOMATED PAYSTACK SUBACCOUNTS (SPRINT 2)
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
      // Connect safely to your secure serverless runtime endpoint
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

      // Link backend payload reference into user table mapping
      const { error: dbError } = await supabase
        .from("vendors")
        .update({ paystack_subaccount_code: result.subaccount_code })
        .eq("id", user.id);

      if (dbError) throw dbError;

      onSubaccountLinked(result.subaccount_code);
      alert("Banking node verified and linked successfully!");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "550px" }}>
      <div style={{ fontSize: "26px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Payout Configuration</div>
      <div style={{ color: DESIGN_SYSTEM.textMuted, marginBottom: "36px", fontSize: "14px", lineHeight: "1.5" }}>
        Connect your localized financial bank node. Invoices generated through your dashboard will automatically isolate and credit settlements directly, deducting our flat 1.5% application platform fee.
      </div>
      
      <div style={styles.card}>
        {user.paystack_subaccount_code ? (
          <div style={{ padding: "20px", background: "rgba(0, 230, 118, 0.03)", border: `1px solid ${DESIGN_SYSTEM.primary}`, borderRadius: "12px", textAlign: "center" }}>
            <div style={{ color: DESIGN_SYSTEM.primary, fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>✓ Instant Processing Active</div>
            <div style={{ color: DESIGN_SYSTEM.textMuted, fontSize: "13px" }}>Paystack Node Identifier: {user.paystack_subaccount_code}</div>
          </div>
        ) : (
          <form onSubmit={handleSetupPayout}>
            {err && <div style={{ color: DESIGN_SYSTEM.error, marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{err}</div>}
            
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.label}>Settlement Financial Institution</label>
              <select style={styles.input} value={bankCode} onChange={e => setBankCode(e.target.value)} required>
                <option value="">-- Choose Your Bank Source --</option>
                {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: "28px" }}>
              <label style={styles.label}>10-Digit NUBAN Account Number</label>
              <input style={styles.input} type="text" maxLength={10} placeholder="e.g. 0123456789" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))} required />
            </div>
            
            <button type="submit" style={{ ...styles.buttonPrimary, width: "100%" }} disabled={loading}>
              {loading ? "Running CBN Verification Checks..." : "Verify & Lock Payout Node"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// =========================================================
// 4. MAIN GLOBAL SAAS APP CONTAINER
// =========================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    // Monitor local active storage keys
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('vendors').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setUser({ ...session.user, ...data });
        });
      }
      setLoadingWorkspace(false);
    });
  }, []);

  if (loadingWorkspace) {
    return (
      <div style={{ background: DESIGN_SYSTEM.bg, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFF", fontFamily: "system-ui" }}>
        <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "8px" }}>KudiSlip<span style={{ color: DESIGN_SYSTEM.primary }}>.</span></div>
        <div style={{ color: DESIGN_SYSTEM.textMuted, fontSize: "14px" }}>Initializing Cloud Matrix Ledger...</div>
      </div>
    );
  }

  return user ? (
    <div style={styles.appWrapper}>
      {/* PERSISTENT RUNTIME SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{ padding: "0 28px", marginBottom: "40px", fontSize: "24px", fontWeight: "900", letterSpacing: "-1px" }}>
          KudiSlip<span style={{ color: DESIGN_SYSTEM.primary }}>.</span>
        </div>
        <button style={styles.sidebarMenuBtn(activeTab === "invoices")} onClick={() => setActiveTab("invoices")}>Invoices & Billing</button>
        <button style={styles.sidebarMenuBtn(activeTab === "payouts")} onClick={() => setActiveTab("payouts")}>Settlement Payouts</button>
        <div style={{ flex: 1 }} />
        <button style={styles.sidebarMenuBtn(false)} onClick={() => supabase.auth.signOut()}>Disconnect Ledger</button>
      </div>

      {/* CORE WORKSPACE APPLICATION VIEWS */}
      <div style={styles.mainContent}>
        {activeTab === "payouts" && (
          <PayoutSettings user={user} onSubaccountLinked={(code) => setUser(prev => ({ ...prev, paystack_subaccount_code: code }))} />
        )}
        {activeTab === "invoices" && (
          <div>
            <div style={{ fontSize: "26px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>Invoice Infrastructure Engine</div>
            <div style={{ color: DESIGN_SYSTEM.textMuted, fontSize: "14px", marginBottom: "24px" }}>The billing generator architecture under Phase 3 maps here dynamically.</div>
            
            {!user.paystack_subaccount_code && (
              <div style={{ padding: "20px", background: "rgba(255, 59, 48, 0.03)", border: `1px solid ${DESIGN_SYSTEM.error}`, borderRadius: "12px", display: "inline-block", maxWidth: "600px" }}>
                <div style={{ color: DESIGN_SYSTEM.error, fontWeight: "700", marginBottom: "4px" }}>Action Required: Payout Target Missing</div>
                <div style={{ color: DESIGN_SYSTEM.textMuted, fontSize: "13px", lineHeight: "1.5" }}>
                  You cannot generate active billing links for customers until you link a direct payout institution. Please click on <strong>Settlement Payouts</strong> on your sidebar workspace to authenticate your bank profile.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <KudiSlipAuth onLoginSuccess={(u) => setUser(u)} />
  );
}

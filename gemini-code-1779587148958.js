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
          {error &&
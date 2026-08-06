import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ onLoginSuccess, initialIsSignUp, showToast }) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");

    try {
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

  const handleAuth = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError("");
    
    try {
      if (!isSignUp) {
        const loginRes = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (loginRes.error) throw loginRes.error;
        
        const vendorRes = await supabase.from('vendors').select('*').eq('id', loginRes.data.user.id).single();
        const mergedUser = Object.assign({}, loginRes.data.user, vendorRes.data);
        onLoginSuccess(mergedUser);
        window.location.href = "/dashboard/invoices";
        return; 
      }
      
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
      <a href="/" style={{ textDecoration: "none", position: "absolute", top: "24px", left: "24px", color: "#64748B", fontWeight: "600", fontSize: "14px", padding: "8px" }} className="btn-hover">&larr; Back to Home</a>
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} /></div>
      
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 24px", textAlign: "center" }}>
          {isResettingPassword ? "Reset your password" : isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        
        <form onSubmit={isResettingPassword ? handleResetPassword : handleAuth}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", border: "1px solid #FECACA" }}>{error}</div>}
          
          {isSignUp && !isResettingPassword && <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Business Name</label><input className="form-input" placeholder="e.g. Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} required /></div>}
          
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
              
              {!isSignUp && (
                <div style={{ textAlign: "right", marginBottom: "24px" }}>
                   <span onClick={() => setIsResettingPassword(true)} style={{ fontSize: "12px", color: "#8B5CF6", fontWeight: "700", cursor: "pointer", textDecoration: "none" }}>Forgot Password?</span>
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

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure this path points to your actual supabase file!

// (If you have a GlobalStyles import, keep it up here too)
// import { GlobalStyles } from './SomeFile'; 

function UpdatePassword({ showToast }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      if (showToast) {
        showToast("Success!", "Your password has been securely updated.", "success");
      } else {
        alert("Password updated successfully!");
      }
      
      setTimeout(() => {
        window.location.href = "/dashboard/invoices"; 
      }, 1500);

    } catch (err) {
      setError(err.message);
      if (showToast) showToast("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#F8FAFC", fontFamily: "inherit" }}>
      {/* If GlobalStyles is undefined, just remove the line below */}
      {/* <GlobalStyles /> */}
      
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} />
      </div>
      
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 8px", textAlign: "center", color: "#000000", letterSpacing: "-0.5px", fontFamily: "inherit" }}>
          Set New Password
        </h2>
        <p style={{ textAlign: "center", color: "#64748B", fontSize: "14px", marginBottom: "24px", fontWeight: "500", fontFamily: "inherit" }}>
          Please enter and confirm your new secure password below.
        </p>
        
        <form onSubmit={handleUpdatePassword}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "700", border: "1px solid #FECACA", fontFamily: "inherit" }}>{error}</div>}
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "800", textTransform: "uppercase", fontFamily: "inherit" }}>New Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              style={{ fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "800", textTransform: "uppercase", fontFamily: "inherit" }}>Confirm Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              style={{ fontFamily: "inherit" }}
            />
          </div>

          <button className="btn-primary btn-hover" style={{ width: "100%", padding: "16px", borderRadius: "8px", background: "#000000", color: "#FFFFFF", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "15px", fontFamily: "inherit" }} type="submit" disabled={loading}>
            {loading ? "Updating..." : "Securely Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================================================
// SECURITY: 24-Hour Inactivity Auto-Logout
// =========================================================
export function useIdleLogout(supabaseClient) {
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 24 hours in milliseconds (86,400,000 ms)
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
    resetTimer(); // Start the clock

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [supabaseClient]);
}

export default UpdatePassword;

// =========================================================
// UPDATE PASSWORD COMPONENT (SECURE & BRAND ALIGNED)
// =========================================================
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
      
      // Redirect straight to dashboard workspace
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#F8FAFC" }}>
      {/* Inject clean structural typography rules for absolute global matching */}
      <GlobalStyles />
      <style>{`
        .auth-card h2, .auth-card p, .auth-card label, .auth-card input, .auth-card button {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}</style>
      
      <div style={{ height: "60px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "50px", transform: "scale(2)", transformOrigin: "center center" }} />
      </div>
      
      <div className="auth-card card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "40px", width: "100%", maxWidth: "420px", boxSizing: "border-box", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 8px", textAlign: "center", color: "#000000", letterSpacing: "-0.5px" }}>
          Set New Password
        </h2>
        <p style={{ textAlign: "center", color: "#64748B", fontSize: "14px", marginBottom: "24px", fontWeight: "500" }}>
          Please enter and confirm your new secure password below.
        </p>
        
        <form onSubmit={handleUpdatePassword}>
          {error && <div style={{ color: "#EF4444", background: "#FEF2F2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "700", border: "1px solid #FECACA" }}>{error}</div>}
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "800", textTransform: "uppercase" }}>New Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "800", textTransform: "uppercase" }}>Confirm Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <button className="btn-primary btn-hover" style={{ width: "100%", padding: "16px", borderRadius: "8px", background: "#000000", color: "#FFFFFF", fontWeight: "800", border: "none", cursor: "pointer", fontSize: "15px" }} type="submit" disabled={loading}>
            {loading ? "Updating..." : "Securely Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

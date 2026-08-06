import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function PayoutSettings({ user, showToast }) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 🛡️ NEW SECURITY STATES
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => {
    if (user?.bank_code) setBankCode(user.bank_code);
    if (user?.account_number) setAccountNumber(user.account_number);
    if (user?.account_name) setResolvedName(user.account_name); 
  }, [user]);

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

  useEffect(() => {
    if (isEditing || !user?.bank_code) {
      if (accountNumber.length === 10 && bankCode) {
        verifyAccount();
      } else {
        setResolvedName("");
      }
    }
  }, [accountNumber, bankCode, isEditing, user]);

  const verifyAccount = async () => {
    setIsResolving(true);
    setResolvedName("");
    try {
      const response = await fetch('/api/resolve-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode })
      });
      const data = await response.json();
      if (response.ok && data.account_name) setResolvedName(data.account_name);
      else showToast("Verification Failed", data.error || "Could not verify this account number.", "error");
    } catch (err) {
      showToast("Network Error", "Failed to contact bank servers.", "error");
    } finally {
      setIsResolving(false);
    }
  };

  // 🛡️ TRIGGER THE OTP EMAIL
  const handleRequestUpdate = async () => {
    setOtpSending(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, vendorId: user.id, businessName: user.business_name })
      });
      if (!res.ok) throw new Error("Failed to send security code.");
      
      setOtpMode(true);
      showToast("Verification Code Sent", "Please check your email for the 6-digit code.", "info");
    } catch (e) {
      showToast("Error", e.message, "error");
    } finally {
      setOtpSending(false);
    }
  };

  // 🛡️ VERIFY THE OTP TO UNLOCK THE FORM
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return showToast("Invalid Format", "OTP must be exactly 6 digits.", "error");
    
    setOtpVerifying(true);
    
    // Fetch the stored OTP securely directly from the database
    const { data, error } = await supabase.from('vendors').select('otp_code, otp_expires_at').eq('id', user.id).single();
    
    if (error || !data) {
      showToast("Security Error", "Could not verify authorization.", "error");
    } else if (data.otp_code !== otpCode) {
      showToast("Invalid Code", "The security code you entered is incorrect.", "error");
    } else if (new Date(data.otp_expires_at) < new Date()) {
      showToast("Code Expired", "This code has expired. Please request a new one.", "error");
    } else {
      // 🔓 SUCCESS! WIPE THE FORM CLEAN AND UNLOCK IT
      setOtpMode(false);
      setIsEditing(true);
      setOtpCode("");
      setBankCode(""); // Clears old bank
      setAccountNumber(""); // Clears old account number
      setResolvedName(""); // Clears old verified name
      showToast("Identity Verified", "You may now enter your new bank details.", "success");
    }
    
    setOtpVerifying(false);
  };

const handleLinkBank = async (e) => {
    e.preventDefault();
    if (!resolvedName) return showToast("Verification Required", "Please wait for your account name to be verified.", "error");
    setLoading(true);
    
    try {
      // 🧠 SMART ROUTING: Check if they already have a Paystack Subaccount
      const isUpdating = !!user.paystack_subaccount_code;
      const endpoint = isUpdating ? '/api/update-subaccount' : '/api/create-subaccount';
      
      const payload = isUpdating 
        ? {
            subaccount_code: user.paystack_subaccount_code, // Tell Paystack which one to overwrite
            account_number: accountNumber,
            bank_code: bankCode,
            business_name: user.business_name || "KudiSlip Vendor"
          }
        : {
            account_number: accountNumber,
            bank_code: bankCode,
            business_name: user.business_name || "KudiSlip Vendor",
            vendor_id: user.id,
            percentage_charge: 0 
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Paystack rejected these details.");

      // 💾 Save the new bank details to KudiSlip's Database
      const updateData = {
        bank_code: bankCode, 
        account_number: accountNumber,
        account_name: resolvedName
      };

      // If we created a BRAND NEW subaccount, save the new code to the database
      // If we just updated an old one, keep the existing code!
      if (!isUpdating && data.subaccount_code) {
        updateData.paystack_subaccount_code = data.subaccount_code;
      }

      const { error: dbError } = await supabase.from('vendors').update(updateData).eq('id', user.id);
      if (dbError) throw dbError;

      showToast("Bank Updated!", "Your new routing details have been verified and saved.", "success");
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err) {
      showToast("Link Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const hasLinkedBank = user?.bank_code && user?.account_number;
  const linkedBankName = NIGERIAN_BANKS.find(b => b.code === user?.bank_code)?.name || "Your Linked Bank";
  const maskedAccount = user?.account_number ? `•••• •••• ${user.account_number.slice(-4)}` : "";
  const displayAccountName = resolvedName || user?.account_name || "VERIFYING HOLDER...";
  const watermarkPattern = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ctext x='10' y='50' font-family='sans-serif' font-size='14' font-weight='bold' transform='rotate(-45 50 50)'%3EKudiSlip%3C/text%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div style={{ maxWidth: "600px" }}>
      
      {/* 🛡️ OTP MODAL OVERLAY */}
      {otpMode && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", textAlign: "center", animation: "toastSlideIn 0.3s ease" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6", margin: "0 auto 20px auto" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#0F172A" }}>Security Verification</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
              To protect your money, we sent a 6-digit verification code to <strong>{user.email}</strong>.
            </p>
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <input 
                className="form-input" 
                type="text" 
                maxLength="6"
                placeholder="Enter 6-digit code" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "900", padding: "16px" }}
                required 
              />
              <button className="btn-primary btn-hover" type="submit" disabled={otpVerifying} style={{ padding: "14px", fontSize: "15px" }}>
                {otpVerifying ? "Verifying..." : "Verify & Unlock"}
              </button>
              <button type="button" className="btn-secondary btn-hover" style={{ padding: "14px", border: "none", color: "#64748B", background: "transparent" }} onClick={() => setOtpMode(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Payout Settings</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your automated settlement destination.</div>
      
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
        
        {hasLinkedBank && !isEditing ? (
          <div style={{ padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              <div style={{ width: "48px", height: "48px", background: "#000000", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 4px 0", color: "#0F172A" }}>Settlement Route Active</h3>
                <div style={{ color: "#10B981", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified by Paystack
                </div>
              </div>
            </div>
            
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "32px" }}>
              Your automated payout destination is securely linked. All paid invoices will be routed directly to this verified bank account.
            </p>

            <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", backgroundImage: watermarkPattern + ", linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", padding: "32px", borderRadius: "20px", marginBottom: "32px", position: "relative", overflow: "hidden", color: "#FFF", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", position: "relative", zIndex: 1 }}>
                <div style={{ width: "45px", height: "35px", background: "linear-gradient(135deg, #FCD34D 0%, #D97706 100%)", borderRadius: "6px", opacity: 0.9 }}></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              </div>
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFFFFF", letterSpacing: "4px", fontFamily: "'Courier New', Courier, monospace", marginBottom: "24px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {maskedAccount}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Account Holder</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFFFFF", letterSpacing: "1px", textTransform: "uppercase" }}>{displayAccountName}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Bank</div>
                     <div style={{ fontSize: "14px", fontWeight: "800", color: "#FFFFFF" }}>{linkedBankName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🛡️ THE NEW SECURE UPDATE BUTTON */}
            <button onClick={handleRequestUpdate} disabled={otpSending} className="btn-secondary btn-hover" style={{ width: "100%", padding: "14px", background: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              {otpSending ? "Securing Session..." : "Securely Update Details"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleLinkBank} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Bank Name</label>
              <select className="form-input" value={bankCode} onChange={e => { setBankCode(e.target.value); setResolvedName(""); }} required>
                {NIGERIAN_BANKS.map((b) => <option key={b.name} value={b.code} disabled={b.code === ""}>{b.name}</option>)}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Account Number</label>
              <input type="number" className="form-input" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required placeholder="e.g. 0123456789" />
            </div>

            {isResolving && (
              <div style={{ padding: "12px", background: "#F1F5F9", borderRadius: "8px", color: "#64748B", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
                Verifying account details with NIBSS...
              </div>
            )}

            {resolvedName && !isResolving && (
              <div style={{ padding: "16px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#10B981", textTransform: "uppercase" }}>Verified Account Name</div>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#065F46" }}>{resolvedName}</div>
              </div>
            )}
            
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button className="btn-primary btn-hover" type="submit" disabled={loading || !resolvedName} style={{ padding: "16px", flex: 1, opacity: (!resolvedName) ? 0.5 : 1 }}>
                {loading ? "Linking..." : "Securely Link Bank"}
              </button>
              
              {hasLinkedBank && (
                <button type="button" onClick={() => { setIsEditing(false); setBankCode(user.bank_code); setAccountNumber(user.account_number); setResolvedName(user.account_name); }} className="btn-hover" style={{ padding: "16px 24px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
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
export default PayoutSettings;

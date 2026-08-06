import React, { useState, useEffect } from 'react';
import { supabase, DESIGN } from '../supabaseClient';

function SubscriptionManager({ user, onUpgradeSuccess, showToast }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isPremium = user?.subscription_tier === 'premium';

  const handleUpgrade = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in Vercel.", "error");

    setIsProcessing(true);
    
    // Dynamically call Paystack v2 Engine to bypass mobile Safari/Chrome iframe blocks
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    
    script.onload = () => {
      try {
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: PAYSTACK_PUBLIC_KEY,
          email: user?.email || "vendor@kudislip.com",
          amount: 15000 * 100, // ₦15,000 in kobo
          currency: "NGN",
          onSuccess: async function(transaction) {
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
          onCancel: function() {
            setIsProcessing(false);
            showToast("Cancelled", "Upgrade transaction closed.", "info");
          }
        });
      } catch (err) {
        setIsProcessing(false);
        showToast("Initialization Error", err.message, "error");
      }
    };

    script.onerror = () => {
      setIsProcessing(false);
      showToast("Network Error", "Failed to compile the secure checkout system window.", "error");
    };

    document.body.appendChild(script);
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
          {!isPremium && <button className="btn-primary btn-premium btn-hover" style={{ width: "100%", padding: "14px", display: "block" }} onClick={handleUpgrade} disabled={isProcessing}>{isProcessing ? "Opening Secure Checkout..." : "Upgrade Now"}</button>}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManager;

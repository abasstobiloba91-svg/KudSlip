import React, { useState } from 'react';

export default function SubscriptionManager({ user, showToast }) {
  const [loading, setLoading] = useState(false);
  const isPremium = user?.subscription_tier === 'premium';

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Calls your backend to generate the Paystack payment link
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, vendorId: user.id })
      });
      const data = await res.json();

      if (res.ok && data.authorization_url) {
        // Redirects the user to Paystack's official payment page
        window.location.href = data.authorization_url;
      } else {
        showToast("Error", data.error || "Could not generate payment link.", "error");
        setLoading(false);
      }
    } catch (err) {
      showToast("Error", "Network issue connecting to payment server.", "error");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Billing & Plan</div>
      <div style={{ color: "#64748B", marginBottom: "32px", fontSize: "15px" }}>Manage your subscription and unlock pro business tools.</div>

      <div style={{ background: "#FFFFFF", border: isPremium ? "2px solid #8B5CF6" : "1px solid #E2E8F0", borderRadius: "12px", padding: "32px" }}>
        <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Current Active Plan</div>
        <div style={{ fontSize: "28px", fontWeight: "900", margin: "8px 0 16px 0", color: isPremium ? "#8B5CF6" : "#0F172A" }}>
          {isPremium ? "Premium Pro Plan" : "Free Tier"}
        </div>

        {isPremium ? (
          <div style={{ background: "#F3E8FF", color: "#7E22CE", padding: "16px", borderRadius: "8px", fontWeight: "700", fontSize: "14px" }}>
            Your Premium Pro plan is active. Enjoy custom branding, zero watermarks, automated reminders, and foreign currency calculations!
          </div>
        ) : (
          <div>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
              Upgrade to Premium Pro for ₦15,000/mo to remove KudiSlip branding, calculate foreign exchange rates live, and automatically pass gateway fees to clients.
            </p>
            <button className="btn-primary btn-premium btn-hover" style={{ width: "100%", padding: "14px" }} onClick={handleUpgrade} disabled={loading}>
              {loading ? "Connecting to Paystack..." : "Upgrade to Premium Pro (₦15,000/mo)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

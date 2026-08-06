import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Ensure you have PAYSTACK_PUBLIC_KEY exported in your supabaseClient.js!
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY; 

export default function SubscriptionManager({ user, onUpgradeSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const isPremium = user?.subscription_tier === 'premium';

  useEffect(() => {
    // Load Paystack script securely on mount
    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleUpgrade = () => {
    if (!PAYSTACK_KEY) {
      return showToast("Configuration Error", "Paystack Public Key is missing.", "error");
    }

    if (!window.PaystackPop) {
      return showToast("Error", "Payment gateway is loading. Please refresh the page.", "error");
    }

    setLoading(true);

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: user.email,
        amount: 15000 * 100, // Amount in kobo (₦15,000)
        currency: 'NGN',
        ref: 'KUDISLIP_PRO_' + Math.floor((Math.random() * 1000000000) + 1),
        callback: async (response) => {
          // Payment successful! Update Supabase
          const { error } = await supabase
            .from('vendors')
            .update({ subscription_tier: 'premium' })
            .eq('id', user.id);
          
          if (!error) {
            onUpgradeSuccess();
            showToast("Payment Successful!", "You are now a Premium Pro user.", "success");
          } else {
            showToast("Error", "Payment succeeded, but failed to update profile.", "error");
          }
          setLoading(false);
        },
        onClose: () => {
          showToast("Cancelled", "Payment window closed.", "info");
          setLoading(false); // <--- This prevents the button from getting stuck!
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      showToast("Error", "Could not initialize Paystack.", "error");
      setLoading(false);
    }
  };

    handler.openIframe();
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
              {loading ? "Opening Paystack..." : "Upgrade to Premium Pro (₦15,000/mo)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

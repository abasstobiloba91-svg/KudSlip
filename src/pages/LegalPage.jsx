import React, { useEffect, useRef } from 'react';

// Design tokens used in this view
const DESIGN = {
  border: "#E2E8F0",
  textMuted: "#64748B",
  textMain: "#0F172A"
};

const GlobalStyles = () => null;

export default function LegalPage({ type }) {
  const isTerms = type === "terms";
  
  // 1. Create a physical anchor to the top of this component
  const topAnchorRef = useRef(null);
  
  // 2. Force the browser to snap to this exact element on load
  useEffect(() => {
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
    // Backup standard scroll just in case
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [type]);
  
  return (
    // 3. Attach the anchor directly to the parent wrapper
    <div ref={topAnchorRef} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
      <GlobalStyles />
      <nav style={{ padding: "24px", borderBottom: `1px solid ${DESIGN.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none", color: DESIGN.textMuted, fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }} className="btn-hover">&larr; Back Home</a>
        <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "24px", transform: "scale(1.5)" }} />
      </nav>
      
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px", color: DESIGN.textMain, lineHeight: "1.8", flex: 1 }}>
        <h1 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          {isTerms ? "Terms & Conditions" : "Privacy Policy"}
        </h1>
        <p style={{ color: DESIGN.textMuted, marginBottom: "40px", fontSize: "14px", fontWeight: "600" }}>
          Last updated: June 6, 2026
        </p>

        {isTerms ? (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>By accessing or using KudiSlip (kudislip.com.ng), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>2. Description of Service</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>KudiSlip provides a cloud-based Customer Relationship Management (CRM) and invoicing platform designed for merchants. The service allows users to generate invoices, manage client directories, track revenue, and receive automated payments via third-party payment gateways (e.g., Paystack).</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>3. Account Registration & KYC</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>To use KudiSlip, you must register for an account and provide accurate business information.</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>You are responsible for maintaining the security of your password and account.</li>
              <li>We reserve the right to suspend or terminate accounts that provide false information or fail our internal Know Your Customer (KYC) compliance checks.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>4. Subscriptions and Payments</h2>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Free Tier:</strong> KudiSlip offers a free tier that includes basic invoicing, CRM tools, and a KudiSlip watermark on generated receipts.</li>
              <li style={{ marginBottom: "8px" }}><strong>Premium Tier:</strong> Users may upgrade to a paid subscription (Premium) to unlock custom branding, remove watermarks, and access advanced features. Subscription fees are billed in advance on a recurring basis.</li>
              <li><strong>Transaction Fees:</strong> While KudiSlip does not charge a platform fee on the Free tier, standard payment processing fees applied by our gateway partner (Paystack) will be deducted from your settlements. KudiSlip is not responsible for funds held or delayed by third-party payment processors or banks.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>5. Acceptable Use</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>You agree not to use KudiSlip to:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Invoice for illegal, fraudulent, or heavily restricted goods and services.</li>
              <li style={{ marginBottom: "8px" }}>Upload malicious code, viruses, or attempt to breach the platform's security.</li>
              <li>Harass, abuse, or spam your clients using our automated reminder systems.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>6. Intellectual Property</h2>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Platform Rights:</strong> KudiSlip retains all rights, title, and interest in the platform’s code, design, and branding.</li>
              <li><strong>Your Data:</strong> You retain full ownership of the data you input into the platform, including your client lists, custom logos, and financial records.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>7. Limitation of Liability</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>KudiSlip provides the platform on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that the service will be entirely uninterrupted or error-free. In no event shall KudiSlip be liable for any indirect, incidental, or consequential damages, including loss of profits, data, or business interruptions.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>8. Governing Law</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>1. Introduction</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>At KudiSlip, we take your privacy and the privacy of your clients very seriously. This Privacy Policy explains how we collect, use, and protect your personal and business information when you use our platform at kudislip.com.ng.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>2. Information We Collect</h2>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Account Information:</strong> When you sign up, we collect your business name, email address, phone number, and password.</li>
              <li style={{ marginBottom: "8px" }}><strong>Financial Information:</strong> To route your payments, we collect your bank account details. <em>Note: We do not store raw credit card numbers; all transactions are securely processed by Paystack.</em></li>
              <li style={{ marginBottom: "8px" }}><strong>CRM & Client Data:</strong> We store the client data you input (names, emails, phone numbers) and your invoice history so you can manage your business.</li>
              <li><strong>Usage Data:</strong> We collect basic analytics on how you use the platform (e.g., login times, features used) to help us improve the service.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>3. How We Use Your Information</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>We use your data to:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Provide, maintain, and improve the KudiSlip platform.</li>
              <li style={{ marginBottom: "8px" }}>Process your subscription payments and route your invoice settlements.</li>
              <li style={{ marginBottom: "8px" }}>Send you important administrative emails, support messages, and platform updates.</li>
              <li>Facilitate the automated email and WhatsApp invoice reminders you trigger for your clients.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>4. Data Sharing and Third Parties</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>We do not sell your personal or client data to anyone. We only share data with trusted third-party services strictly necessary to operate the platform:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Paystack:</strong> For securely processing payments and verifying bank subaccounts.</li>
              <li style={{ marginBottom: "8px" }}><strong>Supabase:</strong> For secure cloud database hosting and data storage.</li>
              <li><strong>Legal Compliance:</strong> We may disclose your information if required to do so by Nigerian law or subpoena.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>5. Data Security</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>We implement bank-grade security measures, including data encryption in transit and at rest, to protect your information. While we strive to use commercially acceptable means to protect your data, no method of transmission over the internet is 100% secure.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>6. Your Data Rights (NDPR Compliance)</h2>
            <p style={{ marginBottom: "12px", color: DESIGN.textMuted }}>Under the Nigeria Data Protection Regulation (NDPR), you have the right to:</p>
            <ul style={{ color: DESIGN.textMuted, marginBottom: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Access the personal data we hold about you.</li>
              <li style={{ marginBottom: "8px" }}>Request corrections to inaccurate data.</li>
              <li>Request the complete deletion of your account and all associated data ("Right to be Forgotten").</li>
            </ul>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>To exercise any of these rights, please contact our support team.</p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginTop: "32px", marginBottom: "16px" }}>7. Contact Us</h2>
            <p style={{ marginBottom: "24px", color: DESIGN.textMuted }}>If you have any questions about this Privacy Policy or how we handle your data, please contact us at: <strong>support@kudislip.com.ng</strong>.</p>
          </>
        )}
      </main>
      
      {/* SOCIAL PROOF BANNER */}
      <div style={{ padding: "0 0 80px 0", textAlign: "center", borderBottom: "1px solid #E2E8F0", marginBottom: "80px" }}>
        <p style={{ fontSize: "12px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "32px" }}>Trusted by fast-growing merchants and businesses</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "48px", flexWrap: "wrap", opacity: 0.5, filter: "grayscale(100%)", transition: "opacity 0.3s ease" }}>
          
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", fontFamily: "serif" }}>Aura Boutiques</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", letterSpacing: "-1px", display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "16px", height: "16px", background: "#0F172A", borderRadius: "4px" }}></div>
            Apex Logistics
          </div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", fontStyle: "italic" }}>Lumina Tech</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", textTransform: "uppercase", letterSpacing: "1px" }}>NOVA RETAIL</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", letterSpacing: "2px", border: "2px solid #0F172A", padding: "2px 8px" }}>CREST</div>
          
        </div>
      </div>
      
      <footer style={{ borderTop: `1px solid ${DESIGN.border}`, padding: "32px 24px", textAlign: "center", color: DESIGN.textMuted, fontSize: "13px" }}>
        © 2026 KudiSlip Technologies. All rights reserved.
      </footer>
    </div>
  );
}

import React, { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      
      {/* GLOBAL REBRAND STYLES */}
      <style>{`
        :root {
          --neon-blue: #2B39FF;
          --neon-green: #C6FF00;
          --bg-light: #F4F5F5;
          --text-dark: #0F172A;
        }

        body {
          background-color: var(--bg-light);
          margin: 0;
          padding: 0;
          color: var(--text-dark);
        }

        /* Typography */
        .heading-massive {
          font-family: 'Arial Black', Impact, sans-serif;
          text-transform: uppercase;
          line-height: 0.95;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
        }

        .heading-card {
          font-family: 'Arial Black', Impact, sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 18px;
          font-weight: 500;
          max-width: 600px;
          margin: 0 auto 32px auto;
          line-height: 1.5;
        }

        /* Buttons */
        .btn-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
          transition: transform 0.2s, opacity 0.2s;
          cursor: pointer;
          border: none;
        }
        .btn-pill:hover { transform: translateY(-2px); opacity: 0.9; }
        
        .btn-blue { background: var(--neon-blue); color: white; }
        .btn-green { background: var(--neon-green); color: var(--text-dark); }
        .btn-white { background: white; color: var(--text-dark); }
        .btn-dark { background: var(--text-dark); color: white; }

        /* Full Width Layout Blocks */
        .section-block {
          padding: 100px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .bg-white { background: white; color: var(--text-dark); }
        .bg-blue { background: var(--neon-blue); color: white; }
        .bg-green { background: var(--neon-green); color: var(--text-dark); }
        .bg-dark { background: var(--text-dark); color: white; }

        /* Ticker Animations */
        @keyframes infiniteScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-ticker-container {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          padding: 40px 0;
          background: white;
        }
        .logo-ticker-track {
          display: flex;
          width: max-content;
          animation: infiniteScroll 20s linear infinite;
        }
        .trusted-logo {
          height: 36px;
          margin: 0 48px;
          filter: contrast(0) brightness(0);
          opacity: 0.8;
          object-fit: contain;
        }

        /* Interactive Cards */
        .card-hover { transition: transform 0.2s ease; border-radius: 24px; padding: 32px; text-align: left; }
        .card-hover:hover { transform: translateY(-4px); }

        @media (min-width: 768px) {
          .mobile-menu-toggle { display: none; }
        }
        @media (max-width: 767px) {
          .nav-buttons-desktop { display: none; }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "white", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ width: "150px", display: "flex", alignItems: "center" }}>
          <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "35px", transform: "scale(2.5)", transformOrigin: "left center" }} />
        </div>
        <div className="nav-buttons-desktop" style={{ display: "flex", gap: "12px" }}>
          <a href="/login" style={{ textDecoration: "none", color: "var(--text-dark)", fontWeight: "800", padding: "10px 20px" }}>LOG IN</a>
          <a href="/signup" className="btn-pill btn-blue">GET STARTED</a>
        </div>
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 24px", background: "white" }}>
          <a href="/login" className="btn-pill btn-dark" style={{ width: "100%", boxSizing: "border-box" }}>Log In</a>
          <a href="/signup" className="btn-pill btn-blue" style={{ width: "100%", boxSizing: "border-box" }}>Get Started Free</a>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="section-block bg-white" style={{ paddingBottom: "40px" }}>
        <div style={{ background: "var(--neon-green)", color: "var(--text-dark)", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "800", marginBottom: "24px", textTransform: "uppercase" }}>
          The #1 CRM & Invoicing Tool
        </div>
        <h1 className="heading-massive" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
          MANAGE CUSTOMERS.<br />AUTOMATE PAYMENTS.
        </h1>
        <p className="subtitle" style={{ color: "#475569" }}>
          KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/signup" className="btn-pill btn-blue">Create Your Account</a>
        </div>
      </section>

      {/* TRUSTED BY TICKER */}
      <div className="logo-ticker-container">
        <div className="logo-ticker-track">
          {/* GROUP 1 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
            <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" style={{ transform: "scale(1.8)" }} />
            <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
            <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" style={{ transform: "scale(1.8)" }} />
            <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
            <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" style={{ transform: "scale(1.8)" }} />
          </div>
          {/* GROUP 2 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
            <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" style={{ transform: "scale(1.8)" }} />
            <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
            <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" style={{ transform: "scale(1.8)" }} />
            <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
            <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" style={{ transform: "scale(1.8)" }} />
          </div>
        </div>
      </div>

      {/* CORE FEATURES - ELECTRIC BLUE */}
      <section className="section-block bg-blue">
        <h2 className="heading-massive" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "48px" }}>EVERYTHING YOU NEED.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "1000px" }}>
          
          <div className="card-hover" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <h3 className="heading-card" style={{ fontSize: "24px", marginBottom: "12px" }}>Professional Invoicing</h3>
            <p style={{ opacity: 0.9, lineHeight: "1.6", margin: 0 }}>Generate clean, branded invoices and receipts for your clients in seconds.</p>
          </div>
          
          <div className="card-hover" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <h3 className="heading-card" style={{ fontSize: "24px", marginBottom: "12px" }}>Instant Settlements</h3>
            <p style={{ opacity: 0.9, lineHeight: "1.6", margin: 0 }}>Link your Nigerian bank account and receive payments directly via Paystack.</p>
          </div>
          
          <div className="card-hover" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <h3 className="heading-card" style={{ fontSize: "24px", marginBottom: "12px" }}>Customer CRM</h3>
            <p style={{ opacity: 0.9, lineHeight: "1.6", margin: 0 }}>Track client history, outstanding payments, and contact details seamlessly.</p>
          </div>

        </div>
      </section>

      {/* WHY CHOOSE US - NEON GREEN */}
      <section className="section-block bg-green">
        <h2 className="heading-massive" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "48px" }}>WHY NIGERIAN BRANDS<br/>CHOOSE KUDISLIP</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "1000px" }}>
          
          <div className="card-hover" style={{ background: "var(--text-dark)", color: "white" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", color: "var(--neon-green)", marginBottom: "12px" }}>Built for the Local Market</h3>
            <p style={{ opacity: 0.8, lineHeight: "1.6", margin: 0 }}>Receive instant Naira settlements directly to any local bank account via secure Paystack integration.</p>
          </div>

          <div className="card-hover" style={{ background: "var(--text-dark)", color: "white" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", color: "var(--neon-green)", marginBottom: "12px" }}>Zero Hidden Fees</h3>
            <p style={{ opacity: 0.8, lineHeight: "1.6", margin: 0 }}>Start for free. No setup fees, no minimums. Only pay when you upgrade for custom branding.</p>
          </div>

          <div className="card-hover" style={{ background: "var(--text-dark)", color: "white" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", color: "var(--neon-green)", marginBottom: "12px" }}>Bank-Grade Security</h3>
            <p style={{ opacity: 0.8, lineHeight: "1.6", margin: 0 }}>Your data and money are protected by enterprise-level encryption. We never touch raw card numbers.</p>
          </div>

        </div>
      </section>

      {/* REVENUE ENGINE - PITCH BLACK */}
      <section className="section-block bg-dark">
        <h2 className="heading-massive" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>THE ULTIMATE<br/>REVENUE ENGINE</h2>
        <p className="subtitle" style={{ color: "#94A3B8", marginBottom: "64px" }}>
          Close deals faster, track opens in real-time, and let our automated agents collect your debts.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "1000px" }}>
          
          <div className="card-hover" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div style={{ color: "var(--neon-green)", marginBottom: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Live Read Receipts</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6", margin: 0 }}>Know exactly the second your client opens your invoice with our invisible email tracking pixel.</p>
          </div>

          <div className="card-hover" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div style={{ color: "var(--neon-blue)", marginBottom: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6l4 2"/></svg>
            </div>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Auto-Debt Collection</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6", margin: 0 }}>Stop begging for your money. Our engine hunts down late payers with friendly WhatsApp reminders.</p>
          </div>

          <div className="card-hover" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div style={{ color: "var(--neon-green)", marginBottom: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Live Forex Calculator</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6", margin: 0 }}>Instantly pull live USD and GBP market rates and convert them to Naira with a single click.</p>
          </div>

          <div className="card-hover" style={{ background: "#1E293B", border: "1px solid #334155" }}>
            <div style={{ color: "var(--neon-blue)", marginBottom: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M7 15h.01"/><path d="M11 15h2"/></svg>
            </div>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Smart Fee Passing</h3>
            <p style={{ color: "#94A3B8", lineHeight: "1.6", margin: 0 }}>Keep 100% of your profits. Premium vendors can automatically pass transaction fees to the client.</p>
          </div>

        </div>
      </section>

      {/* PLATFORM UPDATES - WHITE */}
      <section className="section-block bg-white">
        <h2 className="heading-massive" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "48px" }}>POWERFUL NEW TOOLS.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", width: "100%", maxWidth: "1200px" }}>
          
          <div className="card-hover" style={{ background: "#F1F5F9" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Global Multi-Currency</h3>
            <p style={{ color: "#64748B", margin: 0 }}>Bill clients across borders. Switch seamlessly between NGN, USD, and GBP.</p>
          </div>
          <div className="card-hover" style={{ background: "#F1F5F9" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Net Profit Tracker</h3>
            <p style={{ color: "#64748B", margin: 0 }}>Log daily business expenses directly in the app to see your actual net profit.</p>
          </div>
          <div className="card-hover" style={{ background: "#F1F5F9" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Automated Reminders</h3>
            <p style={{ color: "#64748B", margin: 0 }}>Let our background engine chase your money via WhatsApp and Email.</p>
          </div>
          <div className="card-hover" style={{ background: "#F1F5F9" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Built-In Tax Engine</h3>
            <p style={{ color: "#64748B", margin: 0 }}>Apply the standard 7.5% government VAT to any invoice total instantly.</p>
          </div>
          <div className="card-hover" style={{ background: "#F1F5F9" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Manual Transfer Logs</h3>
            <p style={{ color: "#64748B", margin: 0 }}>Bypass the payment gateway for cash clients to keep your CRM accurate.</p>
          </div>
          <div className="card-hover" style={{ background: "#F1F5F9" }}>
            <h3 className="heading-card" style={{ fontSize: "20px", marginBottom: "12px" }}>Premium Branding</h3>
            <p style={{ color: "#64748B", margin: 0 }}>Remove watermarks, upload your logo, and tailor custom thank-you messages.</p>
          </div>
          
        </div>
      </section>

      {/* TEAM SECTION - ELECTRIC BLUE */}
      <section className="section-block bg-blue">
        <h2 className="heading-massive" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "48px" }}>MEET THE BUILDERS.</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", width: "100%", maxWidth: "800px" }}>
          
          <div className="card-hover" style={{ background: "white", color: "var(--text-dark)", width: "320px", textAlign: "center" }}>
            <img src="/founder.jpg" alt="Tobiloba Abass" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" }} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "4px solid var(--neon-blue)" }} />
            <h3 className="heading-card" style={{ fontSize: "24px", marginBottom: "4px" }}>Tobiloba Abass</h3>
            <p style={{ color: "var(--neon-blue)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>Founder</p>
            <p style={{ color: "#64748B", margin: 0 }}>Leading the vision and corporate strategy to empower African merchants.</p>
          </div>

          <div className="card-hover" style={{ background: "white", color: "var(--text-dark)", width: "320px", textAlign: "center" }}>
            <img src="/marvelous.jpg" alt="Marvelous Fawole" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80" }} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "4px solid var(--neon-blue)" }} />
            <h3 className="heading-card" style={{ fontSize: "24px", marginBottom: "4px" }}>Marvelous Fawole</h3>
            <p style={{ color: "var(--neon-blue)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>Product Manager</p>
            <p style={{ color: "#64748B", margin: 0 }}>Architecting the user experience and driving platform growth.</p>
          </div>

        </div>
      </section>

      {/* PRICING - WHITE & NEON GREEN */}
      <section className="section-block bg-white" style={{ paddingBottom: "100px" }}>
        <h2 className="heading-massive" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "48px" }}>NO HIDDEN FEES.</h2>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          
          <div className="card-hover" style={{ border: "2px solid #E2E8F0", flex: "1", minWidth: "300px", maxWidth: "400px" }}>
            <div className="heading-card" style={{ fontSize: "24px", color: "var(--text-dark)", marginBottom: "8px" }}>FREE TIER</div>
            <div className="heading-massive" style={{ fontSize: "48px", color: "var(--text-dark)", marginBottom: "24px" }}>₦0<span style={{fontSize: "16px", fontFamily: "sans-serif", color: "#64748B"}}>/mo</span></div>
            <ul style={{ paddingLeft: "20px", color: "#64748B", fontSize: "16px", lineHeight: "2", marginBottom: "32px", fontWeight: "500" }}>
              <li>Unlimited Invoices & Clients</li>
              <li>Instant Bank Settlements</li>
              <li><strong style={{color: "var(--text-dark)"}}>Includes KudiSlip Watermark</strong></li>
            </ul>
            <a href="/signup" className="btn-pill btn-dark" style={{ width: "100%", boxSizing: "border-box" }}>Get Started Free</a>
          </div>
          
          <div className="card-hover" style={{ background: "var(--neon-green)", flex: "1", minWidth: "300px", maxWidth: "400px", boxShadow: "0 20px 40px rgba(198, 255, 0, 0.2)" }}>
            <div className="heading-card" style={{ fontSize: "24px", color: "var(--text-dark)", marginBottom: "8px" }}>PREMIUM PRO</div>
            <div className="heading-massive" style={{ fontSize: "48px", color: "var(--text-dark)", marginBottom: "24px" }}>₦15K<span style={{fontSize: "16px", fontFamily: "sans-serif", opacity: 0.7}}>/mo</span></div>
            <ul style={{ paddingLeft: "20px", color: "var(--text-dark)", fontSize: "16px", lineHeight: "2", marginBottom: "32px", fontWeight: "600" }}>
              <li>Everything in Free</li>
              <li><strong>Remove KudiSlip Watermark</strong></li>
              <li>Fully Independent Branding</li>
              <li>Profit & Expense Analytics</li>
              <li>Pass Transaction Fees to Client</li>
              <li>Live Foreign Currency Converter</li>
              <li>Automated WhatsApp Reminders</li>
            </ul>
            <a href="/signup" className="btn-pill btn-blue" style={{ width: "100%", boxSizing: "border-box" }}>Upgrade to Premium</a>
          </div>
          
        </div>
      </section>
      
      {/* FOOTER */}
      <footer style={{ background: "var(--text-dark)", color: "white", padding: "60px 24px 40px", textAlign: "center" }}>
        <h2 className="heading-massive" style={{ fontSize: "2rem", marginBottom: "20px" }}>KUDISLIP</h2>
        <p style={{ opacity: 0.7, marginBottom: "40px", fontWeight: "500" }}>The Ultimate Revenue Engine.</p>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", fontSize: "14px", opacity: 0.8, fontWeight: "600" }}>
          <a href="/terms" style={{ color: "white", textDecoration: "none" }}>Terms & Conditions</a>
          <a href="/privacy" style={{ color: "white", textDecoration: "none" }}>Privacy Policy</a>
          <a href="mailto:support@kudislip.com" style={{ color: "white", textDecoration: "none" }}>Contact Us</a>
        </div>
        <div style={{ marginTop: "40px", fontSize: "12px", opacity: 0.5 }}>
          © 2026 KudiSlip Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

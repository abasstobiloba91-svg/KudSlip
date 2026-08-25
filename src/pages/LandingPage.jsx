import React, { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* INJECTED STYLES FOR ZERO-BUG DEPLOYMENT */}
      <style>{`
        @keyframes infiniteScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .logo-ticker-container {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          position: relative;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .logo-ticker-track {
          display: flex;
          width: max-content;
          animation: infiniteScroll 30s linear infinite;
        }

        .logo-ticker-track:hover {
          animation-play-state: paused;
        }

        .trusted-logo {
          height: 32px;
          margin: 0 48px;
          opacity: 0.4;
          /* Forces every logo to be a pure black silhouette to solve visibility issues */
          filter: contrast(0) brightness(0);
          transition: all 0.3s ease;
          object-fit: contain;
        }

        .trusted-logo:hover {
          opacity: 1;
          filter: contrast(0) brightness(0);
        }

        /* Essential utility classes */
        .btn-hover { transition: opacity 0.2s, transform 0.2s; }
        .btn-hover:hover { opacity: 0.9; transform: translateY(-1px); }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.1); }
        
        /* Your brand colors */
        .btn-primary { background: #8B5CF6; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; }
        .btn-secondary { background: white; color: #0F172A; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; }
        
        @media (min-width: 768px) {
          .mobile-menu-toggle { display: none; }
        }
        @media (max-width: 767px) {
          .nav-buttons-desktop { display: none; }
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-text-container { padding-right: 0 !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%", flex: 1, boxSizing: "border-box" }}>
        
        {/* NAVIGATION */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ width: "180px", display: "flex", alignItems: "center" }}>
            <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "40px", transform: "scale(2.5)", transformOrigin: "left center" }} />
          </div>
          <div className="nav-buttons-desktop" style={{ display: "flex", gap: "16px" }}>
            <a href="/login" className="btn-secondary btn-hover" style={{ padding: "10px 20px", display: "inline-block" }}>Log In</a>
            <a href="/signup" className="btn-primary btn-hover" style={{ padding: "10px 20px", display: "inline-block" }}>Get Started Free</a>
          </div>
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </nav>
        
        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 0", borderBottom: "1px solid #E2E8F0" }}>
            <a href="/login" className="btn-secondary btn-hover" style={{ padding: "12px", width: "100%", boxSizing: "border-box", textAlign: "center" }}>Log In</a>
            <a href="/signup" className="btn-primary btn-hover" style={{ padding: "12px", width: "100%", boxSizing: "border-box", textAlign: "center" }}>Get Started Free</a>
          </div>
        )}
        
        {/* HERO SECTION */}
        <main className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center", padding: "80px 0 60px" }}>
          <div className="hero-text-container" style={{ paddingRight: "40px" }}>
            <div style={{ display: "inline-block", padding: "6px 16px", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: "20px", fontSize: "13px", fontWeight: "600", color: "#64748B", marginBottom: "24px" }}>The #1 CRM & Invoicing Tool</div>
            <h1 className="hero-title" style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 24px", color: "#0F172A", lineHeight: "1.1" }}>Manage Customers.<br />Automate Payments.</h1>
            <p style={{ fontSize: "18px", color: "#64748B", margin: "0 0 40px", lineHeight: "1.6" }}>KudiSlip is your all-in-one CRM tool to generate professional invoices, track customer relationships, and receive instant bank settlements through automated Paystack routing.</p>
            <a href="/signup" className="btn-primary btn-hover" style={{ padding: "16px 36px", fontSize: "16px", display: "inline-block" }}>Create Your Account</a>
          </div>
          <div>
            <img src="/hero-image.jpg" alt="KudiSlip Merchants" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", objectFit: "cover", border: "1px solid #E2E8F0" }} />
          </div>
        </main>

        {/* --- NEW TRUSTED BY SECTION --- */}
        <div style={{ padding: "20px 0 80px", width: "100vw", position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", background: "#FFFFFF" }}>
          <p style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "32px" }}>
            Trusted by growing African brands
          </p>
          
          <div className="logo-ticker-container">
            <div className="logo-ticker-track">
              
              {/* GROUP 1: Updated to capital .PNG */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
                <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" />
                <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
                <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" />
                <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
                <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" />
              </div>

              {/* GROUP 2: Exact Duplicate for seamless loop */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
                <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" />
                <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
                <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" />
                <img src="/famoustechplay-logo.PNG" alt="FamousTechPlay" className="trusted-logo" />
                <img src="/hyvestudio-logo.PNG" alt="Hyve Studio" className="trusted-logo" />
              </div>

            </div>
          </div>
        </div>
        
        {/* 3 CORE FEATURES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", paddingBottom: "80px" }}>
          <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px 24px", textAlign: "center" }}>
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=150&q=80" alt="Invoicing Terminals" style={{ height: "60px", width: "60px", objectFit: "cover", borderRadius: "12px", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Professional Invoicing</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Generate clean, branded invoices and receipts for your clients in seconds.</p>
          </div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px 24px", textAlign: "center" }}>
            <img src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&w=150&q=80" alt="Digital Payments" style={{ height: "60px", width: "60px", objectFit: "cover", borderRadius: "12px", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Instant Settlements</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Link your Nigerian bank account and receive payments directly via Paystack.</p>
          </div>
          <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "32px 24px", textAlign: "center" }}>
            <img src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=150&q=80" alt="Market CRM" style={{ height: "60px", width: "60px", objectFit: "cover", borderRadius: "12px", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Customer CRM</h3>
            <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Track client history, outstanding payments, and contact details seamlessly.</p>
          </div>
        </div>

        {/* WHY NIGERIAN BUSINESSES CHOOSE US */}
        <div style={{ background: "#F1F5F9", padding: "80px 24px", margin: "0 -24px", textAlign: "center", borderRadius: "24px", marginBottom: "80px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "40px", color: "#0F172A" }}>Why Nigerian Businesses Choose KudiSlip</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px", maxWidth: "1000px", margin: "0 auto" }}>
            <div className="card-hover" style={{ textAlign: "left", background: "#FFF", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
               <div style={{ color: "#8B5CF6", marginBottom: "12px" }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
               <h4 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Built for the Local Market</h4>
               <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0, fontSize: "14px" }}>We understand the landscape. Receive instant Naira settlements directly to any of your local bank accounts via our secure Paystack integration.</p>
            </div>
            <div className="card-hover" style={{ textAlign: "left", background: "#FFF", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
               <div style={{ color: "#10B981", marginBottom: "12px" }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></div>
               <h4 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Zero Hidden Fees</h4>
               <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0, fontSize: "14px" }}>Start for free. No setup fees, no monthly minimums. We only make money when you voluntarily upgrade to Premium for custom branding.</p>
            </div>
            <div className="card-hover" style={{ textAlign: "left", background: "#FFF", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
               <div style={{ color: "#0F172A", marginBottom: "12px" }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
               <h4 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Bank-Grade Security</h4>
               <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0, fontSize: "14px" }}>Your data and your customers' money are protected by enterprise-level encryption. We never touch raw credit card numbers.</p>
            </div>
          </div>
        </div>

        {/* THE ULTIMATE REVENUE ENGINE BLOCK */}
        <section style={{ padding: "80px 24px", margin: "0 -24px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", marginBottom: "80px", borderRadius: "24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#0F172A", marginBottom: "16px", letterSpacing: "-0.5px" }}>
                The Ultimate Revenue Engine
              </h2>
              <p style={{ fontSize: "18px", color: "#64748B", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
                We just supercharged KudiSlip. Close deals faster, track opens in real-time, and let our automated engines collect your debts.
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
              
              <div className="card-hover" style={{ background: "#FFFFFF", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", border: "1px solid #E2E8F0" }}>
                <div style={{ width: "56px", height: "56px", background: "#F3E8FF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#7E22CE", marginBottom: "24px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>Live Read Receipts</h3>
                <p style={{ color: "#64748B", lineHeight: "1.6", fontSize: "15px", margin: 0 }}>
                  Never get ghosted again. Know exactly the second your client opens your invoice with our invisible email tracking pixel.
                </p>
              </div>

              <div className="card-hover" style={{ background: "#FFFFFF", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", border: "1px solid #E2E8F0" }}>
                <div style={{ width: "56px", height: "56px", background: "#DCFCE7", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A", marginBottom: "24px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <path d="M12 7v6l4 2"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>Auto-Debt Collection</h3>
                <p style={{ color: "#64748B", lineHeight: "1.6", fontSize: "15px", margin: 0 }}>
                  Stop begging for your money. Our background cron-engine automatically hunts down late payers with friendly WhatsApp reminders.
                </p>
              </div>

              <div className="card-hover" style={{ background: "#FFFFFF", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", border: "1px solid #E2E8F0" }}>
                <div style={{ width: "56px", height: "56px", background: "#EFF6FF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", marginBottom: "24px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>Live Forex Calculator</h3>
                <p style={{ color: "#64748B", lineHeight: "1.6", fontSize: "15px", margin: 0 }}>
                  Billing a foreign client? Instantly pull live USD and GBP market rates and convert them to Naira with a single click.
                </p>
              </div>

              <div className="card-hover" style={{ background: "#FFFFFF", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", border: "1px solid #E2E8F0" }}>
                <div style={{ width: "56px", height: "56px", background: "#FEF3C7", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", marginBottom: "24px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                    <path d="M7 15h.01"/>
                    <path d="M11 15h2"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>Smart Fee Passing</h3>
                <p style={{ color: "#64748B", lineHeight: "1.6", fontSize: "15px", margin: 0 }}>
                  Keep 100% of your profits. Premium vendors can automatically pass Paystack transaction fees directly to the client.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* PLATFORM UPDATES */}
        <div style={{ paddingBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ background: "#EFF6FF", color: "#3B82F6", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Platform Updates</span>
            <h2 style={{ fontSize: "36px", fontWeight: "900", marginTop: "16px", marginBottom: "12px", color: "#0F172A" }}>Powerful new tools to scale your business.</h2>
            <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>Everything you need to manage your money, from automated reminders to cross-border payments.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#3B82F6" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Global Multi-Currency</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Bill clients across borders. Switch seamlessly between Naira, US Dollars, and British Pounds via Paystack.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#10B981" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Net Profit Tracker</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Stop guessing your income. Log your daily business expenses directly in the app to see your actual net profit in real-time.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#8B5CF6" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Automated Reminders</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Let our background engine chase your money. Automated midnight email drops and 1-click WhatsApp reminders for pending invoices.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#F59E0B" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 22 7 12 2"></polygon><polyline points="2 17 2 22 22 22 22 17"></polyline><line x1="6" y1="12" x2="6" y2="17"></line><line x1="10" y1="12" x2="10" y2="17"></line><line x1="14" y1="12" x2="14" y2="17"></line><line x1="18" y1="12" x2="18" y2="17"></line></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Built-In Tax Engine</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Stay compliant effortlessly. Apply the standard 7.5% government VAT to any invoice total with a single click.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#0F172A" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Manual Transfer Logs</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Client paid in cash or via direct bank transfer? Bypass the payment gateway and mark invoices as paid manually to keep your CRM accurate.</p>
            </div>
            <div className="card-hover" style={{ padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <div style={{ marginBottom: "16px", color: "#EAB308" }}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px", color: "#0F172A" }}>Premium Branding</h3>
              <p style={{ color: "#64748B", lineHeight: "1.6", margin: 0 }}>Upgrade to Pro to remove watermarks, upload your custom business logo, and tailor custom thank-you messages for your clients.</p>
            </div>
          </div>
        </div>

        {/* TEAM SECTION */}
        <div style={{ paddingBottom: "100px", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "16px", color: "#0F172A" }}>Meet The Team</h2>
          <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: "1.6" }}>The builders and engineers working around the clock to make KudiSlip the most reliable invoicing platform in Africa.</p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", maxWidth: "800px", margin: "0 auto" }}>
            
            <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", width: "320px", boxSizing: "border-box" }}>
              <img src="/founder.jpg" alt="Tobiloba Abass" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" }} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "4px solid #F8FAFC" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "4px", color: "#0F172A" }}>Tobiloba Abass</h3>
              <p style={{ color: "#8B5CF6", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>Founder</p>
              <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Leading the vision and corporate strategy to empower African merchants with seamless, automated financial tools.</p>
            </div>

            <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", width: "320px", boxSizing: "border-box" }}>
              <img src="/marvelous.jpg" alt="Marvelous Fawole" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80" }} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "4px solid #F8FAFC" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "4px", color: "#0F172A" }}>Marvelous Fawole</h3>
              <p style={{ color: "#10B981", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>Product Manager</p>
              <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>Architecting the user experience and driving platform growth through continuous technical innovation.</p>
            </div>

          </div>
        </div>

        {/* PRICING */}
        <div style={{ paddingBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "12px", color: "#0F172A" }}>Simple, transparent pricing.</h2>
            <p style={{ color: "#64748B", fontSize: "16px" }}>Start for free, upgrade when you need to remove our branding.</p>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
            
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "40px", flex: "1", minWidth: "300px", maxWidth: "400px" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", color: "#0F172A" }}>Free Tier</div>
              <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "24px", color: "#0F172A" }}>₦0<span style={{fontSize: "16px", color: "#64748B"}}>/mo</span></div>
              <ul style={{ paddingLeft: "20px", color: "#64748B", fontSize: "15px", lineHeight: "1.8", marginBottom: "32px" }}>
                <li>Unlimited Invoices & Clients</li>
                <li>Instant Bank Settlements</li>
                <li><strong style={{color: "#0F172A"}}>Includes KudiSlip Watermark</strong></li>
              </ul>
              <a href="/signup" className="btn-secondary btn-hover" style={{ width: "100%", display: "block", boxSizing: "border-box", padding: "12px" }}>Get Started Free</a>
            </div>
            
            <div style={{ background: "#FFFFFF", border: "2px solid #8B5CF6", borderRadius: "12px", padding: "40px", flex: "1", minWidth: "300px", maxWidth: "400px", boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.15)" }}>
              <div style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px", color: "#8B5CF6" }}>Premium Pro</div>
              <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "24px", color: "#0F172A" }}>₦15,000<span style={{fontSize: "16px", color: "#64748B"}}>/mo</span></div>
              <ul style={{ paddingLeft: "20px", color: "#64748B", fontSize: "15px", lineHeight: "1.8", marginBottom: "32px" }}>
                <li>Everything in Free</li>
                <li><strong style={{color: "#0F172A"}}>Remove KudiSlip Watermark</strong></li>
                <li>Fully Independent Branding</li>
                <li>Profit & Expense Analytics</li>
                <li>Pass Transaction Fees to Client</li>
                <li>Live Foreign Currency Converter</li>
                <li>Automated WhatsApp Reminders</li>
              </ul>
              <a href="/signup" className="btn-primary btn-hover" style={{ width: "100%", display: "block", boxSizing: "border-box", padding: "12px" }}>Upgrade to Premium</a>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #E2E8F0", padding: "40px 24px", textAlign: "center", color: "#64748B", fontSize: "14px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>© 2026 KudiSlip Technologies. All rights reserved.</div>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="/terms" style={{ textDecoration: "none", color: "#64748B" }} className="btn-hover">Terms & Conditions</a>
            <a href="/privacy" style={{ textDecoration: "none", color: "#64748B" }} className="btn-hover">Privacy Policy</a>
            <a href="mailto:support@kudislip.com" style={{ textDecoration: "none", color: "#64748B" }} className="btn-hover">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

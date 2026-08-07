# ⚡ KudiSlip 

**The all-in-one CRM, Invoicing, and Payment platform built for modern African businesses.**

Welcome to the KudiSlip repository! KudiSlip is a robust, real-time web application designed to help merchants and service providers manage clients, send professional invoices, track expenses, and collect payments securely. 

---

## ✨ Core Features

### For Merchants (Vendors)
*    **Smart Invoicing:** Generate one-time or recurring (Premium) invoices in seconds.
*    **Live Currency Converter:** Auto-calculate USD/GBP to NGN using real-time market rates.
*    **Seamless Payments:** Integrated directly with **Paystack** for instant client payouts.
*    **Automated Mailer:** Beautiful, branded email dispatch for invoices, receipts, and OTPs.
*    **Read Receipts:** Know exactly when a client views an invoice (powered by webhooks).
*    **WhatsApp Integration:** One-click WhatsApp payment reminders.
*    **Business Analytics:** Real-time revenue charts, expense tracking, and tax ledgers.
*    **Brand Customization:** Premium users can upload custom logos to their payment pages.

### For Admins (Command Center)
*    **Complete Oversight:** Inspect vendor performance, earnings, and platform metrics.
*    **KYC/Compliance Management:** Review and approve/reject CAC document uploads directly.
*    **Broadcast Engine:** Send branded mass emails to all vendors simultaneously.
*    **Live Broadcast Analytics:** Track who opens admin announcements in real-time.
*    **Support Desk:** Built-in two-way ticketing system for user support.

---

## 🛠️ Tech Stack

This project is built for speed, security, and real-time synchronization.

*   **Frontend:** React.js (Vite)
*   **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Real-time WebSockets)
*   **Email Infrastructure:** [Resend](https://resend.com/) (Transactional emails & Webhooks)
*   **Payments:** [Paystack API](https://paystack.com/)
*   **Routing:** Custom SPA Router with secure 24-hour idle-logout protocols.

---

## 📁 Project Structure

Here is a quick overview of how the codebase is organized:

```text
kudislip/
├── api/                     # Serverless functions (Webhooks, Mailer, Admin Actions)
│   ├── email-webhook.js     # Catches Resend opens/clicks for invoices & broadcasts
│   └── mailer.js            # Centralized email template engine
├── src/
│   ├── components/          # Reusable UI (Icons, Toast, Navbars, ErrorBoundary)
│   ├── dashboard/           # Core authenticated views
│   │   ├── Invoices.jsx     # Invoice engine & 5-per-page pagination
│   │   ├── Admin.jsx        # Super Admin Command Center
│   │   ├── Brand.jsx        # Logo and brand settings
│   │   └── ...              # (Clients, Expenses, Payouts, Profile, Support)
│   ├── pages/               # Public facing pages (Landing, Legal, PublicInvoice)
│   ├── AppRouter.jsx        # Main routing and auth state management
│   └── supabaseClient.js    # Database connection initialization
└── package.json

import React, { useState, useEffect } from "react";
import { supabase, SUPABASE_URL } from "./supabaseClient";

// 🎯 CLEAN IMPORTS
import { BellIcon, AlertIcon, ShieldIcon } from './components/Icons';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import SupportButton from './components/SupportButton';

// Pages
import LandingPage from './pages/LandingPage';
import Auth from './Auth';
import PublicInvoice from './pages/PublicInvoice';
import LegalPage from './pages/LegalPage';
import UpdatePassword from './UpdatePassword';

// Dashboard Components
import Invoices from './dashboard/Invoices';
import Expenses from './dashboard/Expenses';
import Clients from './dashboard/Clients';
import Payouts from './dashboard/Payouts';
import Profile from './dashboard/Profile';
import Brand from './dashboard/Brand';
import Billing from './dashboard/Billing';
import Support from './dashboard/Support';
import SuperAdminDashboard from './dashboard/Admin';
import VerificationTab from './components/VerificationTab';
import TaxLedgerTab from './components/TaxLedgerTab';
import EmailCampaignsTab from './components/EmailTab'; // 👈 NEW BYPASS IMPORT

// Security Hook (24-Hour Idle Logout)
function useIdleLogout(supabaseClient) {
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
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
    resetTimer(); 

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [supabaseClient]);
}

export default function AppRouter() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  
  const [activeNotifMenu, setActiveNotifMenu] = useState(null); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  const showToast = (title, message, type = "success") => { 
    setToast({ title, message, type }); 
    setTimeout(() => setToast(null), 5000); 
  };

  useIdleLogout(supabase);
  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/");

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => { 
    const splashTimer = setTimeout(() => setShowSplash(false), 3000); 
    return () => clearTimeout(splashTimer); 
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    
    const handleGlobalClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
        if (link.getAttribute('target') === '_blank' || link.getAttribute('href').startsWith('http')) return;
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
      }
    };
    
    document.addEventListener('click', handleGlobalClick);
    return () => { 
      window.removeEventListener("popstate", handlePopState); 
      document.removeEventListener('click', handleGlobalClick); 
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPath]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!supabase) { setIsLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch full vendor row including role
        supabase.from('vendors').select('*').eq('id', session.user.id).single().then(({ data }) => {
          const combinedUser = { ...session.user, ...data };
          setUser(combinedUser);
          setIsLoading(false);
          checkNotifications(combinedUser);

          const notifChannel = supabase.channel('realtime_notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
              if ((combinedUser.role === 'vendor' && payload.new.user_id === combinedUser.id) || 
                  (combinedUser.role !== 'vendor' && payload.new.user_id === 'SYSTEM_ADMIN')) {
                checkNotifications(combinedUser);
              }
            }).subscribe();

          const path = window.location.pathname;
          if (path === "" || path === "/" || path === "/login" || path === "/signup") {
             navigateTo('/dashboard/invoices');
          }
        });
      } else { setIsLoading(false); }
    });
    return () => { supabase.removeAllChannels(); }
  }, []);

  const checkNotifications = async (userData) => {
    if (!supabase || !userData) return;
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
    if (userData.role === 'vendor') query = query.eq('user_id', userData.id);
    else query = query.eq('user_id', 'SYSTEM_ADMIN');
    
    const { data } = await query;
    if (data) { setNotifs(data); setUnreadCount(data.filter(n => !n.is_read).length); }
  };

  const markNotificationsRead = async () => {
    if (!user || unreadCount === 0) return;
    let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (user.role === 'vendor') query = query.eq('user_id', user.id);
    else query = query.eq('user_id', 'SYSTEM_ADMIN');
    
    await query;
    setUnreadCount(0);
    setNotifs(notifs.map(n => ({ ...n, is_read: true })));
  };

  const toggleNotifMenu = (menuId) => {
    if (activeNotifMenu === menuId) { setActiveNotifMenu(null); } else { setActiveNotifMenu(menuId); markNotificationsRead(); }
  };

  const renderView = () => {
    if (showSplash || isLoading) return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#F8FAFC", gap: "24px", width: "100vw", position: "fixed", top: 0, left: 0, zIndex: 99999 }}>
        <img src="/logo.png" alt="KudiSlip Logo" className="bouncing-logo" style={{ height: "40px", transformOrigin: "center center" }} />
        <div className="pulsing-text" style={{ marginTop: "8px" }}>Loading Your Workspace...</div>
      </div>
    );

    if (!SUPABASE_URL) return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px", textAlign: "center", background: "#FFF1F2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", marginBottom: "12px" }}>
          <AlertIcon />
          <div style={{ fontSize: "22px", fontWeight: "900" }}>Configuration Warning</div>
        </div>
        <div style={{ color: "#0F172A", maxWidth: "500px", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>Missing Supabase Environment Variables on Vercel.</div>
      </div>
    );

    if (currentPath.startsWith('/pay/')) {
      const cleanId = currentPath.replace('/pay/', '').replace(/[^a-zA-Z0-9-]/g, '');
      return <PublicInvoice invoiceId={cleanId} showToast={showToast} currentUser={user} />;
    }

    if (currentPath === "/update-password") return <UpdatePassword showToast={showToast} />;
    if (currentPath === "/terms") return <LegalPage type="terms" />;
    if (currentPath === "/privacy") return <LegalPage type="privacy" />;

    if (!user) {
      if (currentPath === "/login") return <Auth initialIsSignUp={false} showToast={showToast} onLoginSuccess={(u) => { setUser(u); navigateTo("/dashboard/invoices"); }} />;
      if (currentPath === "/signup") return <Auth initialIsSignUp={true} showToast={showToast} onLoginSuccess={(u) => { setUser(u); navigateTo("/dashboard/invoices"); }} />;
      return <LandingPage />;
    }

    const pathParts = currentPath.split('/').filter(Boolean);
    const dashboardIndex = pathParts.indexOf('dashboard');
    let activeTab = "invoices"; 
    
    const validTabs = ["invoices", "expenses", "clients", "payouts", "profile", "brand", "billing", "support", "admin", "verification", "tax", "emails"];
    if (dashboardIndex !== -1 && pathParts.length > dashboardIndex + 1) {
      activeTab = pathParts[dashboardIndex + 1].toLowerCase();
      if (!validTabs.includes(activeTab)) activeTab = "invoices";
    }

    const isElevatedUser = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'support';

    return (
      <div className="dashboard-layout">
        
        {/* FIXED MOBILE TOP HEADER */}
        <div className="mobile-dashboard-header" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", height: "80px" }}>
          <a href="/dashboard/invoices" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo.png" alt="KudiSlip Logo" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            
            {/* Header Notification Bell */}
            <div style={{ position: "relative" }}>
               <div onClick={() => toggleNotifMenu('mobile')}><BellIcon count={unreadCount} /></div>
               {activeNotifMenu === 'mobile' && (
                 <div style={{ position: "absolute", top: "100%", right: "-10px", width: "300px", background: "#FFF", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", zIndex: 1000, overflow: "hidden", marginTop: "12px" }}>
                   <div style={{ padding: "12px 16px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontWeight: "800", fontSize: "13px" }}>Notifications</div>
                   <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                     {notifs.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>No recent notifications.</div> : 
                      notifs.map(n => <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: n.is_read ? "#FFF" : "#EFF6FF", fontSize: "13px" }}>{n.message}</div>)
                     }
                   </div>
                 </div>
               )}
            </div>

            {/* Toggle Button */}
            <button 
              style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#0F172A", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }} 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? '×' : '☰'}
            </button>
          </div>
        </div>

        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => { setSidebarOpen(false); setActiveNotifMenu(null); }}></div>

        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ top: "80px", height: "calc(100dvh - 80px)", width: "280px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          
          <div className="sidebar-menu" style={{ paddingTop: "24px", flex: "1 0 auto" }} onClick={() => setSidebarOpen(false)}>
            {user.role !== 'support' && (
              <>
                <a href="/dashboard/invoices" className={`menu-btn ${activeTab === "invoices" ? "active" : ""}`}>Invoices & CRM</a>
                <a href="/dashboard/verification" className={`menu-btn ${activeTab === "verification" ? "active" : ""}`}>Business Verification</a>
                <a href="/dashboard/tax" className={`menu-btn ${activeTab === "tax" ? "active" : ""}`}>Tax Ledger</a>
                <a href="/dashboard/expenses" className={`menu-btn ${activeTab === "expenses" ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", whiteSpace: "nowrap" }}>
                  Profit Analytics <span style={{fontSize: "10px", background: "#FEF08A", color: "#854D0E", padding: "2px 6px", borderRadius: "4px", fontWeight: "800", marginLeft: "8px"}}>PRO</span>
                </a>
                <a href="/dashboard/clients" className={`menu-btn ${activeTab === "clients" ? "active" : ""}`}>Client Directory</a>
                <a href="/dashboard/payouts" className={`menu-btn ${activeTab === "payouts" ? "active" : ""}`}>Payout Settings</a>
                <a href="/dashboard/profile" className={`menu-btn ${activeTab === "profile" ? "active" : ""}`}>Profile Settings</a>
                <a href="/dashboard/brand" className={`menu-btn ${activeTab === "brand" ? "active" : ""}`}>Brand Settings</a>
                <a href="/dashboard/billing" className={`menu-btn ${activeTab === "billing" ? "active" : ""}`}>Billing & Plan</a>
              </>
            )}
            
            <a href="/dashboard/support" className={`menu-btn ${activeTab === "support" ? "active" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               {user.role === 'vendor' ? 'Helpdesk & Ticket' : 'Support Inbox'}
            </a>

            {/* ADMIN OPERATIONS LINK (Accessible to admin, super_admin, and support) */}
            {isElevatedUser && (
              <>
                <a href="/dashboard/admin" className={`menu-btn ${activeTab === "admin" ? "active" : ""}`} style={{ color: "#8B5CF6", borderTop: "1px dashed #E2E8F0", marginTop: "12px", paddingTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldIcon /> Command Center
                </a>
                <a href="/dashboard/emails" className={`menu-btn ${activeTab === "emails" ? "active" : ""}`} style={{ color: "#0284C7", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  ✉️ Email Campaigns
                </a>
              </>
            )}
          </div>
          
          {/* SIDEBAR FOOTER */}
          <div className="sidebar-footer" style={{ padding: "24px", marginTop: "auto", borderTop: "1px solid #E2E8F0", background: "#FFFFFF" }}>
            <div style={{ fontSize: "14px", color: "#0F172A", fontWeight: "800", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.business_name || user?.email}
            </div>
            <div style={{ fontSize: "11px", color: "#8B5CF6", fontWeight: "800", textTransform: "uppercase", marginBottom: "12px" }}>
              {user?.role || 'vendor'}
            </div>
            <button className="btn-primary btn-hover" style={{ width: "100%", padding: "12px", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }} onClick={() => supabase.auth.signOut().then(() => { setUser(null); navigateTo("/"); })}>Log Out</button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="main-content" style={{ paddingTop: "100px", paddingBottom: "60px", minHeight: "100vh" }} onClick={() => { if(activeNotifMenu) setActiveNotifMenu(null) }}>
          {activeTab === "invoices" && <Invoices user={user} showToast={showToast} />}
          {activeTab === "verification" && <VerificationTab user={user} showToast={showToast} supabase={supabase} />}
          {activeTab === "tax" && <TaxLedgerTab user={user} showToast={showToast} supabase={supabase} />}
          {activeTab === "expenses" && <Expenses user={user} showToast={showToast} />} 
          {activeTab === "clients" && <Clients user={user} showToast={showToast} />}
          {activeTab === "payouts" && <Payouts user={user} onSubaccountLinked={(code) => setUser({ ...user, paystack_subaccount_code: code })} showToast={showToast} />}
          {activeTab === "profile" && <Profile user={user} showToast={showToast} onUpdate={(u) => setUser(u)} />}
          {activeTab === "brand" && <Brand user={user} onUpdate={(u) => setUser(u)} showToast={showToast} />}
          {activeTab === "billing" && <Billing user={user} onUpgradeSuccess={() => setUser({ ...user, subscription_tier: 'premium' })} showToast={showToast} />}
          {activeTab === "support" && <Support user={user} showToast={showToast} />}
          {activeTab === "admin" && <SuperAdminDashboard user={user} showToast={showToast} />}
          
          {/* EMAIL CAMPAIGNS TAB RENDER */}
          {activeTab === "emails" && <EmailCampaignsTab user={user} showToast={showToast} supabase={supabase} />}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <ErrorBoundary>
        {renderView()}
      </ErrorBoundary>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div className="no-print">
        {user && user.role === 'vendor' && currentPath !== "/dashboard/support" && !currentPath.startsWith("/pay/") && currentPath !== "/update-password" && (
          <SupportButton />
        )}
      </div>
    </>
  );
}

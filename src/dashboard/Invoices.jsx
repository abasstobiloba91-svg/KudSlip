import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { InfoIcon, AlertIcon } from '../components/Icons';

function KudiSlipInvoiceEngine({ user, showToast }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  
  const [items, setItems] = useState([{ description: "", quantity: 1, price: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [showLogoWarning, setShowLogoWarning] = useState(false);
  
  const [invoiceType, setInvoiceType] = useState("one-time");
  const [passFees, setPassFees] = useState(false); 

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcData, setCalcData] = useState({ currency: 'USD', amount: '', rate: 0, result: 0, loading: false });
  
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };

  useEffect(() => {
    if (!supabase) return;
    
    // 1. Initial Data Load
    supabase.from('clients').select('*').eq('vendor_id', user.id).then(({ data }) => setClients(data || []));
    fetchRecentInvoices();

    // 2. 🚀 THE MAGIC: Real-Time WebSocket Listener
    const invoiceChannel = supabase.channel('realtime_invoices')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invoices', filter: `vendor_id=eq.${user.id}` }, (payload) => {
        setInvoices(prevInvoices => 
          prevInvoices.map(inv => inv.id === payload.new.id ? { ...inv, ...payload.new } : inv)
        );
      }).subscribe();

    return () => { supabase.removeChannel(invoiceChannel); };
  }, []);

  const fetchRecentInvoices = async () => {
    const { data } = await supabase.from('invoices').select('*, clients(name, email, phone)').eq('vendor_id', user.id).order('created_at', { ascending: false });
    if(data) setInvoices(data);
  };

  const handleAddItem = () => setItems([...items, { description: "", quantity: 1, price: "" }]);
  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index, field, value) => { const newItems = [...items]; newItems[index][field] = value; setItems(newItems); };
  
  const calculateTotal = () => items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);

  const handleCalculateRate = async (e) => {
    e.preventDefault();
    if (!calcData.amount) return;
    setCalcData(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${calcData.currency}`);
      const data = await res.json();
      const rate = data.rates.NGN;
      setCalcData(prev => ({ ...prev, rate, result: Number(prev.amount) * rate, loading: false }));
    } catch (err) {
      showToast("API Error", "Could not fetch live market rates. Please check your network.", "error");
      setCalcData(prev => ({ ...prev, loading: false }));
    }
  };

  const applyCalculatedRate = () => {
    setItems([{ description: `${calcData.currency} Invoice Conversion`, quantity: 1, price: Math.round(calcData.result) }]);
    setCalcOpen(false);
    showToast("Rate Applied", `Converted to ₦${Math.round(calcData.result).toLocaleString()}`, "success");
  };

  const triggerManualPaymentConfirm = (invId) => {
    setConfirmModalData({
      title: "Mark as Paid",
      message: "Are you sure you want to mark this invoice as Paid? Use this if the client paid via cash or direct bank transfer.",
      onConfirm: () => handleMarkAsPaid(invId)
    });
  };

  const handleMarkAsPaid = async (invId) => {
    setConfirmModalData(null);
    setLoading(true);
    const { error } = await supabase.from('invoices').update({ status: 'paid', payment_method: 'manual' }).eq('id', invId);
    if (error) { 
      showToast("Database Error", error.message, "error"); 
    } else {
      showToast("Payment Logged", "Invoice manually marked as paid.", "success");
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async (force = false) => {
    if (!selectedClient || !dueDate) return showToast("Missing Fields", "Please select a client and a due date.", "error");
    if (user.subscription_tier === 'premium' && !user.logo_url && force !== true) {
      setShowLogoWarning(true);
      return;
    }
    
    setShowLogoWarning(false);
    setLoading(true);
    
    const finalItems = invoiceType !== "one-time" 
      ? items.map(i => ({ ...i, description: `[${invoiceType.toUpperCase()}] ${i.description}` })) 
      : items;
    
    const { data, error } = await supabase.from('invoices').insert([{ 
      vendor_id: user.id, 
      client_id: selectedClient, 
      amount: calculateTotal(), 
      items: finalItems, 
      due_date: dueDate, 
      currency: 'NGN',
      fee_passed_on: passFees,
      is_recurring: invoiceType !== "one-time", 
      recurring_frequency: invoiceType !== "one-time" ? invoiceType : null
    }]).select().single();
    
    if (error) { showToast("Database Error", error.message, "error"); } 
    else {
      showToast("Invoice Generated!", "A secure payment link has been created successfully.", "success");
      setItems([{ description: "", quantity: 1, price: "" }]); setSelectedClient(""); setDueDate(""); setInvoiceType("one-time"); setPassFees(false);
      fetchRecentInvoices(); 
    }
    setLoading(false);
  };

 const handleSendEmail = async (invoice) => {
    try {
      showToast("Sending...", "Preparing email...", "info");

      // 1. Generate the secure payment link
      const invoiceLink = `https://${window.location.host}/pay/${invoice.id}`;
      
      // 2. Format the currency correctly
      const currencySymbols = { NGN: "₦", USD: "$", GBP: "£" };
      const symbol = currencySymbols[invoice.currency || 'NGN'] || invoice.currency;
      const amountFormatted = `${symbol}${Number(invoice.amount).toLocaleString()}`;

      // 3. Call the Master Mailer
      const res = await fetch('/api/mailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invoice', // The magic key that tells mailer.js which template to use!
          clientEmail: invoice.client_email, // Maps your DB column to the mailer
          clientName: invoice.client_name,
          invoiceAmount: amountFormatted,
          invoiceLink: invoiceLink,
          vendorName: user?.business_name || "KudiSlip Merchant",
          invoiceId: invoice.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      showToast("Success", "Invoice emailed successfully!", "success");
      
    } catch (err) {
      console.error("Email error:", err);
      showToast("Network Error", "Something went wrong contacting the mail server.", "error");
    }
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Invoices.</div>;

  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPending = totalBilled - totalPaid;

  const filteredInvoices = invoices.filter(inv => {
    const clientName = (inv.clients?.name || "").toLowerCase();
    const itemsStr = JSON.stringify(inv.items || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return clientName.includes(q) || itemsStr.includes(q);
  }).sort((a, b) => {
    if (sortOrder === "date-desc") return new Date(b.created_at) - new Date(a.created_at);
    if (sortOrder === "date-asc") return new Date(a.created_at) - new Date(b.created_at);
    if (sortOrder === "name-asc") return (a.clients?.name || "").localeCompare(b.clients?.name || "");
    if (sortOrder === "name-desc") return (b.clients?.name || "").localeCompare(a.clients?.name || "");
    return 0;
  });

  if (!user?.paystack_subaccount_code) return <div style={{ padding: "20px", background: "#FEF2F2", border: `1px solid #EF4444`, borderRadius: "8px", marginBottom: "24px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontWeight: "800", marginBottom: "6px" }}><h3 style={{ margin: 0 }}>Action Required</h3></div><div style={{ fontSize: "14px" }}>Link a bank account in <a href="/dashboard/payouts" style={{ color: "#EF4444" }}>Payout Settings</a> first.</div></div>;

  return (
    <div style={{ maxWidth: "900px", position: "relative" }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      {confirmModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6", margin: "0 auto 20px auto" }}>
              <InfoIcon />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#0F172A" }}>{confirmModalData.title}</h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>{confirmModalData.message}</p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button className="btn-primary btn-hover" style={{ padding: "14px", fontSize: "15px" }} onClick={confirmModalData.onConfirm}>Yes, Mark as Paid</button>
              <button className="btn-secondary btn-hover" style={{ padding: "14px", border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#64748B" }} onClick={() => setConfirmModalData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLogoWarning && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", margin: "0 auto 20px auto" }}>
              <AlertIcon />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#0F172A", textAlign: "center" }}>Missing Brand Logo</h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px", textAlign: "center" }}>You are a Premium user, but you haven't uploaded a custom logo yet! The default KudiSlip logo will be used on this invoice.</p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <a href="/dashboard/brand" className="btn-primary btn-premium btn-hover" style={{ textAlign: "center", padding: "14px", textDecoration: "none", fontSize: "15px" }} onClick={() => setShowLogoWarning(false)}>Upload Logo Now</a>
              <button className="btn-secondary btn-hover" onClick={() => handleGenerateInvoice(true)} style={{ padding: "14px", border: "none", background: "#F1F5F9", fontSize: "15px", color: "#0F172A" }}>Ignore & Generate</button>
              <button onClick={() => setShowLogoWarning(false)} style={{ background: "none", border: "none", color: "#64748B", fontWeight: "700", marginTop: "4px", cursor: "pointer", padding: "10px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>CRM & Invoicing</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Bill your clients and monitor your business health.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Billed</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>₦{totalBilled.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Collected</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#10B981" }}>₦{totalPaid.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Pending Debt</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#EF4444" }}>₦{totalPending.toLocaleString()}</div></div>
      </div>

      {invoices.length > 0 && <RevenueChart invoices={invoices} />}

      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "40px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>Create New Invoice</h3>
        
        {calcOpen ? (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, color: "#1E3A8A", fontSize: "15px", fontWeight: "800" }}>Foreign Client Auto-Calculator</h4>
              <button onClick={() => setCalcOpen(false)} style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer", fontWeight: "800" }}>Close</button>
            </div>
            <form onSubmit={handleCalculateRate} style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "800", color: "#3B82F6", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Currency</label>
                <select className="form-input" style={{ width: "110px", padding: "10px" }} value={calcData.currency} onChange={e => setCalcData({...calcData, currency: e.target.value})}>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "800", color: "#3B82F6", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Target Amount</label>
                <input className="form-input" type="number" style={{ width: "130px", padding: "10px" }} placeholder="e.g. 100" value={calcData.amount} onChange={e => setCalcData({...calcData, amount: e.target.value})} required />
              </div>
              <button className="btn-primary btn-hover" type="submit" disabled={calcData.loading} style={{ padding: "10px 20px", background: "#2563EB", fontSize: "14px" }}>
                {calcData.loading ? "Fetching..." : "Get Live Rate"}
              </button>
            </form>
            
            {calcData.result > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #BFDBFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#3B82F6", fontWeight: "600" }}>Live Rate: 1 {calcData.currency} = ₦{calcData.rate}</div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: "#1E3A8A" }}>Total: ₦{calcData.result.toLocaleString()}</div>
                </div>
                <button className="btn-primary btn-hover" onClick={applyCalculatedRate} style={{ padding: "8px 16px", background: "#10B981", fontSize: "13px", border: "none", color: "white" }}>Apply to Invoice</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setCalcOpen(true)} style={{ background: "transparent", border: "1px dashed #CBD5E1", color: "#3B82F6", width: "100%", padding: "14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", marginBottom: "32px", fontSize: "14px", transition: "all 0.2s" }} className="btn-hover">
            + Calculate Foreign Currency (USD/GBP)
          </button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Billed To (Client)</label>
            <select className="form-input" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}><option value="">-- Select Client --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          <div><label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Due Date</label><input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#D97706", display: "block", marginBottom: "8px" }}>Billing Frequency (Premium)</label>
            <select className="form-input" value={invoiceType} onChange={e => setInvoiceType(e.target.value)} disabled={user?.subscription_tier !== 'premium'} style={{ border: user?.subscription_tier === 'premium' ? "1px solid #FCD34D" : "1px solid #E2E8F0" }}>
              <option value="one-time">One-time Invoice</option>
              <option value="monthly">Monthly Recurring</option>
              <option value="weekly">Weekly Recurring</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#0F172A", background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <input type="checkbox" checked={passFees} onChange={(e) => setPassFees(e.target.checked)} disabled={user?.subscription_tier !== 'premium'} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
            Pass Paystack Transaction Fees to Client <span style={{fontSize: "10px", background: "#FEF08A", color: "#854D0E", padding: "2px 6px", borderRadius: "4px"}}>PRO</span>
          </label>
        </div>

        <div style={{ marginBottom: "24px" }}>
          {items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "8px", paddingLeft: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Item Description</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Qty</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Unit Price</div>
              <div style={{ width: "28px" }}></div>
            </div>
          )}
          
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "12px" }}>
              <input className="form-input" placeholder="e.g. Web Design" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
              <input className="form-input" type="number" min="1" placeholder="1" value={item.quantity === '' ? '' : item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))} />
              <input className="form-input" type="number" min="0" placeholder="e.g. 50000" value={item.price === '' ? '' : item.price} onChange={e => handleItemChange(idx, 'price', e.target.value === '' ? '' : Number(e.target.value))} />
              <button onClick={() => handleRemoveItem(idx)} style={{ background: "transparent", color: "#EF4444", border: "none", cursor: "pointer", fontWeight: "800", padding: "0 10px" }}>X</button>
            </div>
          ))}
          <button onClick={() => handleAddItem()} style={{ background: "transparent", color: "#000000", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "14px", padding: 0 }}>+ Add Line Item</button>
        </div>

        <div style={{ borderTop: `1px solid #E2E8F0`, paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "20px", fontWeight: "900" }}>Total: ₦{calculateTotal().toLocaleString()}</div>
          <button className="btn-primary btn-hover" onClick={() => handleGenerateInvoice(false)} disabled={loading || clients.length === 0}>{loading ? "Generating..." : "Generate Invoice"}</button>
        </div>
      </div>

      {invoices.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Recent Invoices</h3>
            <div style={{ display: "flex", gap: "12px", flex: 1, justifyContent: "flex-end" }}>
              <input className="form-input" style={{ maxWidth: "250px", padding: "10px 16px" }} placeholder="Search name or item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select className="form-input" style={{ maxWidth: "160px", padding: "10px 16px" }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Client A-Z</option>
                <option value="name-desc">Client Z-A</option>
              </select>
            </div>
          </div>
          
          {filteredInvoices.map(inv => {
            const safeInvAmount = Number(inv.amount || 0);
            const invCurrency = inv.currency || "NGN";
            const sym = CURRENCY_SYMBOLS[invCurrency] || "₦";
            
            let parsedItems = [];
            try { parsedItems = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items; } catch(e) { parsedItems = []; }
            const itemSummary = parsedItems.map(i => `${i.description} (x${i.quantity})`).join(', ');

            return (
              <div key={inv.id} className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: "16px", padding: "24px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ wordBreak: "break-word" }}>
                    <div style={{ fontWeight: "900", fontSize: "18px", color: "#0F172A", marginBottom: "4px", display: "flex", alignItems: "center" }}>
                      {inv.clients?.name}
                      {/* 🎯 SVG VIEWED BADGE */}
                      {inv.viewed_at && inv.status === 'pending' && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "900", padding: "4px 8px", borderRadius: "12px", background: "#F3E8FF", color: "#7E22CE", textTransform: "uppercase", letterSpacing: "0.5px", marginLeft: "8px", border: "1px solid #D8B4FE" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Viewed
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.4" }}>
                      <div>{inv.clients?.email}</div>
                      {inv.clients?.phone && <div>{inv.clients.phone}</div>}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "900", padding: "6px 12px", borderRadius: "20px", background: inv.status === 'pending' ? "#FEF3C7" : "#ECFDF5", color: inv.status === 'pending' ? "#D97706" : "#10B981", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
                    {inv.status}
                  </span>
                </div>

                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", color: "#0F172A", fontWeight: "500", border: "1px solid #F1F5F9" }}>
                  <span style={{ color: "#64748B", fontWeight: "800", marginRight: "4px" }}>Items:</span> {itemSummary || "N/A"}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px dashed #E2E8F0`, paddingTop: "16px", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A" }}>
                    {sym}{safeInvAmount.toLocaleString()}
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px", flex: "1 1 auto", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button className="btn-secondary btn-hover" style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "140px" }} onClick={() => window.open("/pay/" + inv.id, '_blank')}>View Link</button>
                    
                    {inv.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => triggerManualPaymentConfirm(inv.id)}
                          className="btn-secondary btn-hover"
                          style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "150px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#F8FAFC", border: "1px solid #CBD5E1", color: "#475569" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Cash / Manual
                        </button>
                        
                        <button 
                          onClick={() => handleSendEmail(inv)} 
                          disabled={sendingEmailId === inv.id}
                          className="btn-secondary btn-hover"
                          style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "150px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: sendingEmailId === inv.id ? 0.7 : 1 }}
                        >
                          {sendingEmailId === inv.id ? (
                            <>
                              <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                              Email Client
                            </>
                          )}
                        </button>
                        
                        <a href={`https://wa.me/?text=${encodeURIComponent(`Hello! Just a reminder that your invoice for ${sym}${safeInvAmount.toLocaleString()} from ${user.business_name || "us"} is due. You can pay securely here: https://${window.location.host}/pay/${inv.id}`)}`} target="_blank" rel="noopener noreferrer" className="btn-primary btn-hover" style={{ padding: "10px 16px", fontSize: "13px", flexGrow: 1, maxWidth: "160px", textAlign: "center" }}>WhatsApp Alert</a>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
          {filteredInvoices.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No invoices found matching your search.</div>}
        </div>
      )}
    </div>
  );
}

function RevenueChart({ invoices }) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ label: d.toLocaleString('default', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), total: 0 });
  }

  invoices.forEach(inv => {
    if (inv.status === 'paid') {
      const date = new Date(inv.created_at);
      const match = months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
      if (match) match.total += Number(inv.amount || 0);
    }
  });

  const maxTotal = Math.max(...months.map(m => m.total), 1); 

  return (
    <div className="card-hover" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", marginBottom: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "900", marginBottom: "32px", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.05em" }}>6-Month Revenue Trend</h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px", paddingBottom: "12px", borderBottom: "1px dashed #E2E8F0" }}>
        {months.map((m, i) => {
          const heightPct = (m.total / maxTotal) * 100;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "8px", height: "100%" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#10B981", opacity: m.total > 0 ? 1 : 0 }}>
                {m.total > 1000 ? `₦${(m.total/1000).toFixed(1)}k` : `₦${m.total}`}
              </div>
              <div style={{ width: "100%", maxWidth: "48px", background: m.total > 0 ? "#10B981" : "#F1F5F9", height: `${Math.max(heightPct, 4)}%`, borderRadius: "6px 6px 0 0", transition: "height 0.8s ease" }}></div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "16px", paddingTop: "16px" }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "12px", fontWeight: "800", color: "#64748B" }}>{m.label}</div>
        ))}
      </div>
    </div>
  );
}

export default KudiSlipInvoiceEngine;

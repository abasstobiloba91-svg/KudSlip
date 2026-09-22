import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { InfoIcon, AlertIcon } from '../components/Icons';

export default function KudiSlipInvoiceEngine({ user, showToast }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  
  const [items, setItems] = useState([{ description: "", quantity: 1, price: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");
  
  const [logoWarning, setLogoWarning] = useState({ show: false, asQuote: false });
  
  const [invoiceType, setInvoiceType] = useState("one-time");
  const [passFees, setPassFees] = useState(false); 

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcData, setCalcData] = useState({ currency: 'USD', amount: '', rate: 0, result: 0, loading: false });
  
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  // Revision & Editing State
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };

  const isProTier = user?.subscription_tier === 'pro' || user?.subscription_tier === 'premium';
  const hasNotExpired = !user?.pro_expires_at || new Date(user.pro_expires_at) > new Date();
  const isPro = Boolean(isProTier && hasNotExpired);

  useEffect(() => {
    if (!supabase) return;
    
    supabase.from('clients').select('*').eq('vendor_id', user.id).then(({ data }) => setClients(data || []));
    fetchRecentInvoices();

    const invoiceChannel = supabase.channel('realtime_invoices')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invoices', filter: `vendor_id=eq.${user.id}` }, (payload) => {
        setInvoices(prevInvoices => 
          prevInvoices.map(inv => inv.id === payload.new.id ? { ...inv, ...payload.new } : inv)
        );
      }).subscribe();

    return () => { supabase.removeChannel(invoiceChannel); };
  }, [user.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

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

  // PRE-FILL FORM FOR REVISION / EDITING
  const handleEditQuote = (inv) => {
    setEditingInvoiceId(inv.id);
    setSelectedClient(inv.client_id || "");
    setDueDate(inv.due_date || "");
    
    let parsed = [];
    try { parsed = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items; } catch(e) {}
    setItems(parsed.length > 0 ? parsed : [{ description: "", quantity: 1, price: "" }]);
    
    setPassFees(inv.fee_passed_on || false);
    setInvoiceType(inv.recurring_frequency || "one-time");
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
    showToast("Editing Document", "Modify the fields below and click Update as Quote or Update as Invoice.", "info");
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
    setItems([{ description: "", quantity: 1, price: "" }]);
    setSelectedClient("");
    setDueDate("");
    setInvoiceType("one-time");
    setPassFees(false);
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

  const triggerCancelConfirm = (inv) => {
    if (inv.status === 'paid') {
      return showToast("Action Denied", "Paid invoices are locked for accounting purposes.", "error");
    }
    setConfirmModalData({
      title: inv.status === 'quote' ? "Cancel Quote" : "Cancel Invoice",
      message: `Are you sure you want to cancel this ${inv.status === 'quote' ? 'quote' : 'invoice'}? The client will no longer be able to interact with it, but it will remain in your records.`,
      onConfirm: () => handleCancelInvoice(inv.id)
    });
  };

  const handleCancelInvoice = async (invId) => {
    setConfirmModalData(null);
    setLoading(true);
    const { error } = await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', invId);
    if (error) {
      showToast("Database Error", error.message, "error");
    } else {
      showToast("Document Cancelled", "The document has been voided successfully.", "success");
      fetchRecentInvoices(); 
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async (force = false, asQuote = false) => {
    if (!selectedClient || !dueDate) return showToast("Missing Fields", "Please select a client and a due date.", "error");
    
    if (isPro && !user.logo_url && force !== true) {
      setLogoWarning({ show: true, asQuote });
      return;
    }
    
    setLogoWarning({ show: false, asQuote: false });
    setLoading(true);
    
    const finalItems = invoiceType !== "one-time" 
      ? items.map(i => ({ ...i, description: `[${invoiceType.toUpperCase()}] ${i.description}` })) 
      : items;
    
    let dbError;

    if (editingInvoiceId) {
      const { error } = await supabase.from('invoices').update({ 
        client_id: selectedClient, 
        amount: calculateTotal(), 
        items: finalItems, 
        due_date: dueDate, 
        fee_passed_on: passFees,
        is_recurring: invoiceType !== "one-time", 
        recurring_frequency: invoiceType !== "one-time" ? invoiceType : null,
        status: asQuote ? 'quote' : 'pending',
        decline_reason: null
      }).eq('id', editingInvoiceId);
      dbError = error;
    } else {
      const { error } = await supabase.from('invoices').insert([{ 
        vendor_id: user.id, 
        client_id: selectedClient, 
        amount: calculateTotal(), 
        items: finalItems, 
        due_date: dueDate, 
        currency: 'NGN',
        fee_passed_on: passFees,
        is_recurring: invoiceType !== "one-time", 
        recurring_frequency: invoiceType !== "one-time" ? invoiceType : null,
        status: asQuote ? 'quote' : 'pending'
      }]);
      dbError = error;
    }
    
    if (dbError) { 
      showToast("Database Error", dbError.message, "error"); 
    } 
    else {
      showToast(
        asQuote ? (editingInvoiceId ? "Quote Updated!" : "Quote Created!") : (editingInvoiceId ? "Invoice Updated!" : "Invoice Generated!"), 
        asQuote ? "Your price quote is ready to send." : "A secure payment link has been created successfully.", 
        "success"
      );
      handleCancelEdit();
      fetchRecentInvoices(); 
    }
    setLoading(false);
  };

  const handleSendEmail = async (invoice) => {
    try {
      setSendingEmailId(invoice.id);
      showToast("Sending...", "Preparing email...", "info");

      const invoiceLink = `https://${window.location.host}/pay/${invoice.id}`;
      const currencySymbols = { NGN: "₦", USD: "$", GBP: "£" };
      const symbol = currencySymbols[invoice.currency || 'NGN'] || invoice.currency;
      const amountFormatted = `${symbol}${Number(invoice.amount).toLocaleString()}`;
      const targetEmail = invoice.clients?.email || invoice.client?.email || invoice.client_email;
      const targetName = invoice.clients?.name || invoice.client?.name || invoice.client_name || "Client";
      const isQuote = invoice.status === 'quote';

      const res = await fetch('/api/mailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isQuote ? 'quote' : 'invoice', 
          clientEmail: targetEmail,
          clientName: targetName,
          invoiceAmount: amountFormatted,
          invoiceLink: invoiceLink,
          vendorName: user?.business_name || "KudiSlip Merchant",
          invoiceId: invoice.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      showToast("Success", isQuote ? "Price quote emailed!" : "Invoice emailed!", "success");
    } catch (err) {
      console.error("Email error:", err);
      showToast("Error", "Could not send email. Please try again.", "error");
    } finally {
      setSendingEmailId(null);
    }
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Invoices.</div>;

  const activeInvoices = invoices.filter(inv => inv.status !== 'cancelled' && inv.status !== 'quote_declined' && inv.status !== 'quote');
  const totalBilled = activeInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPartiallyPaid = invoices.filter(i => i.status === 'partially_paid').reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);
  const absoluteTotalCollected = totalPaid + totalPartiallyPaid;
  const totalPending = totalBilled - absoluteTotalCollected;

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

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (!user?.paystack_subaccount_code) return <div style={{ padding: "20px", background: "#FEF2F2", border: `1px solid #EF4444`, borderRadius: "8px", marginBottom: "24px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontWeight: "800", marginBottom: "6px" }}><h3 style={{ margin: 0 }}>Action Required</h3></div><div style={{ fontSize: "14px" }}>Link a bank account in <a href="/dashboard/payouts" style={{ color: "#EF4444" }}>Payout Settings</a> first.</div></div>;

  return (
    <div style={{ maxWidth: "900px", position: "relative" }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      {/* CONFIRMATION MODAL */}
      {confirmModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6", margin: "0 auto 20px auto" }}>
              <InfoIcon />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#0F172A" }}>{confirmModalData.title}</h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>{confirmModalData.message}</p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button className="btn-primary btn-hover" style={{ padding: "14px", fontSize: "15px", background: confirmModalData.title.includes('Cancel') ? "#EF4444" : undefined }} onClick={confirmModalData.onConfirm}>
                {confirmModalData.title.includes('Cancel') ? 'Yes, Cancel' : 'Yes, Mark as Paid'}
              </button>
              <button className="btn-secondary btn-hover" style={{ padding: "14px", border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#64748B" }} onClick={() => setConfirmModalData(null)}>Keep Document</button>
            </div>
          </div>
        </div>
      )}

      {/* MISSING LOGO WARNING MODAL */}
      {logoWarning.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "20px", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", margin: "0 auto 20px auto" }}>
              <AlertIcon />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "12px", color: "#0F172A", textAlign: "center" }}>Missing Brand Logo</h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px", textAlign: "center" }}>You are a Premium Pro user, but you haven't uploaded a custom logo yet! The default KudiSlip logo will be used.</p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <a href="/dashboard/brand" className="btn-primary btn-premium btn-hover" style={{ textAlign: "center", padding: "14px", textDecoration: "none", fontSize: "15px" }} onClick={() => setLogoWarning({ show: false, asQuote: false })}>Upload Logo Now</a>
              <button className="btn-secondary btn-hover" onClick={() => handleGenerateInvoice(true, logoWarning.asQuote)} style={{ padding: "14px", border: "none", background: "#F1F5F9", fontSize: "15px", color: "#0F172A" }}>Ignore & Generate</button>
              <button onClick={() => setLogoWarning({ show: false, asQuote: false })} style={{ background: "none", border: "none", color: "#64748B", fontWeight: "700", marginTop: "4px", cursor: "pointer", padding: "10px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>CRM & Invoicing</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Bill your clients and monitor your business health.</div>

      {/* METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Billed</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px" }}>₦{totalBilled.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Total Collected</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#10B981" }}>₦{absoluteTotalCollected.toLocaleString()}</div></div>
        <div className="metric-card"><div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Pending Debt</div><div style={{ fontSize: "24px", fontWeight: "900", marginTop: "8px", color: "#EF4444" }}>₦{totalPending.toLocaleString()}</div></div>
      </div>

      {invoices.length > 0 && <RevenueChart invoices={invoices} />}

      {/* CREATE / EDIT DOCUMENT CARD */}
      <div style={{ background: "#FFFFFF", border: editingInvoiceId ? "2px solid #3B82F6" : "1px solid #E2E8F0", borderRadius: 12, padding: "32px", marginBottom: "40px", transition: "border 0.3s ease" }}>
        
        {editingInvoiceId && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#EFF6FF", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #BFDBFE" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#1E40AF" }}>Mode: Revising Existing Document</span>
            <button onClick={handleCancelEdit} style={{ background: "none", border: "none", color: "#EF4444", fontWeight: "800", cursor: "pointer", fontSize: "13px" }}>Discard Edits</button>
          </div>
        )}

        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>
          {editingInvoiceId ? "Modify Document Details" : "Create New Document"}
        </h3>
        
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
            <select className="form-input" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              <option value="">-- Select Client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "8px" }}>Due Date / Valid Until</label><input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#D97706", display: "block", marginBottom: "8px" }}>Billing Frequency (Premium)</label>
            <select className="form-input" value={invoiceType} onChange={e => setInvoiceType(e.target.value)} disabled={!isPro} style={{ border: isPro ? "1px solid #FCD34D" : "1px solid #E2E8F0" }}>
              <option value="one-time">One-time Processing</option>
              <option value="monthly">Monthly Recurring</option>
              <option value="weekly">Weekly Recurring</option>
            </select>
          </div>
        </div>

        {/* Pass Paystack Transaction Fees Row */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#0F172A", background: "#F8FAFC", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" checked={passFees} onChange={(e) => setPassFees(e.target.checked)} disabled={!isPro} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#000000" }} />
              <span>Pass Paystack Transaction Fees to Client</span>
            </div>
            <span style={{ fontSize: "10px", fontWeight: "800", background: "#FEF08A", color: "#854D0E", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.5px" }}>PRO</span>
          </label>
        </div>

        {/* LINE ITEMS */}
        <div style={{ marginBottom: "24px" }}>
          {items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "8px", paddingLeft: "4px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Item Description</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Qty</div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Unit Price</div>
              <div style={{ width: "36px" }}></div>
            </div>
          )}
          
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
              <input className="form-input" placeholder="e.g. Web Design" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
              <input className="form-input" type="number" min="1" placeholder="1" value={item.quantity === '' ? '' : item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))} />
              <input className="form-input" type="number" min="0" placeholder="e.g. 50000" value={item.price === '' ? '' : item.price} onChange={e => handleItemChange(idx, 'price', e.target.value === '' ? '' : Number(e.target.value))} />
              <button 
                onClick={() => handleRemoveItem(idx)} 
                type="button"
                style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "6px", cursor: "pointer", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Remove Item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
          <button onClick={() => handleAddItem()} style={{ background: "transparent", color: "#000000", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "14px", padding: 0 }}>+ Add Line Item</button>
        </div>

        {/* Action Buttons & Totals */}
        <div style={{ borderTop: `1px solid #E2E8F0`, paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A" }}>Total: ₦{calculateTotal().toLocaleString()}</div>
          
          <div style={{ display: "flex", gap: "12px", flex: "1 1 280px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button 
              className="btn-secondary btn-hover" 
              onClick={() => handleGenerateInvoice(false, true)} 
              disabled={loading || clients.length === 0} 
              style={{ 
                flex: "1 1 130px", 
                padding: "14px 18px", 
                background: "#FFFFFF", 
                border: "1px solid #CBD5E1", 
                color: "#0F172A", 
                fontWeight: "800", 
                borderRadius: "10px", 
                fontSize: "14px", 
                whiteSpace: "nowrap", 
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              {loading ? "Saving..." : editingInvoiceId ? "Update as Quote" : "Save as Quote"}
            </button>
            
            <button 
              className="btn-primary btn-hover" 
              onClick={() => handleGenerateInvoice(false, false)} 
              disabled={loading || clients.length === 0} 
              style={{ 
                flex: "1 1 130px", 
                padding: "14px 18px", 
                background: "#0F172A", 
                color: "#FFFFFF", 
                fontWeight: "800", 
                borderRadius: "10px", 
                fontSize: "14px", 
                whiteSpace: "nowrap", 
                border: "none", 
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              {loading ? "Generating..." : editingInvoiceId ? "Update as Invoice" : "Generate Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* RECENT DOCUMENTS LIST */}
      {invoices.length > 0 && (
        <div>
          {/* SEARCH & SORT HEADER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Recent Documents</h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", width: "100%" }}>
              <input 
                className="form-input" 
                style={{ width: "100%", padding: "10px 14px", boxSizing: "border-box" }} 
                placeholder="Search name or item..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <select 
                className="form-input" 
                style={{ width: "100%", padding: "10px 14px", boxSizing: "border-box" }} 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Client A-Z</option>
                <option value="name-desc">Client Z-A</option>
              </select>
            </div>
          </div>
          
          {currentInvoices.map(inv => {
            const safeInvAmount = Number(inv.amount || 0);
            const invCurrency = inv.currency || "NGN";
            const sym = CURRENCY_SYMBOLS[invCurrency] || "₦";
            
            let parsedItems = [];
            try { parsedItems = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items; } catch(e) { parsedItems = []; }
            const itemSummary = parsedItems.map(i => `${i.description} (x${i.quantity})`).join(', ');

            let badgeBg = "#F1F5F9";
            let badgeColor = "#64748B";
            
            if (inv.status === 'pending') { badgeBg = "#FEF3C7"; badgeColor = "#D97706"; }
            else if (inv.status === 'paid') { badgeBg = "#ECFDF5"; badgeColor = "#10B981"; }
            else if (inv.status === 'partially_paid') { badgeBg = "#E0F2FE"; badgeColor = "#0284C7"; }
            else if (inv.status === 'quote') { badgeBg = "#F3E8FF"; badgeColor = "#9333EA"; }
            else if (inv.status === 'quote_declined' || inv.status === 'cancelled') { badgeBg = "#FEF2F2"; badgeColor = "#EF4444"; }

            return (
              <div key={inv.id} className="card-hover" style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: "16px", padding: "24px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ minWidth: "180px", flex: 1 }}>
                    <div style={{ fontWeight: "900", fontSize: "18px", color: "#0F172A", lineHeight: "1.2", marginBottom: "4px" }}>
                      {inv.clients?.name || "Unnamed Client"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.4", wordBreak: "break-all" }}>
                      <div>{inv.clients?.email}</div>
                      {inv.clients?.phone && <div>{inv.clients.phone}</div>}
                    </div>
                  </div>

                  {/* BADGES CONTAINER */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {inv.viewed_at && inv.status === 'pending' && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: "800", padding: "5px 10px", borderRadius: "20px", background: "#F3E8FF", color: "#7E22CE", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", border: "1px solid #D8B4FE" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        Viewed
                      </span>
                    )}

                    <span style={{ fontSize: "11px", fontWeight: "900", padding: "5px 10px", borderRadius: "20px", background: badgeBg, color: badgeColor, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {inv.status.replace('_', ' ')}
                    </span>

                    {(inv.status === 'pending' || inv.status === 'quote') && (
                      <button 
                        onClick={() => triggerCancelConfirm(inv)}
                        className="btn-hover"
                        style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", whiteSpace: "nowrap" }}
                        title={`Cancel ${inv.status === 'quote' ? 'Quote' : 'Invoice'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", color: "#0F172A", fontWeight: "500", border: "1px solid #F1F5F9" }}>
                  <span style={{ color: "#64748B", fontWeight: "800", marginRight: "4px" }}>Items:</span> {itemSummary || "N/A"}
                </div>

                {/* EXECUTIVE CLIENT REJECTION REASON CARD */}
                {inv.decline_reason && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", padding: "14px 16px", borderRadius: "10px", marginTop: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#991B1B", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      Client Feedback
                    </div>
                    <div style={{ fontSize: "13px", color: "#7F1D1D", fontWeight: "600", lineHeight: "1.4" }}>
                      "{inv.decline_reason}"
                    </div>
                  </div>
                )}

                {/* AMOUNT & UNIFORM 2X2 BUTTON GRID */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderTop: `1px dashed #E2E8F0`, paddingTop: "16px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", opacity: (inv.status === 'cancelled' || inv.status === 'quote_declined') ? 0.5 : 1 }}>
                    {sym}{safeInvAmount.toLocaleString()}
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", width: "100%" }}>
                    <button 
                      className="btn-secondary btn-hover" 
                      style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "800", width: "100%", whiteSpace: "nowrap", textAlign: "center", justifyContent: "center", display: "flex", alignItems: "center", boxSizing: "border-box" }} 
                      onClick={() => window.open("/pay/" + inv.id, '_blank')}
                    >
                      View Link
                    </button>

                    {(inv.status === 'quote' || inv.status === 'quote_declined' || inv.status === 'pending') && (
                      <button 
                        onClick={() => handleEditQuote(inv)} 
                        className="btn-secondary btn-hover" 
                        style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "800", width: "100%", whiteSpace: "nowrap", textAlign: "center", justifyContent: "center", display: "flex", alignItems: "center", background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1D4ED8", boxSizing: "border-box" }}
                      >
                        Edit / Revise
                      </button>
                    )}
                    
                    {(inv.status === 'pending' || inv.status === 'partially_paid') && (
                      <button 
                        onClick={() => triggerManualPaymentConfirm(inv.id)}
                        className="btn-secondary btn-hover"
                        style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "800", width: "100%", whiteSpace: "nowrap", textAlign: "center", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px", background: "#F8FAFC", border: "1px solid #CBD5E1", color: "#475569", boxSizing: "border-box" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Cash / Manual
                      </button>
                    )}

                    {(inv.status === 'pending' || inv.status === 'partially_paid' || inv.status === 'quote') && (
                      <>
                        <button 
                          onClick={() => handleSendEmail(inv)} 
                          disabled={sendingEmailId === inv.id}
                          className="btn-secondary btn-hover"
                          style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "800", width: "100%", whiteSpace: "nowrap", textAlign: "center", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px", opacity: sendingEmailId === inv.id ? 0.7 : 1, boxSizing: "border-box" }}
                        >
                          {sendingEmailId === inv.id ? "Sending..." : (inv.status === 'quote' ? 'Email Quote' : 'Email Client')}
                        </button>
                        
                        <a 
                          href={`https://wa.me/?text=${encodeURIComponent(`Hello! Here is your secure ${inv.status === 'quote' ? 'price quote' : 'invoice'} for${sym}${safeInvAmount.toLocaleString()} from${user.business_name || "us"}. You can review it here: https://${window.location.host}/pay/${inv.id}`)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-primary btn-hover" 
                          style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "800", width: "100%", whiteSpace: "nowrap", textAlign: "center", justifyContent: "center", display: "flex", alignItems: "center", textDecoration: "none", boxSizing: "border-box" }}
                        >
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

          {filteredInvoices.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No documents found matching your search.</div>}
          
          {filteredInvoices.length > itemsPerPage && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", marginTop: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>
                Showing <strong style={{ color: "#0F172A" }}>{startIndex + 1}</strong> to <strong style={{ color: "#0F172A" }}>{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</strong> of <strong style={{ color: "#0F172A" }}>{filteredInvoices.length}</strong>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "800",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    background: currentPage === 1 ? "#F8FAFC" : "#FFFFFF",
                    color: currentPage === 1 ? "#94A3B8" : "#0F172A",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "800",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    background: currentPage === totalPages ? "#F8FAFC" : "#FFFFFF",
                    color: currentPage === totalPages ? "#94A3B8" : "#0F172A",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

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
    if (inv.status === 'paid' || inv.status === 'partially_paid') {
      const date = new Date(inv.created_at);
      const match = months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
      if (match) {
        match.total += inv.status === 'paid' ? Number(inv.amount || 0) : Number(inv.amount_paid || 0);
      }
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

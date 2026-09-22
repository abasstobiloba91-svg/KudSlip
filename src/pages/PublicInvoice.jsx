import React, { useState, useEffect } from 'react';
import { supabase, PAYSTACK_PUBLIC_KEY } from '../supabaseClient';
import { AlertIcon } from '../components/Icons';

const usePaystack = () => {
  useEffect(() => {
    if (!document.getElementById('paystack-inline-js')) {
      const script = document.createElement('script');
      script.id = 'paystack-inline-js';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
};

const GlobalStyles = () => null;

export default function PublicInvoice({ invoiceId, showToast, currentUser }) {
  usePaystack();
  const [invoice, setInvoice] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  const [customPayAmount, setCustomPayAmount] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const starsArray = [1, 2, 3, 4, 5];
  const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !invoiceId) { setDebugError("No valid payload found."); setLoading(false); return; }
      const { data: invData, error: invError } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
      if (invError) { setDebugError(`Msg: ${invError.message}`); setLoading(false); return; }

      if (invData) {
        setInvoice(invData);
        const balance = Number(invData.amount || 0) - Number(invData.amount_paid || 0);
        setCustomPayAmount(balance.toString());

        const { data: venData } = await supabase.from('vendors').select('*').eq('id', invData.vendor_id).single();
        const { data: cliData } = await supabase.from('clients').select('*').eq('id', invData.client_id).single();
        setVendor(venData); setClient(cliData);
      } else { setDebugError("Invoice row empty."); }
      setLoading(false);
    }
    fetchData();

    // REAL-TIME WEBSOCKET LISTENER (Keeps client UI synced if merchant voids or edits quote)
    const channel = supabase.channel(`public_invoice_${invoiceId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invoices', filter: `id=eq.${invoiceId}` }, (payload) => {
        setInvoice(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [invoiceId]);

  const triggerPDFCompilation = () => { window.print(); };

  // --- QUOTE LOGIC (WITH REAL-TIME MERCHANT ALERTS) ---
  const handleApproveQuote = async () => {
    try {
      const { error } = await supabase.from('invoices').update({ status: 'pending' }).eq('id', invoice.id);
      if (error) throw error;
      
      setInvoice(prev => ({ ...prev, status: 'pending' }));
      showToast("Quote Approved", "You can now proceed to secure payment.", "success");

      const formattedNum = invoice.invoice_number || `KUD-INV-${invoice.id.slice(0, 6).toUpperCase()}`;
      const sym = CURRENCY_SYMBOLS[invoice.currency || 'NGN'] || '₦';
      const formattedAmt = `${sym}${Number(invoice.amount).toLocaleString()}`;

      // 1. Send Email Alert to Merchant
      if (vendor?.email) {
        fetch('/api/mailer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'quote_response',
            action: 'approved',
            vendorEmail: vendor.email,
            vendorName: vendor.business_name || "Merchant",
            clientName: client?.name || "Client",
            invoiceNumber: formattedNum,
            amount: formattedAmt
          })
        }).catch(e => console.error(e));
      }

      // 2. Insert Realtime Notification in Dashboard
      if (vendor?.id) {
        await supabase.from('notifications').insert([{
          user_id: vendor.id,
          message: `Great news! ${client?.name || "Client"} approved quote ${formattedNum} (${formattedAmt})`,
          is_read: false
        }]);
      }
    } catch (err) {
      showToast("System Error", "Could not approve the quote at this time.", "error");
    }
  };

  const handleDeclineQuote = async () => {
    try {
      const { error } = await supabase.from('invoices').update({ status: 'quote_declined' }).eq('id', invoice.id);
      if (error) throw error;

      setInvoice(prev => ({ ...prev, status: 'quote_declined' }));
      showToast("Quote Declined", "The merchant has been notified.", "info");

      const formattedNum = invoice.invoice_number || `KUD-INV-${invoice.id.slice(0, 6).toUpperCase()}`;
      const sym = CURRENCY_SYMBOLS[invoice.currency || 'NGN'] || '₦';
      const formattedAmt = `${sym}${Number(invoice.amount).toLocaleString()}`;

      if (vendor?.email) {
        fetch('/api/mailer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'quote_response',
            action: 'declined',
            vendorEmail: vendor.email,
            vendorName: vendor.business_name || "Merchant",
            clientName: client?.name || "Client",
            invoiceNumber: formattedNum,
            amount: formattedAmt
          })
        }).catch(e => console.error(e));
      }

      if (vendor?.id) {
        await supabase.from('notifications').insert([{
          user_id: vendor.id,
          message: `${client?.name || "Client"} declined quote ${formattedNum}`,
          is_read: false
        }]);
      }
    } catch (err) {
      showToast("System Error", "Could not decline the quote at this time.", "error");
    }
  };

  const handlePayment = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in the system.", "error");
    if (!window.PaystackPop) return showToast("Loading", "Payment engine is loading, please wait...", "info");
    
    const invoiceCurrency = invoice?.currency || "NGN";
    const balanceDue = Number(invoice?.amount || 0) - Number(invoice?.amount_paid || 0);
    const amountToPay = Number(customPayAmount);
    
    if (amountToPay <= 0) return showToast("Invalid Amount", "Payment amount must be greater than 0.", "error");
    if (amountToPay > balanceDue) return showToast("Overpayment", "You cannot pay more than the remaining balance.", "error");

    try {
      let finalAmount = amountToPay;
      
      if (invoice?.fee_passed_on && invoiceCurrency === "NGN" && vendor?.paystack_subaccount_code) {
        if (amountToPay < 2500) {
          finalAmount = amountToPay / 0.985;
        } else {
          const calculatedWithFees = (amountToPay + 100) / 0.985;
          const totalFeeCharged = calculatedWithFees - amountToPay;
          finalAmount = totalFeeCharged > 2000 ? amountToPay + 2000 : calculatedWithFees;
        }
      }

      const safeAmountInKobo = Math.round(finalAmount * 100);
      const formattedInvoiceNumber = invoice.invoice_number || `KUD-INV-${invoice.id.slice(0, 6).toUpperCase()}`;

      let paystackPayload = {
        key: PAYSTACK_PUBLIC_KEY,
        email: client?.email || "customer@kudislip.com",
        amount: safeAmountInKobo, 
        currency: invoiceCurrency,
        reference: `${formattedInvoiceNumber}_${Date.now()}`,
        metadata: {
          invoice_id: invoice.id,
          intended_amount: amountToPay
        },
        callback: function(response) {
          const newAmountPaid = Number(invoice.amount_paid || 0) + amountToPay;
          const isFullyPaid = newAmountPaid >= Number(invoice.amount);
          const newStatus = isFullyPaid ? 'paid' : 'partially_paid';

          supabase.from('invoices').update({ status: newStatus, payment_method: 'paystack', amount_paid: newAmountPaid }).eq('id', invoice.id).then(() => {
            setInvoice({ ...invoice, status: newStatus, payment_method: 'paystack', amount_paid: newAmountPaid });
            setCustomPayAmount((Number(invoice.amount) - newAmountPaid).toString());
            showToast("Payment Successful", `Your secure payment of ${CURRENCY_SYMBOLS[invoiceCurrency]}${amountToPay.toLocaleString()} has been processed.`, "success");
          });
        },
        onClose: function() {
          showToast("Payment Incomplete", "The payment window was closed before completing the transaction.", "info");
        }
      };

      if (invoiceCurrency === "NGN" && vendor?.paystack_subaccount_code) {
        paystackPayload.subaccount = vendor.paystack_subaccount_code;
        paystackPayload.bearer = "subaccount";
      }

      const handler = window.PaystackPop.setup(paystackPayload);
      handler.openIframe();
    } catch(err) {
      showToast("Browser Blocked", "Your mobile browser blocked the popup. Please click again or disable shields.", "error");
    }
  };

  const submitReview = async () => {
    if (rating === 0) return showToast("Action Required", "Please select a star rating first.", "info");
    
    await supabase.from('reviews').insert([{
      invoice_id: invoice.id,
      merchant_name: vendor?.business_name || "Unknown Merchant",
      rating,
      comment: reviewComment
    }]);
    
    setReviewSubmitted(true);
    showToast("Feedback Sent", "Thank you! Your review helps us keep the platform safe.", "success");
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Loading Secure Document...</div>;
  if (debugError) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#FFF1F2" }}>
      <GlobalStyles/>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", marginBottom: "16px" }}><AlertIcon /><h2 style={{ margin: 0 }}>System Routing Error</h2></div>
      <p style={{background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #FECACA", maxWidth: "600px"}}>{debugError}</p>
      <a href="/" className="btn-primary btn-hover" style={{marginTop: "16px"}}>Go to Dashboard</a>
    </div>
  );
  if (!invoice) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Document not found.</div>;

  let safeItems = [];
  try { safeItems = Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items || "[]"); } catch(e) { safeItems = []; }
  
  const safeAmount = Number(invoice.amount || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = safeAmount - amountPaid;
  const safeDate = new Date(invoice.due_date || Date.now()).toLocaleDateString();
  
  const isProTier = vendor?.subscription_tier === 'pro' || vendor?.subscription_tier === 'premium';
  const hasNotExpired = !vendor?.pro_expires_at || new Date(vendor.pro_expires_at) > new Date();
  const isPro = Boolean(isProTier && hasNotExpired);
  const isFreeTier = !isPro;

  const customColor = vendor?.brand_color || "#000000";
  const thankYouMessage = isFreeTier ? "Thank you for your payment! KudiSlip values your business." : (vendor?.custom_thank_you || `Thank you for your payment! ${vendor?.business_name || 'Merchant'} values your business.`);
  
  const invoiceCurrency = invoice.currency || "NGN";
  const currencySymbol = CURRENCY_SYMBOLS[invoiceCurrency] || "₦";

  const isPayable = invoice.status === 'pending' || invoice.status === 'partially_paid';

  let badgeBg = "#F1F5F9";
  let badgeColor = "#64748B";
  
  if (invoice.status === 'pending') { badgeBg = "#FEF3C7"; badgeColor = "#D97706"; }
  else if (invoice.status === 'paid') { badgeBg = "#ECFDF5"; badgeColor = "#10B981"; }
  else if (invoice.status === 'partially_paid') { badgeBg = "#E0F2FE"; badgeColor = "#0284C7"; }
  else if (invoice.status === 'quote') { badgeBg = "#F3E8FF"; badgeColor = "#9333EA"; }
  else if (invoice.status === 'quote_declined' || invoice.status === 'cancelled') { badgeBg = "#FEF2F2"; badgeColor = "#EF4444"; }

  const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ cursor: "pointer", color: filled ? "#F59E0B" : "#E2E8F0", transition: "color 0.2s" }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  return (
    <>
      <GlobalStyles />
      <style>{`
        .invoice-page-wrapper {
          min-height: 100vh;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start; 
          background: #F8FAFC;
          position: relative;
        }
        .invoice-max-width {
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
          z-index: 10;
        }
        .print-card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
          height: max-content; 
        }
        .custom-pay-input { 
          width: 100%; 
          padding: 16px; 
          font-size: 18px; 
          font-weight: 700; 
          border: 2px solid #E2E8F0; 
          border-radius: 8px; 
          margin-bottom: 16px; 
          background: #F8FAFC;
        }
        .custom-pay-input:focus { border-color: ${customColor}; outline: none; background: #FFFFFF; }

        @media (max-width: 768px) {
          .invoice-page-wrapper { padding: 24px 16px; }
          .print-card { padding: 24px; }
        }
        
        @media print {
          @page { margin: 0; } 
          body, html, .invoice-page-wrapper { 
            background: #FFFFFF !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            display: block !important; 
          }
          .no-print { display: none !important; }
          .invoice-max-width { 
            max-width: 100% !important; 
            gap: 0 !important; 
            display: block !important; 
          }
          .print-card { 
            border: none !important; 
            box-shadow: none !important; 
            padding: 15mm !important; 
            border-radius: 0 !important; 
          }
        }
      `}</style>

      <div className="invoice-page-wrapper">
        {isFreeTier && <div style={{ position: "fixed", top: "-50%", left: "-50%", right: "-50%", bottom: "-50%", backgroundImage: 'url("/logo.png")', backgroundRepeat: "repeat", backgroundSize: "200px", opacity: 0.03, pointerEvents: "none", zIndex: 1, transform: "rotate(-15deg)" }} />}
        
        <div className="invoice-max-width">
          
          <div className="no-print" style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={triggerPDFCompilation} className="btn-hover" style={{ background: "#FFFFFF", color: "#0F172A", border: `1px solid #E2E8F0`, padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
                 <polyline points="8 12 12 16 16 12"></polyline>
                 <line x1="12" y1="2" x2="12" y2="16"></line>
              </svg>
              Download PDF
            </button>
          </div>
          
          {isFreeTier && (
            <div style={{ textAlign: "center", marginBottom: "-8px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Powered By</div>
              <img src="/logo.png" alt="KudiSlip" style={{ height: "28px", transform: "scale(1.5)" }} />
            </div>
          )}

          <div className="print-card card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>Billed By</div>
                {vendor?.logo_url ? (
                  <img 
                    src={vendor.logo_url} 
                    alt={vendor.business_name} 
                    style={{ 
                      maxWidth: "200px", 
                      maxHeight: "90px", 
                      width: "auto", 
                      height: "auto", 
                      objectFit: "contain",
                      marginTop: "8px"
                    }} 
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/logo.png" alt="KudiSlip Default" style={{ maxHeight: "28px", objectFit: "contain" }} />
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A" }}>{vendor?.business_name || "Verified Merchant"}</div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "#0F172A", marginBottom: "6px", letterSpacing: "0.5px" }}>
                  {invoice.invoice_number || `KUD-INV-${invoice.id.slice(0, 6).toUpperCase()}`}
                </div>
                <div style={{ 
                  display: "inline-block", 
                  background: badgeBg, 
                  color: badgeColor, 
                  padding: "6px 14px", 
                  borderRadius: "20px", 
                  fontSize: "12px", 
                  fontWeight: "800", 
                  textTransform: "uppercase" 
                }}>
                  {invoice.status.replace('_', ' ') || 'PENDING'}
                </div>
              </div>
            </div>
            
            <div style={{ borderTop: `1px solid #E2E8F0`, borderBottom: `1px solid #E2E8F0`, padding: "28px 0", marginBottom: "36px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>Billed To</div>
                <div style={{ fontWeight: "800", fontSize: "17px", color: "#0F172A", marginTop: "6px" }}>{client?.name || "Client"}</div>
                <div style={{ fontSize: "15px", color: "#64748B", marginTop: "4px" }}>{client?.email || "No email"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {invoice.status === 'quote' ? 'Quote Valid Until' : 'Due Date'}
                </div>
                <div style={{ fontWeight: "800", fontSize: "17px", color: "#0F172A", marginTop: "6px" }}>{safeDate}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid #E2E8F0` }}>
                <div style={{ flex: 1 }}>Description</div>
                <div style={{ width: "80px", textAlign: "center" }}>Qty</div>
                <div style={{ width: "140px", textAlign: "right" }}>Amount</div>
              </div>
              
              {safeItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px dashed #E2E8F0", opacity: (invoice.status === 'cancelled' || invoice.status === 'quote_declined') ? 0.6 : 1 }}>
                  <div style={{ flex: 1, fontWeight: "600", fontSize: "16px", color: "#0F172A", wordBreak: "break-word", paddingRight: "16px", textDecoration: (invoice.status === 'cancelled' || invoice.status === 'quote_declined') ? "line-through" : "none" }}>{item.description}</div>
                  <div style={{ width: "80px", textAlign: "center", fontSize: "16px", color: "#64748B", fontWeight: "600" }}>{item.quantity}</div>
                  <div style={{ width: "140px", textAlign: "right", fontWeight: "800", fontSize: "16px", color: "#0F172A", textDecoration: (invoice.status === 'cancelled' || invoice.status === 'quote_declined') ? "line-through" : "none" }}>{currencySymbol}{Number(item.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
            
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "28px", marginBottom: "32px", border: `1px solid #E2E8F0` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "15px", fontWeight: "600", color: "#475569" }}>
                <span>{invoice.status === 'quote' ? 'Estimated Total' : 'Total Amount'}</span>
                <span>{currencySymbol}{safeAmount.toLocaleString()}</span>
              </div>
              
              {amountPaid > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "15px", fontWeight: "600", color: "#10B981" }}>
                  <span>Amount Paid</span>
                  <span>- {currencySymbol}{amountPaid.toLocaleString()}</span>
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #CBD5E1", fontSize: "20px", fontWeight: "900", color: (invoice.status === 'cancelled' || invoice.status === 'quote_declined') ? "#64748B" : customColor, textDecoration: (invoice.status === 'cancelled' || invoice.status === 'quote_declined') ? "line-through" : "none" }}>
                <span>{invoice.status === 'quote' ? 'Quote Total' : 'Balance Due'}</span>
                <span>{currencySymbol}{balanceDue.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="no-print">
              
              {/* QUOTE ACTION BUTTONS */}
              {invoice.status === 'quote' && (
                <div style={{ background: "#FFFFFF", padding: "32px", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#0F172A", fontWeight: "800" }}>Review Price Quote</h3>
                  <p style={{ margin: "0 0 24px 0", fontSize: "15px", color: "#475569", lineHeight: "1.6" }}>Please review the services and pricing outlined above. If everything is satisfactory, approve this quote to securely convert it into a payable invoice.</p>
                  <div style={{ display: "flex", gap: "16px" }}>
                     <button onClick={handleDeclineQuote} className="btn-hover" style={{ flex: 1, padding: "16px", background: "#FFFFFF", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "8px", fontWeight: "800", fontSize: "15px", cursor: "pointer" }}>Decline</button>
                     <button onClick={handleApproveQuote} className="btn-hover" style={{ flex: 2, padding: "16px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)" }}>Approve Quote</button>
                  </div>
                </div>
              )}

              {/* CANCELLED OR DECLINED STATUS */}
              {(invoice.status === 'cancelled' || invoice.status === 'quote_declined') && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "24px", background: "#FEF2F2", borderRadius: "12px", border: "1px dashed #FECACA", color: "#EF4444", fontWeight: "700" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  {invoice.status === 'quote_declined' ? 'This quote has been declined.' : 'This invoice has been cancelled by the merchant.'}
                </div>
              )}

              {/* PAYMENT SECTION */}
              {isPayable && (
                <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", marginBottom: "16px" }}>
                  <p style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#475569", fontWeight: "600" }}>Enter the amount you wish to pay today:</p>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span style={{ position: "absolute", left: "16px", fontSize: "18px", fontWeight: "700", color: "#0F172A" }}>{currencySymbol}</span>
                    <input type="number" className="custom-pay-input" value={customPayAmount} onChange={(e) => setCustomPayAmount(e.target.value)} max={balanceDue} style={{ paddingLeft: "40px" }} />
                  </div>
                  <button className="btn-hover" style={{ width: "100%", padding: "20px", background: customColor, color: "#FFF", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "17px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} onClick={handlePayment}>
                    Securely Pay {currencySymbol}{Number(customPayAmount || 0).toLocaleString()}
                  </button>
                </div>
              )}

              {/* SUCCESSFUL PAYMENT UI */}
              {invoice.status === 'paid' && (
                <div style={{ textAlign: "center", padding: "24px", background: invoice.payment_method === 'manual' ? "#F8FAFC" : "#ECFDF5", borderRadius: "12px", border: invoice.payment_method === 'manual' ? "1px dashed #94A3B8" : "1px solid #A7F3D0" }}>
                  <div style={{ color: invoice.payment_method === 'manual' ? "#64748B" : "#10B981", fontWeight: "900", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                     {invoice.payment_method === 'manual' ? "Marked as Paid (Manual)" : "Payment Complete"}
                  </div>
                  <div style={{ fontSize: "16px", color: "#0F172A", fontWeight: "600", marginBottom: "16px" }}>{thankYouMessage}</div>
                  {invoice.payment_method === 'manual' && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", color: "#EF4444", fontWeight: "800", background: "#FEF2F2", padding: "10px 14px", borderRadius: "6px", border: "1px solid #FECACA", width: "fit-content", margin: "0 auto" }}>
                      Logged via Cash/Direct Transfer. Not verified by KudiSlip.
                    </div>
                  )}
                </div>
              )}
              
              {currentUser?.id === vendor?.id && (
                <a href="/dashboard/invoices" className="btn-secondary btn-hover" style={{ width: "100%", boxSizing: "border-box", padding: "18px", marginTop: "16px", display: "block", textAlign: "center", fontSize: "15px" }}>Return to Dashboard</a>
              )}
            </div>
          </div>

          {invoice.status === 'paid' && currentUser?.id !== vendor?.id && !reviewSubmitted && (
            <div className="no-print card-hover" style={{ background: "#FFFFFF", borderRadius: "16px", border: `1px solid #E2E8F0`, padding: "36px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", marginBottom: "8px" }}>How was your experience?</h3>
              <p style={{ fontSize: "15px", color: "#64748B", marginBottom: "24px" }}>Your feedback helps us keep KudiSlip safe and professional.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                {starsArray.map(star => (
                  <StarIcon key={star} filled={star <= (hoverRating || rating)} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} />
                ))}
              </div>
              {rating > 0 && (
                <div style={{ animation: "toastSlideIn 0.3s ease forwards" }}>
                  <textarea className="form-input" placeholder="Leave a comment (optional)..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ width: "100%", minHeight: "80px", marginBottom: "16px", resize: "vertical", fontSize: "15px" }} />
                  <button className="btn-primary btn-hover" style={{ width: "100%", padding: "16px", fontSize: "15px" }} onClick={submitReview}>Submit Feedback</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

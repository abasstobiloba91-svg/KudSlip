function PublicInvoice({ invoiceId, showToast, currentUser }) {
  usePaystack();
  const [invoice, setInvoice] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  // Review System State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const starsArray = Array.from({ length: 5 }, function(_, i) { return i + 1; });
  const CURRENCY_SYMBOLS = { NGN: "₦", USD: "$", GBP: "£" };

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !invoiceId) { setDebugError("No valid payload found."); setLoading(false); return; }
      const { data: invData, error: invError } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
      if (invError) { setDebugError(`Msg: ${invError.message}`); setLoading(false); return; }

      if (invData) {
        setInvoice(invData);
        const { data: venData } = await supabase.from('vendors').select('*').eq('id', invData.vendor_id).single();
        const { data: cliData } = await supabase.from('clients').select('*').eq('id', invData.client_id).single();
        setVendor(venData); setClient(cliData);
      } else { setDebugError("Invoice row empty."); }
      loading === true && setLoading(false);
    }
    fetchData();
  }, [invoiceId]);

  const triggerPDFCompilation = () => {
    window.print();
  };

  const handlePayment = () => {
    if (!PAYSTACK_PUBLIC_KEY) return showToast("Configuration Error", "VITE_PAYSTACK_PUBLIC_KEY is missing in the system.", "error");
    if (!window.PaystackPop) return showToast("Loading", "Payment engine is loading, please wait...", "info");
    
    const baseAmount = Number(invoice?.amount || 0);
    const invoiceCurrency = invoice?.currency || "NGN";
    
    if (baseAmount <= 0) return showToast("Invalid Amount", "Cannot process payment. The invoice amount must be greater than 0.", "error");

    try {
      let finalAmount = baseAmount;
      
      if (invoice?.fee_passed_on && invoiceCurrency === "NGN" && vendor?.paystack_subaccount_code) {
        if (baseAmount < 2500) {
          finalAmount = baseAmount / 0.985;
        } else {
          const calculatedWithFees = (baseAmount + 100) / 0.985;
          const totalFeeCharged = calculatedWithFees - baseAmount;
          
          if (totalFeeCharged > 2000) {
            finalAmount = baseAmount + 2000;
          } else {
            finalAmount = calculatedWithFees;
          }
        }
      }

      const safeAmountInKobo = Math.round(finalAmount * 100);

      // 🎯 SECURE PAYSTACK PAYLOAD (CLEANED UP FOR BACKEND WEBHOOK)
      let paystackPayload = {
        key: PAYSTACK_PUBLIC_KEY,
        email: client?.email || "customer@kudislip.com",
        amount: safeAmountInKobo, 
        currency: invoiceCurrency,
        metadata: {
          invoice_id: invoice.id
        },
        callback: function(response) {
          supabase.from('invoices').update({ status: 'paid', payment_method: 'paystack' }).eq('id', invoice.id).then(() => {
            setInvoice({ ...invoice, status: 'paid', payment_method: 'paystack' });
            showToast("Payment Successful", "Your secure payment has been processed and your receipt is saved.", "success");
          });
        },
        onClose: function() { console.log("Payment window closed."); }
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

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Loading Secure Invoice...</div>;
  if (debugError) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#FFF1F2" }}>
      <GlobalStyles/>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", marginBottom: "16px" }}><AlertIcon /><h2 style={{ margin: 0 }}>System Routing Error</h2></div>
      <p style={{background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #FECACA", maxWidth: "600px"}}>{debugError}</p>
      <a href="/" className="btn-primary btn-hover" style={{marginTop: "16px"}}>Go to Dashboard</a>
    </div>
  );
  if (!invoice) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><GlobalStyles/>Invoice not found.</div>;

  let safeItems = [];
  try { safeItems = Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items || "[]"); } catch(e) { safeItems = []; }
  const safeAmount = Number(invoice.amount || 0);
  const safeDate = new Date(invoice.due_date || Date.now()).toLocaleDateString();
  const isFreeTier = !vendor?.subscription_tier || vendor.subscription_tier === 'free';
  const customColor = vendor?.brand_color || "#000000";
  const thankYouMessage = isFreeTier ? "Thank you for your payment! KudiSlip cares 💙." : (vendor.custom_thank_you || `Thank you for your payment! ${vendor.business_name} cares.`);
  
  const invoiceCurrency = invoice.currency || "NGN";
  const currencySymbol = CURRENCY_SYMBOLS[invoiceCurrency] || "₦";

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
        @media (max-width: 768px) {
          .invoice-page-wrapper { padding: 24px 16px; }
          .print-card { padding: 24px; }
        }
        
        /* 🖨️ THE FIX: Forces perfect margins on every computer */
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
            <button onClick={triggerPDFCompilation} className="btn-hover" style={{ background: "#FFFFFF", color: "#0F172A", border: `1px solid #E2E8F0`, padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
                 <polyline points="8 12 12 16 16 12"></polyline>
                 <line x1="12" y1="2" x2="12" y2="16"></line>
              </svg>
              Download PDF
            </button>
          </div>
          
          {isFreeTier && (
            <div style={{ textAlign: "center", marginBottom: "-8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Powered By</div>
              <img src="/logo.png" alt="KudiSlip" style={{ height: "24px", transform: "scale(1.5)" }} />
            </div>
          )}

          <div className="print-card card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Billed By</div>
                {vendor?.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.business_name} style={{ maxHeight: "40px", objectFit: "contain" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/logo.png" alt="KudiSlip Default" style={{ maxHeight: "24px", objectFit: "contain" }} />
                    <div style={{ fontSize: "18px", fontWeight: "900", color: "#0F172A" }}>{vendor?.business_name || "Verified Merchant"}</div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Status</div>
                <div style={{ display: "inline-block", background: invoice.status === 'pending' ? "#FEF3C7" : "#ECFDF5", color: invoice.status === 'pending' ? "#D97706" : "#10B981", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>{invoice.status || 'PENDING'}</div>
              </div>
            </div>
            
            <div style={{ borderTop: `1px solid #E2E8F0`, borderBottom: `1px solid #E2E8F0`, padding: "24px 0", marginBottom: "32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Billed To</div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#0F172A", marginTop: "4px" }}>{client?.name || "Client"}</div>
                <div style={{ fontSize: "14px", color: "#64748B", marginTop: "2px" }}>{client?.email || "No email"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Due Date</div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#0F172A", marginTop: "4px" }}>{safeDate}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid #E2E8F0` }}>
                <div style={{ flex: 1 }}>Description</div>
                <div style={{ width: "60px", textAlign: "center" }}>Qty</div>
                <div style={{ width: "120px", textAlign: "right" }}>Amount</div>
              </div>
              
              {safeItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px dashed #E2E8F0" }}>
                  <div style={{ flex: 1, fontWeight: "600", fontSize: "14px", color: "#0F172A", wordBreak: "break-word", paddingRight: "16px" }}>{item.description}</div>
                  <div style={{ width: "60px", textAlign: "center", fontSize: "14px", color: "#64748B", fontWeight: "600" }}>{item.quantity}</div>
                  <div style={{ width: "120px", textAlign: "right", fontWeight: "800", fontSize: "14px", color: "#0F172A" }}>{currencySymbol}{Number(item.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
            
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", border: `1px solid #E2E8F0` }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px" }}>Total Amount</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: customColor, textAlign: "right", wordBreak: "break-word" }}>{currencySymbol}{safeAmount.toLocaleString()}</div>
            </div>
            
            <div className="no-print">
              {invoice.status === 'pending' ? (
                <button className="btn-hover" style={{ width: "100%", padding: "18px", background: customColor, color: "#FFF", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} onClick={handlePayment}>
                  Proceed to Secure Payment
                </button>
              ) : (
                <div style={{ textAlign: "center", padding: "20px", background: invoice.payment_method === 'manual' ? "#F8FAFC" : "#ECFDF5", borderRadius: "12px", border: invoice.payment_method === 'manual' ? "1px dashed #94A3B8" : "1px solid #A7F3D0" }}>
                  <div style={{ color: invoice.payment_method === 'manual' ? "#64748B" : "#10B981", fontWeight: "900", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                     {invoice.payment_method === 'manual' ? "Marked as Paid (Manual)" : "Payment Complete"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#0F172A", fontWeight: "600", marginBottom: "12px" }}>{thankYouMessage}</div>
                  
                  {invoice.payment_method === 'manual' && (
                    <div style={{ fontSize: "12px", color: "#EF4444", fontWeight: "800", background: "#FEF2F2", padding: "8px 12px", borderRadius: "6px", display: "inline-block", border: "1px solid #FECACA" }}>
                      ⚠️ Logged via Cash/Direct Transfer. Not verified by KudiSlip.
                    </div>
                  )}
                  {invoice.payment_method === 'paystack' && (
                    <div style={{ fontSize: "12px", color: "#10B981", fontWeight: "800" }}>
                      🔒 Securely Verified by Paystack
                    </div>
                  )}
                </div>
              )}
              
              {currentUser?.id === vendor?.id && (
                <a href="/dashboard/invoices" className="btn-secondary btn-hover" style={{ width: "100%", boxSizing: "border-box", padding: "16px", marginTop: "16px", display: "block", textAlign: "center" }}>Return to Dashboard</a>
              )}
            </div>
          </div>

          {/* Review Component */}
          {invoice.status === 'paid' && currentUser?.id !== vendor?.id && !reviewSubmitted && (
            <div className="no-print card-hover" style={{ background: "#FFFFFF", borderRadius: "16px", border: `1px solid #E2E8F0`, padding: "32px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", marginBottom: "8px" }}>How was your experience?</h3>
              <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>Your feedback helps us keep KudiSlip safe and professional.</p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                {starsArray.map(star => (
                  <StarIcon 
                    key={star} 
                    filled={star <= (hoverRating || rating)} 
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              
              {rating > 0 && (
                <div style={{ animation: "toastSlideIn 0.3s ease forwards" }}>
                  <textarea className="form-input" placeholder="Leave a comment (optional)..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ width: "100%", minHeight: "80px", marginBottom: "16px", resize: "vertical" }} />
                  <button className="btn-primary btn-hover" style={{ width: "100%" }} onClick={submitReview}>Submit Feedback</button>
                </div>
              )}
            </div>
          )}

          {invoice.status === 'paid' && currentUser?.id !== vendor?.id && (
             <a href="/" className="btn-secondary btn-hover no-print" style={{ width: "100%", boxSizing: "border-box", padding: "16px", background: "#FFFFFF", textAlign: "center", borderRadius: "12px", display: "block" }}>Return to KudiSlip Home</a>
          )}

        </div>
      </div>
    </>
  );
}

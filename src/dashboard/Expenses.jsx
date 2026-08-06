import React, { useState, useEffect } from 'react';
import { supabase, DESIGN } from '../supabaseClient';

function ExpensesManager({ user, showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    const [expRes, invRes] = await Promise.all([
      supabase.from('expenses').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('amount, status').eq('vendor_id', user.id).eq('status', 'paid')
    ]);
    
    if (expRes.data) setExpenses(expRes.data);
    if (invRes.data) setInvoices(invRes.data);
    setLoading(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (user?.subscription_tier !== 'premium') {
      return showToast("Premium Required", "Please upgrade to log expenses and track net profit.", "info");
    }
    if (!description || !amount) return;
    
    setSaving(true);
    const { error } = await supabase.from('expenses').insert([{ vendor_id: user.id, description, amount: Number(amount) }]);
    if (error) {
      showToast("Error", error.message, "error");
    } else {
      showToast("Expense Saved", "Successfully added to your ledger.", "success");
      setDescription(""); setAmount("");
      fetchData();
    }
    setSaving(false);
  };

  const handleDeleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id);
    showToast("Deleted", "Expense removed.", "info");
    fetchData();
  };

  const totalGross = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netProfit = totalGross - totalExpenses;
  
  const isPremium = user?.subscription_tier === 'premium';

  if (loading) return <div style={{ color: "#64748B", fontWeight: "600" }}>Loading Ledger...</div>;

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>Profit Analytics <span style={{fontSize: "12px", background: "#FEF08A", color: "#854D0E", padding: "4px 8px", borderRadius: "6px", verticalAlign: "middle"}}>PRO</span></div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Track your actual business margins.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="metric-card">
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Gross Revenue</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#0F172A", marginTop: "8px" }}>₦{totalGross.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Total Expenses</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#EF4444", marginTop: "8px" }}>- ₦{totalExpenses.toLocaleString()}</div>
        </div>
        <div className="metric-card" style={{ background: "#10B981", color: "#FFFFFF", borderColor: "#059669" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#ECFDF5", textTransform: "uppercase" }}>Actual Net Profit</div>
          <div style={{ fontSize: "28px", fontWeight: "900", marginTop: "8px" }}>₦{netProfit.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ position: "relative", background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "40px", overflow: "hidden" }}>
        
        {/* 🎯 THE GLASSMORPHISM PAYWALL */}
        {!isPremium && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(4px)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
             <div style={{ background: "#F5F3FF", color: DESIGN.premium, padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "900", marginBottom: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>PREMIUM FEATURE</div>
             <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", margin: "0 0 8px 0" }}>Unlock Profit Analytics</h3>
             <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px", maxWidth: "320px", lineHeight: "1.5" }}>Log business expenses to automatically calculate your true net profit.</p>
             <a href="/dashboard/billing" className="btn-primary btn-premium btn-hover">Upgrade to Premium</a>
          </div>
        )}

        <div style={{ opacity: !isPremium ? 0.4 : 1, pointerEvents: !isPremium ? "none" : "auto" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "800" }}>Log Business Expense</h3>
          <form onSubmit={handleAddExpense} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: "200px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Description</label>
              <input className="form-input" placeholder="e.g. Server Hosting, Office Rent" value={description} onChange={e=>setDescription(e.target.value)} required />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Amount (₦)</label>
              <input className="form-input" type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)} required />
            </div>
            <button className="btn-primary btn-hover" type="submit" disabled={saving}>{saving ? "Saving..." : "Add to Ledger"}</button>
          </form>
        </div>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Expense History</h3>
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, overflowX: "auto" }}>
        {expenses.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No expenses logged yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "500px" }}>
            <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
              <tr><th style={{ padding: "16px 24px" }}>Date</th><th style={{ padding: "16px 24px" }}>Description</th><th style={{ padding: "16px 24px", textAlign: "right" }}>Amount</th><th style={{ padding: "16px 24px", width: "50px" }}></th></tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderTop: `1px solid #E2E8F0` }}>
                  <td style={{ padding: "16px 24px", color: "#64748B", fontSize: "13px" }}>{new Date(exp.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "16px 24px", fontWeight: "600" }}>{exp.description}</td>
                  <td style={{ padding: "16px 24px", fontWeight: "900", color: "#EF4444", textAlign: "right" }}>-₦{Number(exp.amount).toLocaleString()}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontWeight: "800" }}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ExpensesManager;

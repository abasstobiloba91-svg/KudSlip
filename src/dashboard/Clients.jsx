import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ClientsManager({ user, showToast }) {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    
    // Fetch clients
    supabase.from('clients').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setClients(data || []));
    
    // Fetch all invoices to calculate the credit score mathematically
    supabase.from('invoices').select('client_id, status, due_date').eq('vendor_id', user.id).then(({ data }) => setInvoices(data || []));
  }, []);

  const handleAddClient = async (e) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.from('clients').insert([{ vendor_id: user.id, name, email, phone }]).select().single();
    if (!error && data) { 
      setClients([data, ...clients]); setName(""); setEmail(""); setPhone(""); 
      showToast("Client Added", "Customer has been added successfully to your directory.", "success"); 
    }
    else if (error) { showToast("Database Error", "Failed to add client. Check database permissions.", "error"); }
    setLoading(false);
  };

  // 🎯 THE DYNAMIC CREDIT SCORE ENGINE
  const getClientScore = (clientId) => {
    const clientInvoices = invoices.filter(i => i.client_id === clientId);
    
    if (clientInvoices.length === 0) {
      return { label: "NEW", color: "#64748B", bg: "#F1F5F9", text: "No data" };
    }

    let score = 100;
    const now = new Date();
    now.setHours(0,0,0,0); // Normalize to midnight for accurate day comparison

    clientInvoices.forEach(inv => {
      const dueDate = new Date(inv.due_date);
      
      if (inv.status === 'paid') {
        score += 5; // Small boost for completed payments
      } else if (inv.status === 'pending' && dueDate < now) {
        score -= 35; // Massive penalty for holding overdue debt
      }
    });

    if (score >= 100) return { label: "A+ (Excellent)", color: "#10B981", bg: "#ECFDF5", text: "Pays on time" };
    if (score >= 70) return { label: "B (Good)", color: "#3B82F6", bg: "#EFF6FF", text: "Reliable" };
    if (score >= 40) return { label: "C (Slow)", color: "#D97706", bg: "#FEF3C7", text: "Often late" };
    return { label: "F (High Risk)", color: "#EF4444", bg: "#FEF2F2", text: "Overdue debt" };
  };

  if (user?.role === 'support') return <div style={{ padding: "40px", color: "#64748B" }}>Support accounts cannot access Client CRM.</div>;

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Client Directory</div>
      <div style={{ color: "#64748B", marginBottom: "36px", fontSize: "15px" }}>Manage your customer database and track payment reliability.</div>
      
      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, padding: "32px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800" }}>Add New Client</h3>
        <form onSubmit={handleAddClient} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", alignItems: "end" }}>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Name</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Email (Optional)</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "8px", fontWeight: "700" }}>Phone</label><input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <button className="btn-primary btn-hover" type="submit" disabled={loading}>{loading ? "Saving..." : "Add Client"}</button>
        </form>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid #E2E8F0`, borderRadius: 12, overflowX: "auto" }}>
        {clients.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No clients added yet.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "700px" }}>
            <thead style={{ background: "#F1F5F9", fontSize: "12px", color: "#64748B", textTransform: "uppercase" }}>
              <tr>
                <th style={{ padding: "16px 24px" }}>Client Name</th>
                <th style={{ padding: "16px 24px" }}>Contact Info</th>
                <th style={{ padding: "16px 24px" }}>Trust Score</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => {
                const score = getClientScore(c.id);
                return (
                  <tr key={c.id} style={{ borderTop: `1px solid #E2E8F0` }}>
                    <td style={{ padding: "16px 24px", fontWeight: "800", color: "#0F172A" }}>{c.name}</td>
                    <td style={{ padding: "16px 24px", color: "#64748B", fontSize: "13px", lineHeight: "1.6" }}>
                      {c.email && <div>✉️ {c.email}</div>}
                      {c.phone && <div>📞 {c.phone}</div>}
                      {(!c.email && !c.phone) && "—"}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ background: score.bg, color: score.color, padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {score.label}
                        </span>
                        <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", paddingLeft: "4px" }}>{score.text}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ClientsManager;

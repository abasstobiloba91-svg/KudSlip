import React, { useState, useEffect } from 'react';

export default function TaxLedgerTab({ user, showToast, supabase }) {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(7.5); // Default to Nigerian VAT/Standard rate

  useEffect(() => {
    if (user?.id && supabase) {
      fetchLedgerData();
    }
  }, [user, supabase]);

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch PAID invoices WITH client details
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .eq('vendor_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (invError) throw invError;
      setInvoices(invData || []);

      // 2. Fetch recorded expenses
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (expError) throw expError;
      setExpenses(expData || []);

    } catch (error) {
      console.error("Ledger Fetch Error:", error);
      showToast("Error", "Could not load tax ledger data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Calculations ---
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const estimatedTax = netProfit > 0 ? (netProfit * (taxRate / 100)) : 0;

  // --- Advanced Export Function ---
  const handleExportCSV = () => {
    try {
      // 1. Setup Detailed Tax-Compliant CSV Headers
      const rows = [
        ["Date", "Transaction Ref", "Type", "Category", "Client / Payee", "Transaction Details (Items)", "Amount (NGN)"]
      ];

      // 2. Combine, Format & Sort Data
      const combinedLedger = [
        ...invoices.map(i => {
          // Parse invoice items safely to show exactly what was sold
          let itemDescriptions = "Sales Revenue";
          try {
            const parsedItems = typeof i.items === 'string' ? JSON.parse(i.items) : (i.items || []);
            if (parsedItems.length > 0) {
              itemDescriptions = parsedItems.map(item => `${item.description} (x${item.quantity})`).join('; ');
            }
          } catch(e) {
            console.error("Could not parse items for invoice", i.id);
          }

          return {
            date: new Date(i.created_at),
            ref: `INV-${i.id.substring(0, 8).toUpperCase()}`,
            type: "Income",
            category: "Business Revenue",
            entity: i.clients?.name || "Unknown Client",
            details: itemDescriptions,
            amt: Number(i.amount)
          };
        }),
        ...expenses.map(e => ({
          date: new Date(e.created_at),
          ref: `EXP-${e.id.substring(0, 8).toUpperCase()}`,
          type: "Expense",
          category: e.category || "General Business Expense",
          entity: "Business Vendor", 
          details: e.description || "N/A",
          amt: -Number(e.amount)
        }))
      ].sort((a, b) => b.date - a.date); // Sort newest to oldest

      // 3. Add rows (Wrapping text in quotes prevents commas from breaking columns)
      combinedLedger.forEach(item => {
        rows.push([
          item.date.toLocaleDateString(),
          `"${item.ref}"`,
          item.type,
          `"${item.category}"`,
          `"${item.entity}"`,
          `"${item.details}"`,
          item.amt
        ]);
      });

      // 4. Add Summary Footer
      rows.push([]);
      rows.push(["", "", "", "", "", "TOTAL GROSS REVENUE", totalRevenue]);
      rows.push(["", "", "", "", "", "TOTAL DEDUCTIBLE EXPENSES", totalExpenses]);
      rows.push(["", "", "", "", "", "NET TAXABLE PROFIT", netProfit]);
      rows.push(["", "", "", "", "", `ESTIMATED TAX LIABILITY (${taxRate}%)`, estimatedTax]);

      // 5. Trigger Download
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `KudiSlip_Tax_Ledger_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("Report Exported!", "Detailed tax ledger downloaded.", "success");
    } catch (err) {
      console.error(err);
      showToast("Export Failed", "Could not generate the CSV report.", "error");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "14px", fontWeight: "600" }}>Calculating Ledger Data...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 12px 40px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#0F172A", marginBottom: "8px" }}>Tax & Profit Ledger</div>
          <div style={{ color: "#64748B", fontSize: "15px" }}>Automated financial reporting for your business returns.</div>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="btn-primary btn-hover"
          style={{ padding: "12px 20px", background: "#000000", color: "#FFFFFF", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV Report
        </button>
      </div>

      {/* Settings Row */}
      <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "16px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ fontSize: "13px", fontWeight: "800", color: "#475569" }}>Set Custom Tax Rate (%):</label>
        <input 
          type="number" 
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
          style={{ width: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontWeight: "800", fontSize: "14px" }}
        />
        <span style={{ fontSize: "12px", color: "#94A3B8" }}>(Default is 7.5% for standard VAT)</span>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Total Revenue</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#0F172A" }}>₦{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "8px" }}>From {invoices.length} paid invoices</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Total Expenses</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#EF4444" }}>₦{totalExpenses.toLocaleString()}</div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "8px" }}>From {expenses.length} logged expenses</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>Net Profit</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: netProfit >= 0 ? "#10B981" : "#EF4444" }}>
            {netProfit < 0 ? "-" : ""}₦{Math.abs(netProfit).toLocaleString()}
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "8px" }}>Revenue minus expenses</div>
        </div>

      </div>

      {/* Tax Liability Banner */}
      <div style={{ background: "#F3E8FF", border: "1px solid #D8B4FE", borderRadius: "16px", padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "800", color: "#6B21A8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Estimated Tax Liability
          </div>
          <div style={{ color: "#7E22CE", fontSize: "14px", maxWidth: "400px", lineHeight: "1.5" }}>
            Based on a <strong>{taxRate}%</strong> rate applied to your net profit. Save this amount to remain compliant during tax season.
          </div>
        </div>
        <div style={{ fontSize: "36px", fontWeight: "900", color: "#581C87" }}>
          ₦{estimatedTax.toLocaleString()}
        </div>
      </div>

    </div>
  );
}

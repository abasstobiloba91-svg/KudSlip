import React from 'react';

export default function TaxLedgerTab({ generateTaxReport }) {
  return (
    <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        {/* Document Chart SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", margin: 0 }}>Tax & Revenue Ledger</h3>
      </div>
      
      <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
        Filing taxes in Nigeria requires a record of your total gross income. Download an automated spreadsheet of all your KudiSlip transactions to hand directly to your accountant or upload to FIRS.
      </p>

      <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "8px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontWeight: "600", color: "#334155", margin: "0 0 4px 0" }}>Export All-Time Ledger</p>
          <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Format: CSV / Excel</p>
        </div>
        
        <button 
          onClick={generateTaxReport} 
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#FFFFFF", color: "#0F172A", borderRadius: "6px", fontWeight: "600", border: "1px solid #CBD5E1", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
          {/* Download SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download CSV
        </button>
      </div>
    </div>
  );
}

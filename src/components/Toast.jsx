import React from 'react';
import { AlertIcon, InfoIcon, CheckIcon, CloseIcon } from './Icons';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  
  const styles = {
    error: { bg: "#FEF2F2", border: "#FECACA", color: "#EF4444", icon: <AlertIcon /> },
    info: { bg: "#F8FAFC", border: "#E2E8F0", color: "#3B82F6", icon: <InfoIcon /> },
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#10B981", icon: <CheckIcon /> }
  }[toast.type] || { bg: "#ECFDF5", border: "#A7F3D0", color: "#10B981", icon: <CheckIcon /> };

  return (
    <div className="toast-container" style={{ position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 10000, background: styles.bg, border: `1px solid ${styles.border}`, padding: "16px 24px", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", display: "flex", alignItems: "flex-start", gap: "16px", minWidth: "320px", maxWidth: "90%" }}>
      <div style={{ color: styles.color, display: "flex", marginTop: "2px" }}>{styles.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "800", fontSize: "14px", color: "#0F172A", marginBottom: "4px" }}>{toast.title}</div>
        <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.4" }}>{toast.message}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px", display: "flex", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#0F172A"} onMouseOut={(e) => e.currentTarget.style.color = "#64748B"}>
        <CloseIcon />
      </button>
    </div>
  );
};

export default Toast;

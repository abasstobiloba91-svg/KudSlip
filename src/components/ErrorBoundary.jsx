import React from 'react';
import { AlertIcon } from './Icons';

class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "#FFF1F2", color: "#0F172A", textAlign: "center" }}>
          <AlertIcon />
          <h2 style={{ color: "#EF4444", marginTop: "16px" }}>App Rendering Error</h2>
          <p style={{ maxWidth: "500px", color: "#64748B", marginBottom: "24px" }}>{this.state.error?.toString()}</p>
          <button className="btn-primary btn-hover" onClick={() => window.location.reload()}>Reload KudiSlip</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

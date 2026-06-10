// App.jsx (or wherever your routes are)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KudiSlipAuth from './components/KudiSlipAuth';
import DashboardLayout from './components/DashboardLayout';
import UpdatePassword from './components/UpdatePassword'; // 1. Import it here!

function App() {
  const showToast = (title, message, type) => {
    // your existing toast logic
  };

  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<KudiSlipAuth showToast={showToast} />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
        
        {/* 2. ADD THIS NEW ROUTE HERE */}
        <Route 
          path="/update-password" 
          element={<UpdatePassword showToast={showToast} />} 
        />
        
      </Routes>
    </Router>
  );
}

export default App;

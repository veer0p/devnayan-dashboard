import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Doctors from './pages/Doctors';
import Help from './pages/Help';
import Inquiries from './pages/Inquiries';
import PublicPayment from './pages/PublicPayment';
import MobileBottomNav from './components/layout/MobileBottomNav';

function App() {
  const location = useLocation();
  const isPublicPay = location.pathname.startsWith('/pay/');

  useEffect(() => {
    const doctorsStr = localStorage.getItem('dentease.doctors');
    if (doctorsStr && doctorsStr.includes('${clinic.doctorName}')) {
      localStorage.removeItem('dentease.doctors');
      localStorage.removeItem('dentease.patients');
      window.location.reload();
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/inquiries" element={<Inquiries />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/profile" element={<Navigate to="/doctors" replace />} />
        <Route path="/help" element={<Help />} />
        <Route path="/pay/:invoiceId" element={<PublicPayment />} />
      </Routes>
      {!isPublicPay && <MobileBottomNav />}
    </>
  );
}

export default App;

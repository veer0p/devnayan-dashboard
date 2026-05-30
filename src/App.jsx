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
import Reports from './pages/Reports';
import MobileBottomNav from './components/layout/MobileBottomNav';
import { useClinic } from './context/ClinicContext';

const getPageName = (pathname) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/appointments')) return 'Appointments';
  if (pathname.startsWith('/inquiries')) return 'Inquiries';
  if (pathname.startsWith('/patients')) return 'Patients';
  if (pathname.startsWith('/billing')) return 'Billing';
  if (pathname.startsWith('/inventory')) return 'Inventory';
  if (pathname.startsWith('/doctors')) return 'Doctors';
  if (pathname.startsWith('/help')) return 'Help';
  if (pathname.startsWith('/pay/')) return 'Invoice Payment';
  
  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment) {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  return '';
};

function App() {
  const location = useLocation();
  const isPublicPay = location.pathname.startsWith('/pay/');
  const { clinic, activeClinicId } = useClinic();

  useEffect(() => {
    if (clinic && clinic.name) {
      const pageName = getPageName(location.pathname);
      document.title = pageName ? `${pageName} | ${clinic.name}` : clinic.name;
    }
  }, [clinic, location.pathname]);

  useEffect(() => {
    const doctorsStr = localStorage.getItem('dentease.doctors');
    if (doctorsStr && doctorsStr.includes('${clinic.doctorName}')) {
      localStorage.removeItem('dentease.doctors');
      localStorage.removeItem('dentease.patients');
      window.location.reload();
    }

    // Cache-invalidation for Janki Matroja's phone number update
    const jankiDoctors = localStorage.getItem('dentease.janki.doctors');
    if (jankiDoctors && !jankiDoctors.includes('87801')) {
      localStorage.removeItem('dentease.janki.doctors');
      localStorage.removeItem('dentease.janki.patients');
      localStorage.removeItem('dentease.janki.appointments');
      localStorage.removeItem('dentease.janki.invoices');
      window.location.reload();
    }

    // Cache-invalidation for new mock appointments (containing a12)
    let reloaded = false;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('dentease.') && key.endsWith('.appointments')) {
        const apps = localStorage.getItem(key);
        if (apps && !apps.includes('"a12"')) {
          localStorage.removeItem(key);
          reloaded = true;
        }
      }
    });
    if (reloaded) {
      window.location.reload();
    }
  }, []);

  return (
    <div key={activeClinicId}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/inquiries" element={<Inquiries />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Navigate to="/doctors" replace />} />
        <Route path="/help" element={<Help />} />
        <Route path="/pay/:invoiceId" element={<PublicPayment />} />
      </Routes>
      {!isPublicPay && <MobileBottomNav />}
    </div>
  );
}

export default App;

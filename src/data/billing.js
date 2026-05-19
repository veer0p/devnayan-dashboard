export const invoiceStatuses = ['Paid', 'Partial', 'Unpaid'];

export const deriveStatus = (amount, paid) => {
  if (amount <= 0 || paid >= amount) return 'Paid';
  if (paid <= 0) return 'Unpaid';
  return 'Partial';
};

const todayISO = new Date().toISOString().slice(0, 10);

// Virajsinh's monthly braces adjustments — keeps a steady recurring revenue line.
const virajshinSchedule = [
  { date: '2025-05-20', label: 'Initial Braces Placement' },
  { date: '2025-06-19' },
  { date: '2025-07-17' },
  { date: '2025-08-21' },
  { date: '2025-09-18' },
  { date: '2025-10-16' },
  { date: '2025-11-20' },
  { date: '2025-12-18' },
  { date: '2026-01-15' },
  { date: '2026-02-19' },
  { date: '2026-03-19' },
  { date: '2026-04-16' },
];

const virajshinInvoices = virajshinSchedule.map((entry, idx) => ({
  id: `INV-V${String(idx + 1).padStart(2, '0')}`,
  patientId: '6',
  patient: 'Virajsinh DharmendraSingh Atodariya',
  doctorId: 'd2',
  treatment: entry.label || 'Braces - Monthly Adjustment',
  date: entry.date,
  amount: 2500,
  paid: 2500,
  status: 'Paid',
}));

// Revenue history across the trailing 12 months (2025-05-19 → 2026-05-19).
// Mix of patients, treatments, statuses, and amounts so the monthly chart reads naturally.
const historicInvoices = [
  // May 2025
  { id: 'INV-2505-01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'General Consultation', date: '2025-05-22', amount: 500, paid: 500, status: 'Paid' },
  { id: 'INV-2505-02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Cleaning & Polishing', date: '2025-05-28', amount: 1200, paid: 1200, status: 'Paid' },

  // June 2025
  { id: 'INV-2506-01', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Extraction', date: '2025-06-08', amount: 2000, paid: 2000, status: 'Paid' },
  { id: 'INV-2506-02', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Cavity Filling', date: '2025-06-14', amount: 1500, paid: 1500, status: 'Paid' },
  { id: 'INV-2506-03', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Teeth Whitening', date: '2025-06-25', amount: 3500, paid: 3500, status: 'Paid' },

  // July 2025
  { id: 'INV-2507-01', patientId: '5', patient: 'Kabir Kumar', doctorId: 'd1', treatment: 'General Consultation', date: '2025-07-04', amount: 500, paid: 500, status: 'Paid' },
  { id: 'INV-2507-02', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Scaling & Root Planing', date: '2025-07-19', amount: 2200, paid: 2200, status: 'Paid' },

  // August 2025
  { id: 'INV-2508-01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Teeth Whitening', date: '2025-08-22', amount: 3500, paid: 3500, status: 'Paid' },
  { id: 'INV-2508-02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Cleaning & Polishing', date: '2025-08-09', amount: 1200, paid: 1200, status: 'Paid' },
  { id: 'INV-2508-03', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Crown Preparation', date: '2025-08-27', amount: 5000, paid: 5000, status: 'Paid' },

  // September 2025
  { id: 'INV-2509-01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Root Canal', date: '2025-09-11', amount: 8000, paid: 8000, status: 'Paid' },
  { id: 'INV-2509-02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Cavity Filling', date: '2025-09-23', amount: 1500, paid: 1500, status: 'Paid' },

  // October 2025
  { id: 'INV-2510-01', patientId: '5', patient: 'Kabir Kumar', doctorId: 'd1', treatment: 'Teeth Whitening', date: '2025-10-03', amount: 3500, paid: 3500, status: 'Paid' },
  { id: 'INV-2510-02', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Cleaning & Polishing', date: '2025-10-15', amount: 1200, paid: 1200, status: 'Paid' },
  { id: 'INV-2510-03', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'General Consultation', date: '2025-10-28', amount: 500, paid: 500, status: 'Paid' },

  // November 2025
  { id: 'INV-2511-01', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Extraction + Follow-up', date: '2025-11-15', amount: 2000, paid: 2000, status: 'Paid' },
  { id: 'INV-2511-02', patientId: '4', patient: 'Ananya Singh', doctorId: 'd1', treatment: 'Emergency Consultation', date: '2025-11-08', amount: 800, paid: 800, status: 'Paid' },
  { id: 'INV-2511-03', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Crown Preparation', date: '2025-11-22', amount: 5000, paid: 5000, status: 'Paid' },

  // December 2025
  { id: 'INV-2512-01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Cleaning & Polishing', date: '2025-12-06', amount: 1200, paid: 1200, status: 'Paid' },
  { id: 'INV-2512-02', patientId: '5', patient: 'Kabir Kumar', doctorId: 'd1', treatment: 'Cavity Filling', date: '2025-12-19', amount: 1500, paid: 1500, status: 'Paid' },

  // January 2026
  { id: 'INV-2601-01', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Root Canal', date: '2026-01-09', amount: 8000, paid: 4000, status: 'Partial' },
  { id: 'INV-2601-02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Teeth Whitening', date: '2026-01-22', amount: 3500, paid: 3500, status: 'Paid' },
  { id: 'INV-2601-03', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Cavity Filling', date: '2026-01-30', amount: 1500, paid: 1500, status: 'Paid' },

  // February 2026
  { id: 'INV-2602-01', patientId: '5', patient: 'Kabir Kumar', doctorId: 'd1', treatment: 'Cleaning & Polishing', date: '2026-02-05', amount: 1200, paid: 1200, status: 'Paid' },
  { id: 'INV-2602-02', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Crown Preparation', date: '2026-02-21', amount: 5000, paid: 5000, status: 'Paid' },

  // March 2026
  { id: 'INV-2603-01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Cavity Filling', date: '2026-03-07', amount: 1500, paid: 1500, status: 'Paid' },
  { id: 'INV-2603-02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Teeth Whitening', date: '2026-03-15', amount: 3500, paid: 3500, status: 'Paid' },
  { id: 'INV-2603-03', patientId: '4', patient: 'Ananya Singh', doctorId: 'd1', treatment: 'General Consultation', date: '2026-03-28', amount: 500, paid: 500, status: 'Paid' },

  // April 2026
  { id: 'INV-2604-01', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Teeth Whitening', date: '2026-04-20', amount: 3500, paid: 3500, status: 'Paid' },
  { id: 'INV-2604-02', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Cleaning & Polishing', date: '2026-04-12', amount: 1200, paid: 1200, status: 'Paid' },
  { id: 'INV-2604-03', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Crown Preparation', date: '2026-04-26', amount: 5000, paid: 2500, status: 'Partial' },

  // May 2026 (this month, pre-today)
  { id: 'INV-2605-01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'General Consultation', date: '2026-05-10', amount: 500, paid: 500, status: 'Paid' },
  { id: 'INV-2605-02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'Crown Preparation', date: '2026-05-01', amount: 5000, paid: 2500, status: 'Partial' },
  { id: 'INV-2605-03', patientId: '5', patient: 'Kabir Kumar', doctorId: 'd1', treatment: 'General Consultation', date: '2026-05-10', amount: 500, paid: 0, status: 'Unpaid' },
  { id: 'INV-2605-04', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Root Canal', date: '2026-05-05', amount: 8000, paid: 4000, status: 'Partial' },
  { id: 'INV-2605-05', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Cleaning & Polishing', date: '2026-05-12', amount: 1200, paid: 0, status: 'Unpaid' },

  // Today
  { id: 'INV-T01', patientId: '1', patient: 'Aarav Patel', doctorId: 'd1', treatment: 'Cleaning & Polishing', date: todayISO, amount: 1200, paid: 1200, status: 'Paid' },
  { id: 'INV-T02', patientId: '2', patient: 'Diya Sharma', doctorId: 'd1', treatment: 'General Consultation', date: todayISO, amount: 500, paid: 500, status: 'Paid' },
  { id: 'INV-T03', patientId: '5', patient: 'Kabir Kumar', doctorId: 'd1', treatment: 'Teeth Whitening', date: todayISO, amount: 3500, paid: 2000, status: 'Partial' },
  { id: 'INV-T04', patientId: '3', patient: 'Rohan Gupta', doctorId: 'd3', treatment: 'Root Canal', date: todayISO, amount: 8000, paid: 8000, status: 'Paid' },
  { id: 'INV-T05', patientId: '6', patient: 'Virajsinh DharmendraSingh Atodariya', doctorId: 'd2', treatment: 'Braces - Monthly Adjustment', date: todayISO, amount: 2500, paid: 2500, status: 'Paid' },
];

export const mockInvoices = [...historicInvoices, ...virajshinInvoices];

export const nextInvoiceId = (invoices) => {
  const maxNum = invoices.reduce((max, inv) => {
    const m = inv.id.match(/INV-(\d+)$/);
    if (!m) return max;
    return Math.max(max, parseInt(m[1], 10));
  }, 0);
  return `INV-${String(maxNum + 1).padStart(3, '0')}`;
};

export const mockPatientsList = [
  { 
    id: '1', 
    name: 'Aarav Patel', 
    age: 34,
    gender: 'Male',
    phone: '+91 98765 43210', 
    address: 'Andheri West, Mumbai',
    registrationDate: '2024-11-15',
    lastVisit: '2026-04-10',
    totalVisits: 4,
    balance: 0,
    status: 'Active',
    medicalAlerts: [],
    teethConditions: {
      '14': 'filled',
      '26': 'needs_treatment',
      '48': 'extracted'
    },
    history: [
      { id: 'h1', date: '2026-04-10', treatment: 'General Consultation', doctor: 'Dr. Sharma', cost: 500, status: 'Paid', notes: 'Routine checkup. Found minor cavity on 26.' },
      { id: 'h2', date: '2025-08-22', treatment: 'Teeth Whitening', doctor: 'Dr. Sharma', cost: 3500, status: 'Paid', notes: 'Laser whitening. Patient satisfied.' }
    ]
  },
  { 
    id: '2', 
    name: 'Diya Sharma', 
    age: 28,
    gender: 'Female',
    phone: '+91 98765 43211', 
    address: 'Bandra, Mumbai',
    registrationDate: '2025-02-10',
    lastVisit: '2026-05-01',
    totalVisits: 2,
    balance: 2500,
    status: 'Active',
    medicalAlerts: ['Penicillin Allergy', 'Asthma'],
    teethConditions: {
      '11': 'crown',
      '21': 'crown'
    },
    history: [
      { id: 'h3', date: '2026-05-01', treatment: 'Crown Preparation', doctor: 'Dr. Sharma', cost: 5000, status: 'Pending', notes: 'Prepared 11 and 21 for crowns. Temps placed.' }
    ]
  },
  { 
    id: '3', 
    name: 'Rohan Gupta', 
    age: 45,
    gender: 'Male',
    phone: '+91 98765 43212', 
    address: 'Powai, Mumbai',
    registrationDate: '2023-05-20',
    lastVisit: '2025-11-15',
    totalVisits: 8,
    balance: 0,
    status: 'Active',
    medicalAlerts: ['Hypertension'],
    teethConditions: {
      '38': 'extracted',
      '48': 'extracted',
      '18': 'extracted',
      '28': 'extracted',
      '36': 'filled',
      '46': 'filled'
    },
    history: [
      { id: 'h4', date: '2025-11-15', treatment: 'Extraction', doctor: 'Dr. Sharma', cost: 2000, status: 'Paid', notes: 'Extracted 48 (impacted wisdom). Sutures placed.' },
      { id: 'h5', date: '2025-11-22', treatment: 'Follow-up', doctor: 'Dr. Sharma', cost: 0, status: 'Paid', notes: 'Removed sutures. Healing well.' }
    ]
  },
  { 
    id: '4', 
    name: 'Ananya Singh', 
    age: 52,
    gender: 'Female',
    phone: '+91 98765 43213', 
    address: 'Juhu, Mumbai',
    registrationDate: '2022-01-10',
    lastVisit: '2024-03-12',
    totalVisits: 1,
    balance: 0,
    status: 'Inactive',
    medicalAlerts: ['Diabetes Type II'],
    teethConditions: {
      '16': 'extracted',
      '15': 'needs_treatment'
    },
    history: [
      { id: 'h6', date: '2024-03-12', treatment: 'Emergency Consultation', doctor: 'Dr. Sharma', cost: 800, status: 'Paid', notes: 'Pain in upper right quadrant. Prescribed antibiotics.' }
    ]
  },
  { 
    id: '5', 
    name: 'Kabir Kumar', 
    age: 22,
    gender: 'Male',
    phone: '+91 98765 43214', 
    address: 'Vile Parle, Mumbai',
    registrationDate: '2026-05-10',
    lastVisit: '2026-05-10',
    totalVisits: 1,
    balance: 500,
    status: 'Active',
    medicalAlerts: [],
    teethConditions: {},
    history: [
      { id: 'h7', date: '2026-05-10', treatment: 'General Consultation', doctor: 'Dr. Sharma', cost: 500, status: 'Pending', notes: 'First visit. Recommended scaling.' }
    ]
  },
];

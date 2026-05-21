export const mockPatientsList = [
  {
    id: '1',
    name: 'Aarav Patel',
    doctorId: 'd1',
    age: 34,
    gender: 'Male',
    phone: '9537293756',
    address: 'Andheri West, Mumbai',
    registrationDate: '2025-08-15',
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
      { id: 'h1', date: '2026-04-10', treatment: 'General Consultation', doctor: 'Dr. Chintan Sayania', cost: 500, status: 'Paid', notes: 'Routine checkup. Found minor cavity on 26.' },
      { id: 'h2', date: '2025-08-22', treatment: 'Teeth Whitening', doctor: 'Dr. Chintan Sayania', cost: 3500, status: 'Paid', notes: 'Laser whitening. Patient satisfied.' }
    ]
  },
  {
    id: '2',
    name: 'Diya Sharma',
    doctorId: 'd1',
    age: 28,
    gender: 'Female',
    phone: '9537293756', 
    address: 'Bandra, Mumbai',
    registrationDate: '2025-07-10',
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
      { id: 'h3', date: '2026-05-01', treatment: 'Crown Preparation', doctor: 'Dr. Chintan Sayania', cost: 5000, status: 'Pending', notes: 'Prepared 11 and 21 for crowns. Temps placed.' }
    ]
  },
  {
    id: '3',
    name: 'Rohan Gupta',
    doctorId: 'd3',
    age: 45,
    gender: 'Male',
    phone: '9537293756', 
    address: 'Powai, Mumbai',
    registrationDate: '2025-06-08',
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
      { id: 'h4', date: '2025-11-15', treatment: 'Extraction', doctor: 'Dr. Chintan Sayania', cost: 2000, status: 'Paid', notes: 'Extracted 48 (impacted wisdom). Sutures placed.' },
      { id: 'h5', date: '2025-11-22', treatment: 'Follow-up', doctor: 'Dr. Chintan Sayania', cost: 0, status: 'Paid', notes: 'Removed sutures. Healing well.' }
    ]
  },
  {
    id: '4',
    name: 'Ananya Singh',
    doctorId: 'd1',
    age: 52,
    gender: 'Female',
    phone: '9537293756', 
    address: 'Juhu, Mumbai',
    registrationDate: '2025-11-08',
    lastVisit: '2025-11-08',
    totalVisits: 1,
    balance: 0,
    status: 'Inactive',
    medicalAlerts: ['Diabetes Type II'],
    teethConditions: {
      '16': 'extracted',
      '15': 'needs_treatment'
    },
    history: [
      { id: 'h6', date: '2025-11-08', treatment: 'Emergency Consultation', doctor: 'Dr. Chintan Sayania', cost: 800, status: 'Paid', notes: 'Pain in upper right quadrant. Prescribed antibiotics.' }
    ]
  },
  {
    id: '5',
    name: 'Kabir Kumar',
    doctorId: 'd1',
    age: 22,
    gender: 'Male',
    phone: '9537293756', 
    address: 'Vile Parle, Mumbai',
    registrationDate: '2026-05-10',
    lastVisit: '2026-05-10',
    totalVisits: 1,
    balance: 500,
    status: 'Active',
    medicalAlerts: [],
    teethConditions: {},
    history: [
      { id: 'h7', date: '2026-05-10', treatment: 'General Consultation', doctor: 'Dr. Chintan Sayania', cost: 500, status: 'Pending', notes: 'First visit. Recommended scaling.' }
    ]
  },
  {
    id: '6',
    name: 'Virajsinh DharmendraSingh Atodariya',
    doctorId: 'd2',
    age: 26,
    gender: 'Male',
    phone: '9537293756',
    address: 'Bardoli, Gujarat',
    registrationDate: '2025-05-19',
    lastVisit: '2026-04-16',
    totalVisits: 12,
    balance: 5000,
    status: 'Active',
    medicalAlerts: [],
    treatmentPlan: {
      name: 'Braces (Full Orthodontic Treatment)',
      totalCost: 35000,
      paid: 30000,
      startDate: '2025-05-20',
      estimatedCompletion: '2027-05-20',
    },
    teethConditions: {
      '11': 'braces',
      '12': 'braces',
      '13': 'braces',
      '14': 'braces',
      '15': 'braces',
      '21': 'braces',
      '22': 'braces',
      '23': 'braces',
      '24': 'braces',
      '25': 'braces',
      '31': 'braces',
      '32': 'braces',
      '33': 'braces',
      '34': 'braces',
      '35': 'braces',
      '41': 'braces',
      '42': 'braces',
      '43': 'braces',
      '44': 'braces',
      '45': 'braces',
    },
    history: [
      { id: 'h-vk-0', date: '2025-05-20', treatment: 'Initial Braces Placement', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Brackets and wires placed. Patient briefed on care.' },
      { id: 'h-vk-1', date: '2025-06-19', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Wire change. Progressing well.' },
      { id: 'h-vk-2', date: '2025-07-17', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-3', date: '2025-08-21', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-4', date: '2025-09-18', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-5', date: '2025-10-16', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Mid-treatment review — alignment improving.' },
      { id: 'h-vk-6', date: '2025-11-20', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-7', date: '2025-12-18', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-8', date: '2026-01-15', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-9', date: '2026-02-19', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-10', date: '2026-03-19', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine.' },
      { id: 'h-vk-11', date: '2026-04-16', treatment: 'Braces - Monthly Adjustment', doctor: 'Dr. Darshit Dhanani', cost: 2500, status: 'Paid', notes: 'Adjustment routine. Looking great.' },
    ]
  },
];

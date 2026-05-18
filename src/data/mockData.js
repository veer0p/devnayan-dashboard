export const mockOverview = {
  totalPatients: 43630,
  newPatients: 453,
};

export const mockAppointments = {
  value: 24,
  percentChange: 12, // positive
  chartData: [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 24 },
    { name: 'Fri', value: 20 },
  ],
};

export const mockRevenue = {
  value: 16568,
  percentChange: 7, // positive
  chartData: [
    { name: 'Paid', value: 75 },
    { name: 'Pending', value: 25 },
  ],
};

export const mockAnalytics = {
  revenue: 45430, 
  revenueChange: 0.4, // positive
  conversionRate: 0.73,
  conversionChange: 1.3,
  chartData: [
    { name: 'JAN', visits: 120 },
    { name: 'FEB', visits: 190 },
    { name: 'MAR', visits: 150 },
    { name: 'APR', visits: 220 },
    { name: 'MAY', visits: 280 },
    { name: 'JUN', visits: 200 },
    { name: 'JUL', visits: 240 },
    { name: 'AUG', visits: 260 },
  ],
};

export const mockTotalVisits = {
  total: 2888,
  percentChange: 4,
};

export const mockTopTreatments = [
  {
    id: 1,
    name: 'General Consultation',
    icon: 'Users',
    count: '127',
    revenue: 18900,
    status: 'High Demand'
  },
  {
    id: 2,
    name: 'Root Canal',
    icon: 'Pulse',
    count: '54',
    revenue: 28890,
    status: 'Steady'
  }
];

export const mockPatients = [
  { id: '1', name: 'Aarav Patel', phone: '+91 98765 43210', lastVisit: '2026-04-10' },
  { id: '2', name: 'Diya Sharma', phone: '+91 98765 43211', lastVisit: '2026-05-01' },
  { id: '3', name: 'Rohan Gupta', phone: '+91 98765 43212', lastVisit: '2026-03-15' },
  { id: '4', name: 'Ananya Singh', phone: '+91 98765 43213', lastVisit: '2026-05-10' },
  { id: '5', name: 'Kabir Kumar', phone: '+91 98765 43214', lastVisit: '2025-11-20' },
];

export const mockTreatments = [
  { id: 't1', name: 'General Consultation', duration: 30, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 't2', name: 'Root Canal', duration: 60, color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 't3', name: 'Teeth Whitening', duration: 45, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 't4', name: 'Extraction', duration: 45, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 't5', name: 'Cleaning & Polishing', duration: 30, color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

// Helper to generate dates for the current week
const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
startOfWeek.setHours(0, 0, 0, 0);

const createDate = (dayOffset, hours, minutes = 0) => {
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const mockAppointments = [
  {
    id: 'a1',
    patientId: '1',
    patientName: 'Aarav Patel',
    treatmentId: 't1',
    treatmentName: 'General Consultation',
    start: createDate(0, 9, 30), // Mon 9:30 AM
    end: createDate(0, 10, 0),
    status: 'Confirmed',
    chair: 'Chair 1',
  },
  {
    id: 'a2',
    patientId: '2',
    patientName: 'Diya Sharma',
    treatmentId: 't5',
    treatmentName: 'Cleaning & Polishing',
    start: createDate(0, 10, 30), // Mon 10:30 AM
    end: createDate(0, 11, 0),
    status: 'Completed',
    chair: 'Chair 2',
  },
  {
    id: 'a3',
    patientId: '3',
    patientName: 'Rohan Gupta',
    treatmentId: 't2',
    treatmentName: 'Root Canal',
    start: createDate(1, 14, 0), // Tue 2:00 PM
    end: createDate(1, 15, 0),
    status: 'Confirmed',
    chair: 'Chair 1',
  },
  {
    id: 'a4',
    patientId: '4',
    patientName: 'Ananya Singh',
    treatmentId: 't3',
    treatmentName: 'Teeth Whitening',
    start: createDate(2, 11, 0), // Wed 11:00 AM
    end: createDate(2, 11, 45),
    status: 'Pending',
    chair: 'Chair 3',
  },
  {
    id: 'a5',
    patientId: '5',
    patientName: 'Kabir Kumar',
    treatmentId: 't4',
    treatmentName: 'Extraction',
    start: createDate(3, 16, 0), // Thu 4:00 PM
    end: createDate(3, 16, 45),
    status: 'Confirmed',
    chair: 'Chair 2',
  },
];

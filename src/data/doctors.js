import { clinics } from './clinics';

const getActiveClinicId = () => {
  if (typeof window === 'undefined') return 'devnayan';
  const params = new URLSearchParams(window.location.search);
  const clinicId = params.get('clinic');
  return clinicId && clinics[clinicId] ? clinicId : 'devnayan';
};

const clinicId = getActiveClinicId();
const activeClinic = clinics[clinicId];

const getInitials = (name) => {
  if (!name) return 'LD';
  const parts = name.replace('Dr. ', '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return 'LD';
};

export const doctorSpecialties = [
  'General Dentist',
  'Orthodontist',
  'Periodontist',
  'Endodontist',
  'Oral Surgeon',
  'Pediatric Dentist',
  'Prosthodontist',
  'Cosmetic Dentist',
];

export const getMockDoctorsList = (cId) => {
  const activeClinic = clinics[cId];
  return [
    {
      id: 'd1',
      name: cId === 'janki' ? 'Dr. Janki Matroja' : (activeClinic ? activeClinic.doctorName : 'Dr. Chintan Sayania'),
      qualification: cId === 'janki' ? 'M.D.S. (Periodontics)' : 'B.D.S.',
      specialty: cId === 'janki' ? 'Periodontist' : 'General Dentist',
      phone: activeClinic ? activeClinic.phone : '+91 99135 20707',
      email: cId === 'janki' ? 'jankimatroja@gmail.com' : 'sayaniachintan@gmail.com',
      upiId: cId === 'janki' ? 'jankimatroja@okaxis' : 'chintansayania@okhdfcbank',
      yearsOfExperience: cId === 'janki' ? 15 : 10,
      schedule: activeClinic ? activeClinic.hours : 'Mon–Sat • 9am–1pm & 3pm–8pm',
      isPrimary: true,
      color: 'bg-primary',
      initials: cId === 'janki' ? 'JM' : (activeClinic ? getInitials(activeClinic.doctorName) : 'CS'),
    },
    {
      id: 'd2',
      name: 'Dr. Darshit Dhanani',
      qualification: 'M.D.S. (Orthodontics)',
      specialty: 'Orthodontist',
      phone: '+91 98765 12345',
      email: 'darshit.dhanani@dentease.com',
      upiId: 'dhananidarshit41-1@okhdfcbank',
      yearsOfExperience: 8,
      schedule: 'Tue–Sat • 10am–7pm',
      isPrimary: false,
      color: 'bg-blue-500',
      initials: 'DD',
    },
    {
      id: 'd3',
      name: 'Dr. Sharma',
      qualification: 'B.D.S., M.D.S. (Periodontics)',
      specialty: 'Periodontist',
      phone: '+91 98765 67890',
      email: 'sharma@dentease.com',
      upiId: 'drsharma@okaxis',
      yearsOfExperience: 12,
      schedule: 'Mon, Wed, Fri • 11am–6pm',
      isPrimary: false,
      color: 'bg-emerald-500',
      initials: 'SH',
    },
  ];
};

export const mockDoctors = new Proxy([], {
  get(target, prop) {
    const currentClinicId = getActiveClinicId();
    const list = getMockDoctorsList(currentClinicId);
    const value = list[prop];
    if (typeof value === 'function') {
      return value.bind(list);
    }
    return value;
  }
});

export const primaryDoctor = (doctors) => doctors.find(d => d.isPrimary) || doctors[0];

export const findDoctor = (doctors, id) => doctors.find(d => d.id === id);

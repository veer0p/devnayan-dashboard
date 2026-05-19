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

export const mockDoctors = [
  {
    id: 'd1',
    name: 'Dr. Chintan Sayania',
    qualification: 'B.D.S.',
    specialty: 'General Dentist',
    phone: '+91 99135 20707',
    email: 'sayaniachintan@gmail.com',
    upiId: 'chintansayania@okhdfcbank',
    yearsOfExperience: 10,
    schedule: 'Mon–Sat • 9am–1pm & 3pm–8pm',
    isPrimary: true,
    color: 'bg-primary',
    initials: 'CS',
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

export const primaryDoctor = (doctors) => doctors.find(d => d.isPrimary) || doctors[0];

export const findDoctor = (doctors, id) => doctors.find(d => d.id === id);

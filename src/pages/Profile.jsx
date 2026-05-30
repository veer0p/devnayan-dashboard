import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Envelope, Globe, WhatsappLogo } from '@phosphor-icons/react';
import AppLayout from '../components/layout/AppLayout';
import { useClinic } from '../context/ClinicContext';

const schedule = [
  { day: 'Monday', time: '9am - 1pm & 3pm - 8pm' },
  { day: 'Tuesday', time: '9am - 1pm & 3pm - 8pm' },
  { day: 'Wednesday', time: '9am - 1pm & 3pm - 8pm' },
  { day: 'Thursday', time: '9am - 1pm & 3pm - 8pm' },
  { day: 'Friday', time: '9am - 1pm & 3pm - 8pm' },
  { day: 'Saturday', time: '9am - 1pm & 3pm - 8pm' },
  { day: 'Sunday', time: 'Closed' },
];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = days[new Date().getDay()];

const getScheduleForClinic = (clinicId) => {
  if (clinicId === 'janki') {
    return [
      { day: 'Monday', time: '9:00 AM - 8:00 PM' },
      { day: 'Tuesday', time: '9:00 AM - 8:00 PM' },
      { day: 'Wednesday', time: '9:00 AM - 8:00 PM' },
      { day: 'Thursday', time: '9:00 AM - 8:00 PM' },
      { day: 'Friday', time: '9:00 AM - 8:00 PM' },
      { day: 'Saturday', time: '9:00 AM - 8:00 PM' },
      { day: 'Sunday', time: 'Closed' },
    ];
  }
  if (clinicId === 'dr-rajendra-desai') {
    return [
      { day: 'Monday', time: '10:00 AM - 1:00 PM & 3:00 PM - 7:00 PM' },
      { day: 'Tuesday', time: '10:00 AM - 1:00 PM & 3:00 PM - 7:00 PM' },
      { day: 'Wednesday', time: '10:00 AM - 1:00 PM & 3:00 PM - 7:00 PM' },
      { day: 'Thursday', time: '10:00 AM - 1:00 PM & 3:00 PM - 7:00 PM' },
      { day: 'Friday', time: '10:00 AM - 1:00 PM & 3:00 PM - 7:00 PM' },
      { day: 'Saturday', time: '10:00 AM - 1:00 PM & 3:00 PM - 7:00 PM' },
      { day: 'Sunday', time: 'Closed' },
    ];
  }
  return [
    { day: 'Monday', time: '9:00 AM - 1:00 PM & 3:00 PM - 8:00 PM' },
    { day: 'Tuesday', time: '9:00 AM - 1:00 PM & 3:00 PM - 8:00 PM' },
    { day: 'Wednesday', time: '9:00 AM - 1:00 PM & 3:00 PM - 8:00 PM' },
    { day: 'Thursday', time: '9:00 AM - 1:00 PM & 3:00 PM - 8:00 PM' },
    { day: 'Friday', time: '9:00 AM - 1:00 PM & 3:00 PM - 8:00 PM' },
    { day: 'Saturday', time: '9:00 AM - 1:00 PM & 3:00 PM - 8:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ];
};

export default function Profile() {
  const { clinic, activeClinicId } = useClinic();
  const schedule = getScheduleForClinic(activeClinicId);
  const email = activeClinicId === 'devnayan' ? 'sayaniachintan@gmail.com' : activeClinicId === 'janki' ? 'jankidentalcare@gmail.com' : `contact@${activeClinicId}.com`;
  const tagline = activeClinicId === 'devnayan' ? 'Advance Dental Care Hospital' : activeClinicId === 'janki' ? 'Janki Dental Care & Implant Centre' : 'Advance Dental Care Clinic';

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Clinic Profile</h1>
        <p className="text-text-muted text-sm">Manage your clinic information</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
        {/* Clinic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-card border border-border-color rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-color">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white text-2xl font-bold flex items-center justify-center shadow-md shadow-primary/20">
              {clinic.name ? clinic.name.charAt(0) : 'D'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{clinic.name}</h2>
              <p className="text-sm text-primary font-medium">{tagline}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Address</div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(clinic.address)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
                  {clinic.address}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Phone</div>
                <a href={`tel:${clinic.phoneRaw}`} className="text-sm font-medium hover:text-primary transition-colors">{clinic.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <WhatsappLogo size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">WhatsApp</div>
                <a href={`https://wa.me/${clinic.phoneRaw}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors">{clinic.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Envelope size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Email</div>
                <a href={`mailto:${email}`} className="text-sm font-medium hover:text-primary transition-colors">{email}</a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Schedule */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-bg-card border border-border-color rounded-2xl p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
            <Clock size={20} className="text-primary" /> Clinic Hours
          </h3>
          <div className="space-y-0">
            {schedule.map(row => {
              const isDay = row.day === today;
              const isClosed = row.time === 'Closed';
              return (
                <div
                  key={row.day}
                  className={`flex justify-between py-3 border-b border-border-color last:border-0 ${isDay ? 'bg-primary/10 -mx-3 px-3 rounded-lg border-l-2 border-l-primary' : ''}`}
                >
                  <span className={isDay ? 'font-semibold text-text-main' : 'text-text-muted'}>
                    {row.day}
                    {isDay && <span className="text-primary text-[10px] ml-2 font-bold uppercase">Today</span>}
                  </span>
                  <span className={isClosed ? 'text-text-muted' : 'font-medium'}>{row.time}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Doctor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-bg-card border border-border-color rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-semibold text-lg mb-4">{clinic.doctorName}</h3>
          <div className="flex items-center gap-4">
            {clinic.doctorImage ? (
              <img src={clinic.doctorImage} alt={clinic.doctorName} className="w-14 h-14 rounded-2xl object-cover object-top shadow-sm border border-border-color" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary font-bold text-xl flex items-center justify-center">
                {clinic.doctorName ? clinic.doctorName.split(' ').map(n => n[0]).join('') : 'D'}
              </div>
            )}
            <div>
              <div className="font-bold text-lg">{clinic.doctorName}</div>
              <div className="text-sm text-primary font-medium">
                {activeClinicId === 'janki' ? 'B.D.S. | Lead Dentist & Consultant' : 'B.D.S. | Dental Surgeon & Consultant'}
              </div>
              <div className="text-xs text-text-muted mt-1">
                {activeClinicId === 'janki' ? '12+ years of experience • 5,000+ patients treated' : '10+ years of experience • 5,000+ patients treated'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

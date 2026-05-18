import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Envelope, Globe, WhatsappLogo } from '@phosphor-icons/react';
import AppLayout from '../components/layout/AppLayout';

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

export default function Profile() {
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
              D
            </div>
            <div>
              <h2 className="text-xl font-bold">Devnayan Dental Clinic</h2>
              <p className="text-sm text-primary font-medium">Advance Dental Care Hospital</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Address</div>
                <a href="https://maps.app.goo.gl/aEDX8fUtLXwMdm1m7" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
                  B 394601, 6-7, Lal Bahadur Shastri Rd, Rushikesh Nagar, Radhabaug Society, Bardoli, Gujarat 394601
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Phone</div>
                <a href="tel:+912622227071" className="text-sm font-medium hover:text-primary transition-colors">02622-227071</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <WhatsappLogo size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">WhatsApp</div>
                <a href="tel:+919913520707" className="text-sm font-medium hover:text-primary transition-colors">99135 20707</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Envelope size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-text-muted font-medium mb-1">Email</div>
                <a href="mailto:sayaniachintan@gmail.com" className="text-sm font-medium hover:text-primary transition-colors">sayaniachintan@gmail.com</a>
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
          <h3 className="font-semibold text-lg mb-4">Lead Dentist</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary font-bold text-xl flex items-center justify-center">CS</div>
            <div>
              <div className="font-bold text-lg">Dr. Chintan Sayania</div>
              <div className="text-sm text-primary font-medium">B.D.S. | Dental Surgeon & Consultant</div>
              <div className="text-xs text-text-muted mt-1">10+ years of experience • 5,000+ patients treated</div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

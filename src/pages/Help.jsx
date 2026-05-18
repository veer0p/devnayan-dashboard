import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Phone, WhatsappLogo, Envelope, BookOpen, VideoCamera, ChatCircle } from '@phosphor-icons/react';
import AppLayout from '../components/layout/AppLayout';

const faqs = [
  { q: 'How do I book an appointment?', a: 'Go to the Appointments page and click "Book Patient". Select the patient, treatment, date and time, then confirm the booking.' },
  { q: 'How do I add a new patient?', a: 'Go to the Patients page and click "Add Patient". Fill in their details in the two-step form and complete registration.' },
  { q: 'How do I create an invoice?', a: 'Go to the Billing page and click "New Invoice". Select the patient, add treatments, and the invoice will be generated automatically.' },
  { q: 'How do I track inventory?', a: 'The Inventory page shows all your dental supplies. Items that fall below minimum stock levels are highlighted in red.' },
  { q: 'Can I send WhatsApp reminders?', a: 'Yes! Click the WhatsApp button on any appointment or patient record to send a reminder directly via WhatsApp.' },
  { q: 'How do I update the tooth chart?', a: 'Open a patient record, go to the "Tooth Chart" tab, and click on any tooth to update its condition.' },
];

export default function Help() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Help Center</h1>
        <p className="text-text-muted text-sm">Get support and learn how to use Devnayan</p>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: <Phone size={24} />, label: 'Call Support', sub: '02622-227071', color: 'text-primary', bg: 'bg-primary/10', href: 'tel:+912622227071' },
          { icon: <WhatsappLogo size={24} weight="fill" />, label: 'WhatsApp', sub: '99135 20707', color: 'text-emerald-400', bg: 'bg-emerald-900/20', href: 'https://wa.me/919913520707' },
          { icon: <Envelope size={24} />, label: 'Email', sub: 'sayaniachintan@gmail.com', color: 'text-blue-400', bg: 'bg-blue-900/20', href: 'mailto:sayaniachintan@gmail.com' },
        ].map(item => (
          <motion.a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="bg-bg-card border border-border-color rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>{item.icon}</div>
            <div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-text-muted">{item.sub}</div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl p-6"
      >
        <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border-color last:border-0">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <CaretDown size={16} className={`text-text-muted shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-4 text-sm text-text-muted leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}

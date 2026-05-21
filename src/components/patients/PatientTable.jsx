import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WhatsappLogo, PencilSimple, Trash, Phone, CaretRight } from '@phosphor-icons/react';
import StatusBadge from '../ui/StatusBadge';
import WhatsAppMessageDialog from '../ui/WhatsAppMessageDialog';

export default function PatientTable({ patients, onRowClick, onEdit, onDelete }) {
  const [waPatient, setWaPatient] = useState(null); // patient to message via dialog

  const defaultMessage = (patient) => [
    `Dear ${patient.name},`,
    ``,
    `Thank you for visiting Devnayan Dental Clinic.`,
    ``,
    `We hope your treatment is going well. Please do not hesitate to reach out if you have any questions or concerns.`,
    ``,
    `Regards,`,
    `Devnayan Dental Clinic`,
    `+91 84870 05334`,
  ].join('\n');

  if (patients.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted">
        No patients found matching your search criteria.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="text-xs text-text-muted border-b border-border-color">
              <th className="pb-3 pt-4 font-semibold pl-4">Patient</th>
              <th className="pb-3 pt-4 font-semibold">Contact</th>
              <th className="pb-3 pt-4 font-semibold">Last Visit</th>
              <th className="pb-3 pt-4 font-semibold">Visits</th>
              <th className="pb-3 pt-4 font-semibold">Balance</th>
              <th className="pb-3 pt-4 font-semibold">Status</th>
              <th className="pb-3 pt-4 font-semibold text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() => onRowClick(patient)}
                className="border-b border-border-color last:border-0 hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-bg-body border border-border-color text-text-muted font-semibold flex items-center justify-center shrink-0 text-xs">
                      {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-text-main">{patient.name}</div>
                      <div className="text-[11px] text-text-muted">{patient.age} yrs · {patient.gender}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-text-main text-[12px]">{patient.phone}</td>
                <td className="py-3 text-text-muted text-[12px]">
                  {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-3 font-medium text-text-main tabular-nums">{patient.totalVisits}</td>
                <td className="py-3 tabular-nums">
                  <span className={patient.balance > 0 ? 'font-semibold text-rose-500' : 'text-text-muted'}>
                    {patient.balance > 0 ? `₹${patient.balance.toLocaleString()}` : '—'}
                  </span>
                </td>
                <td className="py-3">
                  <StatusBadge status={patient.status} />
                </td>
                <td className="py-3 pr-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit?.(patient); }}
                      className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary/80 shadow-sm hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center transition-colors"
                      title="Edit patient"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setWaPatient(patient); }}
                      className="h-8 w-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366]/80 shadow-sm hover:bg-[#25D366]/20 hover:border-[#25D366]/60 hover:text-[#25D366] flex items-center justify-center transition-colors"
                      title="Send WhatsApp message"
                    >
                      <WhatsappLogo size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete?.(patient); }}
                      className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400/80 shadow-sm hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
                      title="Delete patient"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-3 space-y-3">
        {patients.map((patient) => (
          <motion.div
            key={patient.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRowClick(patient)}
            className="bg-bg-body border border-border-color rounded-xl p-4 cursor-pointer active:bg-border-color/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-bg-card border border-border-color text-text-muted font-semibold flex items-center justify-center shrink-0 text-xs">
                  {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-text-main">{patient.name}</div>
                  <div className="text-xs text-text-muted">{patient.age} yrs · {patient.gender}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={patient.status} size="xs" />
                <CaretRight size={14} className="text-text-muted" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-text-muted">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {patient.phone}
                </span>
              </div>
              <div className="tabular-nums">
                {patient.balance > 0 ? (
                  <span className="font-semibold text-rose-500">₹{patient.balance.toLocaleString()}</span>
                ) : (
                  <span className="text-text-muted">No due</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-color text-xs text-text-muted">
              <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setWaPatient(patient); }}
                className="flex items-center gap-1 text-[#25D366] font-medium"
              >
                <WhatsappLogo size={12} weight="fill" /> Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* WhatsApp Compose Dialog */}
      <WhatsAppMessageDialog
        patient={waPatient}
        isOpen={!!waPatient}
        onClose={() => setWaPatient(null)}
        defaultMessage={waPatient ? defaultMessage(waPatient) : ''}
      />
    </>
  );
}

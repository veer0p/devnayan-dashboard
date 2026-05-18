import React from 'react';
import { motion } from 'framer-motion';
import { WhatsappLogo, Receipt, Eye, Phone, CaretRight } from '@phosphor-icons/react';

export default function PatientTable({ patients, onRowClick }) {
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
              <motion.tr
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                key={patient.id}
                onClick={() => onRowClick(patient)}
                className="border-b border-border-color last:border-0 group cursor-pointer transition-colors"
              >
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-text-main">{patient.name}</div>
                      <div className="text-[11px] text-text-muted">{patient.age} yrs • {patient.gender}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-medium text-text-main">{patient.phone}</td>
                <td className="py-3 text-text-muted">
                  {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-3 font-medium">{patient.totalVisits}</td>
                <td className="py-3">
                  <span className={`font-semibold ${patient.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {patient.balance > 0 ? `₹${patient.balance.toLocaleString()}` : '—'}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    patient.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Invoice"
                    >
                      <Receipt size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}`, '_blank'); }}
                      className="p-1.5 text-text-muted hover:text-emerald-400 hover:bg-emerald-900/20 rounded transition-colors"
                      title="WhatsApp"
                    >
                      <WhatsappLogo size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
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
                <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0 text-sm">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-text-main">{patient.name}</div>
                  <div className="text-xs text-text-muted">{patient.age} yrs • {patient.gender}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                  patient.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  {patient.status}
                </span>
                <CaretRight size={14} className="text-text-muted" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-text-muted">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {patient.phone}
                </span>
              </div>
              <div>
                {patient.balance > 0 ? (
                  <span className="font-semibold text-red-400">₹{patient.balance.toLocaleString()}</span>
                ) : (
                  <span className="text-text-muted">No due</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-color text-xs text-text-muted">
              <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              <span>{patient.totalVisits} visit{patient.totalVisits !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

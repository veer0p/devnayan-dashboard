import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  WhatsappLogo, 
  Receipt, 
  CalendarPlus, 
  WarningCircle, 
  Clock, 
  Money
} from '@phosphor-icons/react';
import ToothChart from './ToothChart';

export default function PatientDrawer({ patient, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!patient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[600px] bg-bg-card shadow-2xl z-50 flex flex-col border-l border-border-color"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-color flex justify-between items-start bg-bg-body">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white text-xl font-bold flex items-center justify-center shadow-md shadow-primary/20">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main">{patient.name}</h2>
                  <div className="text-sm text-text-muted mt-1">{patient.phone} • {patient.age} yrs, {patient.gender}</div>
                  <div className="text-[11px] text-text-muted mt-1 font-medium">Reg: {new Date(patient.registrationDate).toLocaleDateString()}</div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-main hover:bg-border-color rounded-xl transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-border-color">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'history', label: 'Treatment History' },
                { id: 'chart', label: 'Tooth Chart' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Medical Alerts */}
                  {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <WarningCircle size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-red-700 mb-1">Medical Alerts</div>
                        <div className="text-sm text-red-600 font-medium">
                          {patient.medicalAlerts.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-body border border-border-color rounded-xl flex flex-col">
                      <div className="text-xs text-text-muted font-medium mb-1 flex items-center gap-1">
                        <Clock size={14} /> Last Visit
                      </div>
                      <div className="text-lg font-bold text-text-main">
                        {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-text-muted mt-auto pt-2">{patient.totalVisits} total visits</div>
                    </div>
                    <div className={`p-4 border rounded-xl flex flex-col ${patient.balance > 0 ? 'bg-red-50 border-red-100' : 'bg-bg-body border-border-color'}`}>
                      <div className={`text-xs font-medium mb-1 flex items-center gap-1 ${patient.balance > 0 ? 'text-red-600' : 'text-text-muted'}`}>
                        <Money size={14} /> Outstanding Balance
                      </div>
                      <div className={`text-lg font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-text-main'}`}>
                        ₹{patient.balance.toLocaleString()}
                      </div>
                      {patient.balance > 0 && (
                        <button className="text-[11px] font-semibold text-red-700 hover:text-red-800 mt-auto pt-2 text-left hover:underline">
                          Send payment link
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="flex flex-col items-center justify-center p-4 bg-bg-body border border-border-color rounded-xl hover:border-primary hover:text-primary transition-all group">
                        <CalendarPlus size={24} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                        <span className="text-[11px] font-bold">Book</span>
                      </button>
                      <button 
                        onClick={() => window.open(`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                        className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all group"
                      >
                        <WhatsappLogo size={24} className="text-green-600 mb-2 transition-colors" />
                        <span className="text-[11px] font-bold text-green-700">WhatsApp</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 bg-bg-body border border-border-color rounded-xl hover:border-primary hover:text-primary transition-all group">
                        <Receipt size={24} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                        <span className="text-[11px] font-bold">Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {patient.history && patient.history.length > 0 ? (
                    patient.history.map(record => (
                      <div key={record.id} className="p-4 bg-bg-card border border-border-color rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-text-main">{record.treatment}</div>
                            <div className="text-xs text-text-muted flex items-center gap-2 mt-1">
                              <span className="font-medium text-primary">{new Date(record.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{record.doctor}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-text-main">₹{record.cost.toLocaleString()}</div>
                            <span className={`inline-block px-2 py-0.5 mt-1 text-[10px] font-bold rounded ${
                              record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="p-3 bg-bg-body rounded-lg text-sm text-text-main">
                            <span className="font-semibold text-xs text-text-muted block mb-1">Notes</span>
                            {record.notes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-text-muted">
                      No treatment history found.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: TOOTH CHART */}
              {activeTab === 'chart' && (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-text-muted">FDI notation tooth chart. Hover over a tooth to see its condition.</p>
                  </div>
                  <ToothChart conditions={patient.teethConditions || {}} />
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  WhatsappLogo,
  Receipt,
  CalendarPlus,
  WarningCircle,
  Clock,
  Money,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import ToothChart from './ToothChart';
import StatusBadge from '../ui/StatusBadge';
import { toast } from 'sonner';
import { sendWhatsAppMessage } from '../../lib/openwa';
import { useClinic } from '../../context/ClinicContext';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { mockDoctors } from '../../data/doctors';

export default function PatientDrawer({ patient, isOpen, onClose, initialEditMode = false, onDelete, onUpdate }) {
  const { clinic } = useClinic();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    medicalAlerts: '',
    doctorId: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    } else if (patient) {
      setForm({
        name: patient.name || '',
        phone: patient.phone || '',
        age: String(patient.age || ''),
        gender: patient.gender || 'Male',
        address: patient.address || '',
        medicalAlerts: (patient.medicalAlerts || []).join(', '),
        doctorId: patient.doctorId || '',
      });
      setIsEditing(initialEditMode);
    } else {
      setForm({
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        address: '',
        medicalAlerts: '',
        doctorId: doctors[0]?.id || '',
      });
      setIsEditing(true);
    }
  }, [patient, isOpen, initialEditMode, doctors]);

  if (!isOpen) return null;
  if (!isEditing && !patient) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Phone is required');
      return;
    }

    const isEdit = !!patient;
    const updatedPatient = {
      ...(patient || {}),
      id: patient?.id ?? Math.random().toString(36).slice(2, 11),
      name: form.name.trim(),
      phone: form.phone.trim(),
      age: parseInt(form.age || '0', 10),
      gender: form.gender,
      address: form.address.trim(),
      medicalAlerts: form.medicalAlerts ? form.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean) : [],
      doctorId: form.doctorId,
      registrationDate: patient?.registrationDate ?? new Date().toISOString(),
      lastVisit: patient?.lastVisit ?? new Date().toISOString(),
      totalVisits: patient?.totalVisits ?? 0,
      balance: patient?.balance ?? 0,
      status: patient?.status ?? 'Active',
      teethConditions: patient?.teethConditions ?? {},
      history: patient?.history ?? [],
    };

    onUpdate?.(updatedPatient, isEdit);
    setIsEditing(false);
    onClose();
  };

  const goBook = () => {
    onClose();
    navigate('/appointments', { state: { bookForPatientId: patient.id } });
  };
  const goInvoice = () => {
    onClose();
    navigate('/billing', { state: { invoiceForPatientId: patient.id } });
  };

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
            {isEditing ? (
              <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-center gap-3 bg-bg-body">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">
                    {patient ? 'Edit Patient Profile' : 'Register New Patient'}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {patient ? 'Update patient demographics and health records' : 'Enter patient information to register'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!patient) {
                      onClose();
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  className="h-9 w-9 rounded-md bg-bg-card border border-border-color text-text-muted hover:text-text-main hover:bg-bg-body flex items-center justify-center transition-colors"
                  title="Cancel"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-main text-base font-semibold flex items-center justify-center shrink-0">
                    {patient?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-text-main truncate">{patient?.name}</h2>
                    <div className="text-sm text-text-muted mt-0.5 truncate">{patient?.phone} · {patient?.age} yrs, {patient?.gender}</div>
                    <div className="text-[11px] text-text-muted mt-0.5 truncate">Reg: {patient?.registrationDate ? new Date(patient.registrationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="h-9 w-9 sm:w-auto sm:px-3 rounded-md bg-primary/10 border border-primary/30 text-primary/90 hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center sm:gap-1.5 transition-colors text-[13px] font-semibold"
                    title="Edit patient"
                  >
                    <PencilSimple size={14} /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="h-9 w-9 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
                      title="Delete patient"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="h-9 w-9 rounded-md bg-bg-card border border-border-color text-text-muted hover:text-text-main hover:bg-bg-body flex items-center justify-center transition-colors"
                    title="Close"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            {!isEditing && (
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
            )}

            {/* Content */}
            {isEditing ? (
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-bg-card">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-muted uppercase">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-text-muted uppercase">Age</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-text-muted uppercase">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase">Address (Optional)</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase">Assigned Doctor</label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium cursor-pointer"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-rose-400 uppercase">Medical Alerts (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Asthma, Penicillin Allergy"
                    value={form.medicalAlerts}
                    onChange={(e) => setForm({ ...form, medicalAlerts: e.target.value })}
                    className="w-full h-11 px-3 bg-rose-500/[0.04] border border-rose-500/20 text-text-main placeholder:text-text-muted/50 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm font-medium"
                  />
                </div>

                <div className="pt-6 border-t border-border-color flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm text-text-muted hover:bg-bg-body transition-colors border border-border-color"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Medical Alerts */}
                    {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
                      <div className="p-3 bg-bg-body border border-border-color rounded-lg flex items-start gap-3">
                        <span className="w-1 h-full min-h-[40px] rounded-full bg-rose-500/70 shrink-0" />
                        <div>
                          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">Medical alerts</div>
                          <div className="text-sm text-text-main">
                            {patient.medicalAlerts.join(', ')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden">
                      <div className="p-4 bg-bg-body flex flex-col">
                        <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium flex items-center gap-1.5">
                          <Clock size={11} /> Last visit
                        </div>
                        <div className="mt-2 text-[18px] font-semibold tracking-tight text-text-main">
                          {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-text-muted mt-2">{patient.totalVisits} total visits</div>
                      </div>
                      <div className="p-4 bg-bg-body flex flex-col">
                        <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium flex items-center gap-1.5">
                          <Money size={11} /> Outstanding
                        </div>
                        <div className={`mt-2 text-[18px] font-semibold tracking-tight ${patient.balance > 0 ? 'text-rose-500' : 'text-text-main'}`}>
                          ₹{patient.balance.toLocaleString()}
                        </div>
                        {patient.balance > 0 ? (
                          <button
                            onClick={async () => {
                              const toastId = toast.loading('Sending outstanding balance notification...');
                              try {
                                const msg = `Hello ${patient.name}, your outstanding balance at ${clinic.name} is ₹${patient.balance.toLocaleString()}. Please settle at your convenience.`;
                                const res = await sendWhatsAppMessage(patient.phone, msg);
                                if (res.success) {
                                  if (res.manual) {
                                    toast.success('Opened manual WhatsApp link', { id: toastId });
                                  } else {
                                    toast.success('Outstanding balance shared via WhatsApp API!', { id: toastId });
                                  }
                                } else if (res.cancelled) {
                                  toast.dismiss(toastId);
                                }
                              } catch (err) {
                                toast.error(err.message || 'Failed to send notification', { id: toastId });
                              }
                            }}
                            className="text-[11px] font-medium text-text-muted hover:text-text-main mt-2 text-left transition-colors"
                          >
                            Send payment link →
                          </button>
                        ) : (
                          <div className="text-[11px] text-text-muted mt-2">No dues</div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-3">Quick actions</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={goBook}
                          className="flex items-center justify-center gap-2 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 hover:bg-bg-card transition-all"
                        >
                          <CalendarPlus size={14} className="text-text-muted" />
                          <span className="text-[12px] font-medium text-text-main">Book</span>
                        </button>
                        <button
                          onClick={async () => {
                            const toastId = toast.loading('Initiating WhatsApp...');
                            try {
                              const res = await sendWhatsAppMessage(patient.phone);
                              if (res.success) {
                                if (res.manual) {
                                  toast.success('Opened manual WhatsApp link', { id: toastId });
                                } else {
                                  toast.success('Message sent via WhatsApp API!', { id: toastId });
                                }
                              } else if (res.cancelled) {
                                toast.dismiss(toastId);
                              }
                            } catch (err) {
                              toast.error(err.message || 'Failed to send message', { id: toastId });
                            }
                          }}
                          className="flex items-center justify-center gap-2 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 hover:bg-bg-card transition-all"
                        >
                          <WhatsappLogo size={14} className="text-text-muted" />
                          <span className="text-[12px] font-medium text-text-main">WhatsApp</span>
                        </button>
                        <button
                          onClick={goInvoice}
                          className="flex items-center justify-center gap-2 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 hover:bg-bg-card transition-all"
                        >
                          <Receipt size={14} className="text-text-muted" />
                          <span className="text-[12px] font-medium text-text-main">Invoice</span>
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
                              <div className="mt-1">
                                <StatusBadge status={record.status} size="xs" />
                              </div>
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
                      <p className="text-sm text-text-muted">FDI notation tooth chart. Click a tooth to update its condition; hover to see the name.</p>
                    </div>
                    <ToothChart
                      conditions={patient.teethConditions || {}}
                      editable={!!onUpdate}
                      onChange={(updated) => onUpdate?.({ ...patient, teethConditions: updated })}
                    />
                  </div>
                )}

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

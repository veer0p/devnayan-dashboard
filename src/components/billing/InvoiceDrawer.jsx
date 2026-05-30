import React, { useState, useEffect, useMemo } from 'react';
import { Receipt, PencilSimple, Trash, X, WhatsappLogo, Wallet, Eye, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Drawer from '../ui/Drawer';
import Select from '../ui/Select';
import StatusBadge from '../ui/StatusBadge';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { sendWhatsAppMessage } from '../../lib/openwa';
import { useClinic } from '../../context/ClinicContext';
import { deriveStatus } from '../../data/billing';

const treatmentOptions = [
  { value: 'General Consultation', label: 'General Consultation' },
  { value: 'Cleaning & Polishing', label: 'Cleaning & Polishing' },
  { value: 'Teeth Whitening', label: 'Teeth Whitening' },
  { value: 'Root Canal', label: 'Root Canal' },
  { value: 'Extraction', label: 'Extraction' },
  { value: 'Crown Preparation', label: 'Crown Preparation' },
  { value: 'Filling', label: 'Filling' },
  { value: 'Braces', label: 'Braces' },
  { value: 'Emergency Consultation', label: 'Emergency Consultation' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Other', label: 'Other' },
];

export default function InvoiceDrawer({ invoice, isOpen, onClose, onUpdate, onDelete, onViewFull, onTakePayment, initialEditMode = false, nextId, defaultPatientId }) {
  const { clinic } = useClinic();
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    treatment: '',
    date: '',
    amount: '',
    paid: '0',
  });

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    } else if (invoice) {
      setForm({
        patientId: invoice.patientId || '',
        doctorId: invoice.doctorId || '',
        treatment: invoice.treatment || '',
        date: invoice.date || '',
        amount: String(invoice.amount || '0'),
        paid: String(invoice.paid || '0'),
      });
      setIsEditing(initialEditMode);
    } else {
      const defaultDoctorId = doctors[0]?.id || '';
      const prefillPatient = defaultPatientId ? patients.find(p => p.id === defaultPatientId) : null;
      setForm({
        patientId: defaultPatientId || '',
        doctorId: prefillPatient?.doctorId || defaultDoctorId,
        treatment: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        paid: '0',
      });
      setIsEditing(true);
    }
  }, [invoice, isOpen, initialEditMode, defaultPatientId, doctors, patients]);

  const patientOptions = useMemo(
    () => patients.map(p => ({ value: p.id, label: `${p.name} • ${p.phone}` })),
    [patients]
  );
  
  const doctorOptions = useMemo(
    () => doctors.map(d => ({ value: d.id, label: `${d.name}` })),
    [doctors]
  );

  if (!isOpen) return null;
  if (!isEditing && !invoice) return null;

  const patient = patients.find(p => p.id === (form.patientId || invoice?.patientId));
  const doctor = doctors.find(d => d.id === (form.doctorId || invoice?.doctorId));
  const balance = invoice ? Math.max(0, invoice.amount - invoice.paid) : 0;

  const handlePatientChange = (patientId) => {
    const pObj = patients.find(p => p.id === patientId);
    setForm(f => ({
      ...f,
      patientId,
      doctorId: pObj?.doctorId || f.doctorId,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.treatment.trim()) {
      toast.error('Please enter or select a treatment');
      return;
    }
    const patientObj = patients.find(p => p.id === form.patientId);
    const amount = parseFloat(form.amount || '0');
    const paid = parseFloat(form.paid || '0');
    if (paid > amount) {
      toast.error('Paid amount cannot exceed total');
      return;
    }
    const isEdit = !!invoice;
    const updated = {
      ...(invoice || {}),
      id: invoice?.id ?? nextId,
      patientId: form.patientId,
      patient: patientObj?.name || 'Unknown',
      doctorId: form.doctorId,
      treatment: form.treatment.trim(),
      date: form.date,
      amount,
      paid,
      status: deriveStatus(amount, paid),
    };
    onUpdate?.(updated, isEdit);
    toast.success(isEdit ? `${updated.id} updated` : `${updated.id} created`);
    setIsEditing(false);
    onClose();
  };

  const handleWhatsApp = async () => {
    if (!invoice) return;
    if (!patient?.phone) {
      toast.error('No phone number on record for this patient');
      return;
    }
    const invAmount = Number(invoice.amount ?? 0);
    const invPaid = Number(invoice.paid ?? 0);
    const invBalance = Math.max(0, invAmount - invPaid);
    const message = `Hello ${invoice.patient || 'Patient'},\n\nThis is your invoice ${invoice.id || ''} from ${clinic.name}.\n\nTreatment: ${invoice.treatment || ''}\nDate: ${invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}\nTotal: ₹${invAmount.toLocaleString()}\nPaid: ₹${invPaid.toLocaleString()}\nBalance: ₹${invBalance.toLocaleString()}\n\nThank you.`;
    
    const toastId = toast.loading('Sharing invoice details...');
    try {
      const res = await sendWhatsAppMessage(patient.phone, message);
      if (res.success) {
        if (res.manual) {
          toast.success('Opened manual WhatsApp link', { id: toastId });
        } else {
          toast.success('Invoice shared via WhatsApp API!', { id: toastId });
        }
      } else if (res.cancelled) {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to share invoice', { id: toastId });
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
            <Receipt size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-mono text-text-muted tracking-wider truncate">{invoice?.id || nextId}</div>
            <h2 className="text-lg font-semibold text-text-main truncate">
              {isEditing ? (form.treatment || 'New Invoice') : invoice?.treatment}
            </h2>
            {!isEditing ? (
              <div className="text-[11px] text-text-muted mt-0.5 truncate">
                {invoice?.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </div>
            ) : (
              <div className="text-xs text-text-muted mt-0.5 uppercase font-semibold tracking-wider">
                {invoice ? 'Editing Invoice' : 'New Invoice'}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-main hover:bg-border-color rounded-xl transition-colors shrink-0"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Patient</label>
              <Select
                value={form.patientId}
                onChange={handlePatientChange}
                options={patientOptions}
                placeholder="Select a patient..."
                size="lg"
                buttonClassName="bg-bg-body"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Treating Doctor</label>
              <Select
                value={form.doctorId}
                onChange={(v) => setForm({ ...form, doctorId: v })}
                options={doctorOptions}
                placeholder="Select doctor..."
                size="lg"
                buttonClassName="bg-bg-body"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase">Treatment</label>
            <Select
              value={form.treatment}
              onChange={(v) => setForm({ ...form, treatment: v })}
              options={treatmentOptions}
              placeholder="Select treatment..."
              size="lg"
              buttonClassName="bg-bg-body"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Total Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Paid (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border-color flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                if (!invoice) {
                  onClose();
                } else {
                  setIsEditing(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-text-muted hover:bg-bg-body transition-colors border border-border-color"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
            >
              {invoice ? 'Save Changes' : 'Create Invoice'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Status */}
            <div className="flex items-center gap-3">
              <StatusBadge status={invoice.status} />
              {balance > 0 && <span className="text-xs text-text-muted">Balance ₹{balance.toLocaleString()}</span>}
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-3 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden">
              <div className="p-4 bg-bg-body">
                <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Total</div>
                <div className="mt-2 text-[18px] font-semibold tracking-tight text-primary tabular-nums">₹{invoice.amount.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-bg-body">
                <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Paid</div>
                <div className="mt-2 text-[18px] font-semibold tracking-tight text-text-main tabular-nums">₹{invoice.paid.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-bg-body">
                <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Balance</div>
                <div className={`mt-2 text-[18px] font-semibold tracking-tight tabular-nums ${balance > 0 ? 'text-rose-500' : 'text-text-main'}`}>₹{balance.toLocaleString()}</div>
              </div>
            </div>

            {/* Patient + Doctor */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Patient</h4>
                <div className="border border-border-color rounded-xl p-3 bg-bg-body flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color text-text-main font-semibold flex items-center justify-center text-xs">
                    {invoice.patient.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-main truncate">{invoice.patient}</div>
                    {patient && <div className="text-xs text-text-muted mt-0.5 truncate">{patient.phone}</div>}
                  </div>
                </div>
              </div>
              {doctor && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Treating doctor</h4>
                  <div className="border border-border-color rounded-xl p-3 bg-bg-body flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color text-text-main font-semibold flex items-center justify-center text-xs">
                      {doctor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-main truncate">{doctor.name}</div>
                      <div className="text-xs text-text-muted mt-0.5 truncate">{doctor.qualification}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-2">
              {balance > 0 && (
                <button
                  onClick={onTakePayment}
                  className="w-full h-11 rounded-md bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <Wallet size={18} weight="bold" /> Take payment · ₹{balance.toLocaleString()}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onViewFull}
                  className="h-10 rounded-md bg-primary/10 border border-primary/30 text-primary/90 hover:bg-primary/20 hover:border-primary/60 hover:text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye size={15} /> View full
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="h-10 rounded-md bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366]/90 hover:bg-[#25D366]/20 hover:border-[#25D366]/60 hover:text-[#25D366] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <WhatsappLogo size={15} /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-color flex justify-between gap-3 bg-bg-card">
            <button
              onClick={onDelete}
              className="h-10 px-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <Trash size={14} /> Delete
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm"
            >
              <PencilSimple size={14} /> Edit invoice
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Receipt, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { deriveStatus } from '../../data/billing';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors, primaryDoctor } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';

const emptyForm = {
  patientId: '',
  doctorId: '',
  treatment: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  paid: '0',
};

const treatmentOptions = [
  'General Consultation',
  'Cleaning & Polishing',
  'Teeth Whitening',
  'Root Canal',
  'Extraction',
  'Crown Preparation',
  'Filling',
  'Braces',
  'Emergency Consultation',
  'Follow-up',
  'Other',
];

export default function InvoiceModal({ isOpen, onClose, onSubmit, initialInvoice, nextId, defaultPatientId }) {
  const [form, setForm] = useState(emptyForm);
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const isEdit = !!initialInvoice;

  useEffect(() => {
    if (isOpen) {
      const defaultDoctorId = primaryDoctor(doctors)?.id || doctors[0]?.id || '';
      if (initialInvoice) {
        setForm({
          patientId: initialInvoice.patientId || '',
          doctorId: initialInvoice.doctorId || defaultDoctorId,
          treatment: initialInvoice.treatment,
          date: initialInvoice.date,
          amount: String(initialInvoice.amount),
          paid: String(initialInvoice.paid),
        });
      } else {
        const prefillPatient = defaultPatientId ? patients.find(p => p.id === defaultPatientId) : null;
        setForm({
          ...emptyForm,
          patientId: defaultPatientId || '',
          doctorId: prefillPatient?.doctorId || defaultDoctorId,
        });
      }
    }
  }, [isOpen, initialInvoice, doctors, patients, defaultPatientId]);

  const patientOptions = useMemo(
    () => patients.map(p => ({ value: p.id, label: `${p.name} • ${p.phone}` })),
    [patients]
  );
  const doctorOptions = useMemo(
    () => doctors.map(d => ({ value: d.id, label: `${d.name}` })),
    [doctors]
  );

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setForm(f => ({
      ...f,
      patientId,
      doctorId: patient?.doctorId || f.doctorId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.treatment.trim()) {
      toast.error('Please enter or select a treatment');
      return;
    }
    const patient = patients.find(p => p.id === form.patientId);
    const amount = parseFloat(form.amount || '0');
    const paid = parseFloat(form.paid || '0');
    if (paid > amount) {
      toast.error('Paid amount cannot exceed total');
      return;
    }
    const invoice = {
      id: initialInvoice?.id ?? nextId,
      patientId: form.patientId,
      patient: patient?.name || 'Unknown',
      doctorId: form.doctorId,
      treatment: form.treatment.trim(),
      date: form.date,
      amount,
      paid,
      status: deriveStatus(amount, paid),
    };
    onSubmit(invoice, isEdit);
    toast.success(isEdit ? `${invoice.id} updated` : `${invoice.id} created`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit ${initialInvoice.id}` : 'New Invoice'}
      icon={<Receipt size={24} className="text-primary" />}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Patient</label>
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
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Treating Doctor</label>
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
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Treatment</label>
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
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Total Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Paid (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Live status preview */}
        {form.amount && (() => {
          const a = parseFloat(form.amount || '0');
          const p = parseFloat(form.paid || '0');
          const status = deriveStatus(a, p);
          return (
            <div className="p-3 bg-bg-body border border-border-color rounded-xl flex items-center justify-between text-xs">
              <span className="text-text-muted">Status preview</span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${
                status === 'Paid' ? 'bg-emerald-500/15 text-emerald-600' :
                status === 'Partial' ? 'bg-amber-500/15 text-amber-600' :
                'bg-rose-500/15 text-rose-500'
              }`}>
                {status} • Balance ₹{Math.max(0, a - p).toLocaleString()}
              </span>
            </div>
          );
        })()}

        <div className="pt-4 mt-2 border-t border-border-color flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-body transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2"
          >
            <Check size={16} weight="bold" />
            {isEdit ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

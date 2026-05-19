import React, { useState, useEffect } from 'react';
import { Stethoscope, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { doctorSpecialties } from '../../data/doctors';

const colorOptions = [
  { value: 'bg-primary', label: 'Brand Gold' },
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-emerald-500', label: 'Emerald' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-rose-500', label: 'Rose' },
  { value: 'bg-amber-500', label: 'Amber' },
];

const emptyForm = {
  name: '',
  qualification: '',
  specialty: 'General Dentist',
  phone: '',
  email: '',
  upiId: '',
  yearsOfExperience: '',
  schedule: '',
  color: 'bg-blue-500',
  isPrimary: false,
};

const initialsOf = (name) => {
  const parts = name.trim().replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DoctorModal({ isOpen, onClose, onSubmit, initialDoctor }) {
  const [form, setForm] = useState(emptyForm);
  const isEdit = !!initialDoctor;

  useEffect(() => {
    if (isOpen) {
      setForm(initialDoctor ? {
        name: initialDoctor.name,
        qualification: initialDoctor.qualification,
        specialty: initialDoctor.specialty,
        phone: initialDoctor.phone,
        email: initialDoctor.email,
        upiId: initialDoctor.upiId,
        yearsOfExperience: String(initialDoctor.yearsOfExperience || ''),
        schedule: initialDoctor.schedule || '',
        color: initialDoctor.color || 'bg-blue-500',
        isPrimary: initialDoctor.isPrimary || false,
      } : emptyForm);
    }
  }, [isOpen, initialDoctor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Doctor name is required');
      return;
    }
    const doctor = {
      id: initialDoctor?.id ?? `d${Date.now().toString(36)}`,
      name: form.name.trim(),
      qualification: form.qualification.trim(),
      specialty: form.specialty,
      phone: form.phone.trim(),
      email: form.email.trim(),
      upiId: form.upiId.trim(),
      yearsOfExperience: parseInt(form.yearsOfExperience || '0', 10),
      schedule: form.schedule.trim(),
      color: form.color,
      isPrimary: form.isPrimary,
      initials: initialsOf(form.name),
    };
    onSubmit(doctor, isEdit);
    toast.success(isEdit ? `${doctor.name} updated` : `${doctor.name} added`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit ${initialDoctor.name}` : 'Add Doctor'}
      icon={<Stethoscope size={24} className="text-primary" />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            required
            placeholder="Dr. Last Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Qualification</label>
            <input
              type="text"
              placeholder="e.g. B.D.S., M.D.S."
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Specialty</label>
            <Select
              value={form.specialty}
              onChange={(v) => setForm({ ...form, specialty: v })}
              options={doctorSpecialties}
              size="lg"
              buttonClassName="bg-bg-body"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Phone</label>
            <input
              type="tel"
              placeholder="+91 ..."
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">UPI ID (for payments)</label>
          <input
            type="text"
            placeholder="username@bank"
            value={form.upiId}
            onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Years of Experience</label>
            <input
              type="number"
              min="0"
              value={form.yearsOfExperience}
              onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Calendar Color</label>
            <Select
              value={form.color}
              onChange={(v) => setForm({ ...form, color: v })}
              options={colorOptions}
              size="lg"
              buttonClassName="bg-bg-body"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Schedule</label>
          <input
            type="text"
            placeholder="e.g. Mon–Sat • 9am–8pm"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-text-main">Mark as primary doctor</span>
        </label>

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
            {isEdit ? 'Save Changes' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { Phone, Envelope, WhatsappLogo, PencilSimple, Trash, X, Stethoscope, Star, Clock, Wallet, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Drawer from '../ui/Drawer';
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

const initialsOf = (name) => {
  const parts = name.trim().replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DoctorDrawer({ doctor, isOpen, onClose, onUpdate, onDelete, patientCount = 0, invoiceCount = 0, initialEditMode = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    } else if (doctor) {
      setForm({
        name: doctor.name || '',
        qualification: doctor.qualification || '',
        specialty: doctor.specialty || 'General Dentist',
        phone: doctor.phone || '',
        email: doctor.email || '',
        upiId: doctor.upiId || '',
        yearsOfExperience: String(doctor.yearsOfExperience || ''),
        schedule: doctor.schedule || '',
        color: doctor.color || 'bg-blue-500',
        isPrimary: doctor.isPrimary || false,
      });
      setIsEditing(initialEditMode);
    } else {
      setForm({
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
      });
      setIsEditing(true);
    }
  }, [doctor, isOpen, initialEditMode]);

  if (!isOpen) return null;
  if (!isEditing && !doctor) return null;

  const phoneClean = doctor?.phone?.replace(/[^0-9]/g, '');

  const copyUpi = () => {
    if (!doctor?.upiId) return;
    navigator.clipboard?.writeText(doctor.upiId).then(() => {
      toast.success('UPI ID copied');
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Doctor name is required');
      return;
    }
    const updated = {
      ...(doctor || {}),
      id: doctor?.id ?? `d${Date.now().toString(36)}`,
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
    const isEdit = !!doctor;
    onUpdate?.(updated, isEdit);
    toast.success(isEdit ? `${updated.name} updated` : `${updated.name} added`);
    setIsEditing(false);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-main text-base font-semibold flex items-center justify-center shrink-0">
            {isEditing ? initialsOf(form.name || (doctor?.name || '')) : (doctor?.initials || 'DR')}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-text-main flex items-center gap-2 min-w-0">
              <span className="truncate">{isEditing ? (form.name || (doctor ? 'New Doctor' : 'Add Doctor')) : doctor?.name}</span>
              {(!isEditing && doctor?.isPrimary) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted shrink-0">
                  <Star size={10} weight="fill" className="text-primary" /> Primary
                </span>
              )}
            </h2>
            {!isEditing && doctor && (
              <>
                <div className="text-sm text-text-muted mt-0.5 truncate">{doctor.qualification}</div>
                <div className="text-[11px] text-text-muted mt-0.5 truncate">{doctor.specialty} · {doctor.yearsOfExperience} yrs exp.</div>
              </>
            )}
            {isEditing && (
              <div className="text-xs text-text-muted mt-0.5 uppercase font-semibold tracking-wider">
                {doctor ? 'Editing profile' : 'Add New Doctor'}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="h-9 w-9 sm:w-auto sm:px-3 rounded-md bg-primary/10 border border-primary/30 text-primary/90 hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center sm:gap-1.5 transition-colors text-[13px] font-semibold"
                title="Edit doctor"
              >
                <PencilSimple size={14} /> <span className="hidden sm:inline">Edit</span>
              </button>
              {!doctor?.isPrimary && (
                <button
                  onClick={onDelete}
                  className="h-9 w-9 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
                  title="Delete doctor"
                >
                  <Trash size={14} />
                </button>
              )}
            </>
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

      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-bg-card">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase">Full Name</label>
            <input
              type="text"
              required
              placeholder="Dr. Last Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Qualification</label>
              <input
                type="text"
                placeholder="e.g. B.D.S., M.D.S."
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Specialty</label>
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
              <label className="block text-xs font-semibold text-text-muted uppercase">Phone</label>
              <input
                type="tel"
                placeholder="+91 ..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-muted uppercase">UPI ID (for payments)</label>
            <input
              type="text"
              placeholder="username@bank"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-mono text-text-main font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={form.yearsOfExperience}
                onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase">Calendar Color</label>
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
            <label className="block text-xs font-semibold text-text-muted uppercase">Schedule</label>
            <input
              type="text"
              placeholder="e.g. Mon–Sat • 9am–8pm"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-text-main font-medium"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-text-main font-medium">Mark as primary doctor</span>
          </label>

          <div className="pt-6 border-t border-border-color flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                if (!doctor) {
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
              {doctor ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden">
            <div className="p-4 bg-bg-body">
              <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Patients</div>
              <div className="mt-2 text-[20px] font-semibold tracking-tight text-text-main tabular-nums">{patientCount}</div>
            </div>
            <div className="p-4 bg-bg-body">
              <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Invoices</div>
              <div className="mt-2 text-[20px] font-semibold tracking-tight text-text-main tabular-nums">{invoiceCount}</div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-3">Contact</h4>
            <div className="space-y-2">
              {doctor?.phone && (
                <a
                  href={`tel:${phoneClean}`}
                  className="flex items-center gap-3 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-text-muted">Phone</div>
                    <div className="text-sm text-text-main truncate">{doctor.phone}</div>
                  </div>
                </a>
              )}
              {doctor?.phone && (
                <a
                  href={`https://wa.me/${phoneClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
                    <WhatsappLogo size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-text-muted">WhatsApp</div>
                    <div className="text-sm text-text-main truncate">{doctor.phone}</div>
                  </div>
                </a>
              )}
              {doctor?.email && (
                <a
                  href={`mailto:${doctor.email}`}
                  className="flex items-center gap-3 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
                    <Envelope size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-text-muted">Email</div>
                    <div className="text-sm text-text-main truncate">{doctor.email}</div>
                  </div>
                </a>
              )}
            </div>
          </div>

          {doctor?.upiId && (
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-3">Payments</h4>
              <button
                onClick={copyUpi}
                className="w-full flex items-center gap-3 p-3 bg-bg-body border border-border-color rounded-lg hover:border-text-muted/40 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-md bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
                  <Wallet size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-text-muted">UPI ID (tap to copy)</div>
                  <div className="text-sm font-mono font-medium text-text-main truncate">{doctor.upiId}</div>
                </div>
              </button>
            </div>
          )}

          {doctor?.schedule && (
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-3">Schedule</h4>
              <div className="flex items-center gap-3 p-3 bg-bg-body border border-border-color rounded-lg">
                <div className="w-8 h-8 rounded-md bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
                  <Clock size={14} />
                </div>
                <div className="text-sm text-text-main">{doctor.schedule}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

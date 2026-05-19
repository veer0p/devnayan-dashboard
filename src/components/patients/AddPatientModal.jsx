import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, PencilSimple, CaretRight, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { mockDoctors, primaryDoctor } from '../../data/doctors';

const emptyForm = {
  name: '',
  phone: '',
  age: '',
  gender: 'Male',
  address: '',
  medicalAlerts: '',
  doctorId: '',
};

export default function AddPatientModal({ isOpen, onClose, onSubmit, initialPatient }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const isEdit = !!initialPatient;

  const doctorOptions = useMemo(
    () => doctors.map(d => ({ value: d.id, label: `${d.name} (${d.specialty})` })),
    [doctors]
  );

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const defaultDoctorId = primaryDoctor(doctors)?.id || doctors[0]?.id || '';
      setForm(initialPatient ? {
        name: initialPatient.name,
        phone: initialPatient.phone,
        age: String(initialPatient.age),
        gender: initialPatient.gender,
        address: initialPatient.address || '',
        medicalAlerts: (initialPatient.medicalAlerts || []).join(', '),
        doctorId: initialPatient.doctorId || defaultDoctorId,
      } : { ...emptyForm, doctorId: defaultDoctorId });
    }
  }, [isOpen, initialPatient, doctors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && step === 1) {
      setStep(2);
      return;
    }

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Phone is required');
      return;
    }

    const patient = {
      id: initialPatient?.id ?? Math.random().toString(36).slice(2, 11),
      name: form.name.trim(),
      doctorId: form.doctorId,
      phone: form.phone.trim(),
      age: parseInt(form.age || '0', 10),
      gender: form.gender,
      address: form.address.trim(),
      medicalAlerts: form.medicalAlerts ? form.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean) : [],
      registrationDate: initialPatient?.registrationDate ?? new Date().toISOString(),
      lastVisit: initialPatient?.lastVisit ?? new Date().toISOString(),
      totalVisits: initialPatient?.totalVisits ?? 0,
      balance: initialPatient?.balance ?? 0,
      status: initialPatient?.status ?? 'Active',
      teethConditions: initialPatient?.teethConditions ?? {},
      history: initialPatient?.history ?? [],
      treatmentPlan: initialPatient?.treatmentPlan,
    };

    onSubmit(patient, isEdit);
    toast.success(isEdit ? `${patient.name} updated` : `${patient.name} registered`);
    onClose();
  };

  const title = isEdit ? `Edit ${initialPatient.name}` : (step === 1 ? 'Add New Patient' : 'Initial Dental Assessment');
  const icon = isEdit
    ? <PencilSimple size={24} className="text-primary" />
    : <UserPlus size={24} className="text-primary" />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(isEdit || step === 1) ? (
          <>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Age</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Gender</label>
                  <Select
                    value={form.gender}
                    onChange={(v) => setForm({ ...form, gender: v })}
                    options={['Male', 'Female', 'Other']}
                    size="lg"
                    buttonClassName="bg-bg-body"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Address (Optional)</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Assigned Doctor</label>
              <Select
                value={form.doctorId}
                onChange={(v) => setForm({ ...form, doctorId: v })}
                options={doctorOptions}
                placeholder="Select doctor..."
                size="lg"
                buttonClassName="bg-bg-body"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Medical Alerts (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Asthma, Penicillin Allergy"
                value={form.medicalAlerts}
                onChange={(e) => setForm({ ...form, medicalAlerts: e.target.value })}
                className="w-full h-11 px-3 bg-rose-500/[0.06] border border-rose-500/30 text-text-main placeholder:text-text-muted/60 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm"
              />
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-text-muted">
            <p className="mb-4 text-sm">You can document initial tooth conditions later from the Patient Drawer.</p>
            <div className="w-16 h-16 mx-auto bg-primary/15 text-primary rounded-full flex items-center justify-center mb-4">
              <Check size={28} weight="bold" />
            </div>
            <h3 className="text-lg font-bold text-text-main">Ready to Register</h3>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border-color flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-text-muted hover:bg-bg-body transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2"
          >
            {isEdit ? (
              <><Check size={16} weight="bold" /> Save Changes</>
            ) : step === 1 ? (
              <>Continue <CaretRight weight="bold" /></>
            ) : (
              <><Check size={16} weight="bold" /> Complete Registration</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

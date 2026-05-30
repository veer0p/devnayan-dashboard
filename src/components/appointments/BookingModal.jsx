import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarPlus, PencilSimple, Check, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Select from '../ui/Select';
import { mockTreatments } from '../../data/appointments';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors, primaryDoctor } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';

const chairs = ['Chair 1', 'Chair 2', 'Chair 3'];

const emptyForm = {
  patientId: '',
  doctorId: '',
  treatmentId: '',
  date: new Date().toISOString().slice(0, 10),
  time: '10:00',
  chair: 'Chair 1',
  notes: '',
};

export default function BookingModal({ isOpen, onClose, onSubmit, initialAppointment, defaultDate, defaultPatientId }) {
  const [form, setForm] = useState(emptyForm);
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const isEdit = !!initialAppointment;

  useEffect(() => {
    if (isOpen) {
      const defaultDoctorId = primaryDoctor(doctors)?.id || doctors[0]?.id || '';
      if (initialAppointment) {
        const start = new Date(initialAppointment.start);
        setForm({
          patientId: initialAppointment.patientId || '',
          doctorId: initialAppointment.doctorId || defaultDoctorId,
          treatmentId: initialAppointment.treatmentId || '',
          date: start.toISOString().slice(0, 10),
          time: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
          chair: initialAppointment.chair || 'Chair 1',
          notes: initialAppointment.notes || '',
        });
      } else {
        const prefillPatient = defaultPatientId ? patients.find(p => p.id === defaultPatientId) : null;
        setForm({
          ...emptyForm,
          patientId: defaultPatientId || '',
          doctorId: prefillPatient?.doctorId || defaultDoctorId,
          date: defaultDate || new Date().toISOString().slice(0, 10),
        });
      }
    }
  }, [isOpen, initialAppointment, doctors, patients, defaultDate, defaultPatientId]);

  const patientOptions = useMemo(
    () => patients.map(p => ({ value: p.id, label: `${p.name} • ${p.phone}` })),
    [patients]
  );
  const treatmentOptions = useMemo(
    () => mockTreatments.map(t => ({ value: t.id, label: `${t.name} (${t.duration} mins)` })),
    []
  );
  const doctorOptions = useMemo(
    () => doctors.map(d => ({ value: d.id, label: `${d.name} (${d.specialty})` })),
    [doctors]
  );
  const chairOptions = chairs.map(c => ({ value: c, label: c }));

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setForm(f => ({
      ...f,
      patientId,
      // Auto-pick the patient's assigned doctor when changing patient (unless editing)
      doctorId: patient?.doctorId || f.doctorId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!form.treatmentId) {
      toast.error('Please select a treatment');
      return;
    }
    if (!form.doctorId) {
      toast.error('Please select a doctor');
      return;
    }

    const patient = patients.find(p => p.id === form.patientId);
    const treatment = mockTreatments.find(t => t.id === form.treatmentId);
    const [year, month, day] = form.date.split('-').map(Number);
    const [hour, minute] = form.time.split(':').map(Number);
    const start = new Date(year, month - 1, day, hour, minute);
    const end = new Date(start.getTime() + treatment.duration * 60_000);

    const appointment = {
      id: initialAppointment?.id ?? `a${Date.now().toString(36)}`,
      patientId: form.patientId,
      patientName: patient.name,
      doctorId: form.doctorId,
      treatmentId: form.treatmentId,
      treatmentName: treatment.name,
      start,
      end,
      status: initialAppointment?.status ?? 'Confirmed',
      chair: form.chair,
      notes: form.notes.trim(),
    };

    onSubmit(appointment, isEdit);
    toast.success(isEdit ? 'Appointment updated' : `${patient.name} booked for ${treatment.name}`);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-card shadow-2xl z-50 animate-in slide-in-from-right duration-300 focus:outline-none flex flex-col border-l border-border-color"
        >
          <div className="p-6 pb-4 flex justify-between items-start border-b border-border-color mb-6">
            <div className="min-w-0 flex-1 pr-4">
              <Dialog.Title className="text-xl font-semibold flex items-center gap-2 text-text-main">
                {isEdit ? <PencilSimple size={20} className="text-primary" /> : <CalendarPlus size={20} className="text-primary" />}
                {isEdit ? 'Edit Appointment' : 'Book Appointment'}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:bg-bg-body p-1.5 rounded-lg transition-colors focus:outline-none">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-6 px-6 pb-4 custom-scrollbar text-xs">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-main">Patient</label>
                  <Select
                    value={form.patientId}
                    onChange={handlePatientChange}
                    options={patientOptions}
                    placeholder="Select a patient..."
                    size="lg"
                    buttonClassName="bg-bg-body"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Doctor</label>
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
                    <label className="text-sm font-medium text-text-main">Treatment</label>
                    <Select
                      value={form.treatmentId}
                      onChange={(v) => setForm({ ...form, treatmentId: v })}
                      options={treatmentOptions}
                      placeholder="Select treatment..."
                      size="lg"
                      buttonClassName="bg-bg-body"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Date</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-border-color bg-bg-body outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm animate-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Time</label>
                    <input
                      type="time"
                      required
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-border-color bg-bg-body outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm animate-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-main">Chair</label>
                  <Select
                    value={form.chair}
                    onChange={(v) => setForm({ ...form, chair: v })}
                    options={chairOptions}
                    size="lg"
                    buttonClassName="bg-bg-body"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-main">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full p-3 rounded-xl border border-border-color bg-bg-body outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                    rows="3"
                    placeholder="Optional notes for this visit..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-border-color flex justify-end gap-3 bg-bg-card">
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
                {isEdit ? 'Save Changes' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

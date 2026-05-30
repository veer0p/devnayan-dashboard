import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, WhatsappLogo, Phone, Calendar, Clock, PencilSimple, Trash, Stethoscope, Check } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { sendWhatsAppMessage } from '../../lib/openwa';
import StatusBadge from '../ui/StatusBadge';
import { useClinic } from '../../context/ClinicContext';
import Select from '../ui/Select';
import { mockTreatments } from '../../data/appointments';

const chairs = ['Chair 1', 'Chair 2', 'Chair 3'];

export default function AppointmentPanel({ event, isOpen, onClose, onEdit, onDelete }) {
  const { clinic } = useClinic();
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    patientId: '',
    doctorId: '',
    treatmentId: '',
    date: '',
    time: '',
    chair: 'Chair 1',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    } else if (event) {
      const start = event.start instanceof Date ? event.start : new Date(event.start);
      setFormState({
        patientId: event.patientId || '',
        doctorId: event.doctorId || '',
        treatmentId: event.treatmentId || '',
        date: start.toISOString().slice(0, 10),
        time: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
        chair: event.chair || 'Chair 1',
        notes: event.notes || '',
      });
      setIsEditing(false);
    }
  }, [event, isOpen]);

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

  if (!event) return null;

  const patient = patients.find(p => p.id === event.patientId);
  const doctor = doctors.find(d => d.id === event.doctorId);
  const phoneClean = patient?.phone?.replace(/[^0-9]/g, '');

  const handleWhatsApp = async () => {
    if (!phoneClean) return;
    const startDate = event.start instanceof Date ? event.start : new Date(event.start);
    const endDate = event.end instanceof Date ? event.end : new Date(event.end);
    
    const boldMessage = [
      `*Appointment Reminder* 📅`,
      `*${clinic.name}* 🦷`,
      `-----------------------------`,
      `Dear *${event.patientName}*,`,
      ``,
      `This is a friendly reminder for your upcoming dental visit:`,
      ``,
      `🦷 *Treatment:* ${event.treatmentName}`,
      `📅 *Date:* ${format(startDate, 'EEEE, d MMMM yyyy')}`,
      `⏰ *Time:* ${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`,
      doctor ? `👨‍⚕️ *Doctor:* ${doctor.name}` : '',
      event.chairId ? `💺 *Dental Chair:* Chair ${event.chairId}` : '',
      ``,
      `📍 *Location:* ${clinic.address}`,
      `-----------------------------`,
      `If you need to reschedule or have any questions, please contact us at ${clinic.phone}.`,
      ``,
      `We look forward to seeing you soon!`,
    ].filter(Boolean).join('\n');
    
    const toastId = toast.loading('Sending reminder via WhatsApp...');
    try {
      const res = await sendWhatsAppMessage(patient.phone, boldMessage);
      if (res.success) {
        if (res.manual) {
          toast.success('Opened manual WhatsApp link', { id: toastId });
        } else {
          toast.success('Reminder sent via WhatsApp API!', { id: toastId });
        }
      } else if (res.cancelled) {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send WhatsApp reminder', { id: toastId });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formState.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!formState.treatmentId) {
      toast.error('Please select a treatment');
      return;
    }
    if (!formState.doctorId) {
      toast.error('Please select a doctor');
      return;
    }

    const selectedPatient = patients.find(p => p.id === formState.patientId);
    const selectedTreatment = mockTreatments.find(t => t.id === formState.treatmentId);
    const [year, month, day] = formState.date.split('-').map(Number);
    const [hour, minute] = formState.time.split(':').map(Number);
    const start = new Date(year, month - 1, day, hour, minute);
    const end = new Date(start.getTime() + selectedTreatment.duration * 60_000);

    const updatedAppointment = {
      id: event.id,
      patientId: formState.patientId,
      patientName: selectedPatient.name,
      doctorId: formState.doctorId,
      treatmentId: formState.treatmentId,
      treatmentName: selectedTreatment.name,
      start,
      end,
      status: event.status || 'Confirmed',
      chair: formState.chair,
      notes: formState.notes.trim(),
    };

    onEdit(updatedAppointment);
    toast.success('Appointment updated successfully');
    setIsEditing(false);
  };

  const start = event.start instanceof Date ? event.start : new Date(event.start);
  const end = event.end instanceof Date ? event.end : new Date(event.end);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
        <Dialog.Content
          onPointerDownOutside={(e) => {
            // Allow clicks on calendar to dismiss but not on conflict dialog area
            if (e.target.closest?.('.rbc-calendar')) {
              e.preventDefault();
            }
          }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-card shadow-2xl z-50 animate-in slide-in-from-right duration-300 focus:outline-none flex flex-col border-l border-border-color"
        >
          <div className="p-6 pb-4 flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              {!isEditing && (
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <StatusBadge status={event.status} />
                  <span className="text-xs text-text-muted font-medium bg-bg-body border border-border-color px-2 py-0.5 rounded">
                    {event.chair}
                  </span>
                </div>
              )}
              <Dialog.Title className="text-2xl font-bold text-text-main">
                {isEditing ? 'Edit Appointment' : event.treatmentName}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:bg-bg-body p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6 custom-scrollbar text-xs">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Patient</label>
                    <Select
                      value={formState.patientId}
                      onChange={(val) => {
                        const pat = patients.find(p => p.id === val);
                        setFormState(f => ({
                          ...f,
                          patientId: val,
                          doctorId: pat?.doctorId || f.doctorId,
                        }));
                      }}
                      options={patientOptions}
                      placeholder="Select patient..."
                      size="lg"
                      buttonClassName="bg-bg-body"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Doctor</label>
                    <Select
                      value={formState.doctorId}
                      onChange={(v) => setFormState({ ...formState, doctorId: v })}
                      options={doctorOptions}
                      placeholder="Select doctor..."
                      size="lg"
                      buttonClassName="bg-bg-body"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Treatment</label>
                    <Select
                      value={formState.treatmentId}
                      onChange={(v) => setFormState({ ...formState, treatmentId: v })}
                      options={treatmentOptions}
                      placeholder="Select treatment..."
                      size="lg"
                      buttonClassName="bg-bg-body"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-main">Date</label>
                      <input
                        type="date"
                        required
                        value={formState.date}
                        onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl border border-border-color bg-bg-body outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-main">Time</label>
                      <input
                        type="time"
                        required
                        value={formState.time}
                        onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl border border-border-color bg-bg-body outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Chair</label>
                    <Select
                      value={formState.chair}
                      onChange={(v) => setFormState({ ...formState, chair: v })}
                      options={chairOptions}
                      size="lg"
                      buttonClassName="bg-bg-body"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-main">Notes</label>
                    <textarea
                      value={formState.notes}
                      onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
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
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-body transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2"
                >
                  <Check size={16} weight="bold" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-4">
                <div className="flex flex-col gap-5">
                  <div className="bg-bg-body rounded-xl p-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                      <Calendar size={16} className="text-primary" />
                      {format(start, 'EEE, d MMM yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                      <Clock size={16} className="text-primary" />
                      {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                    </div>
                  </div>

                  {/* Patient */}
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Patient</h4>
                    <div className="border border-border-color rounded-xl p-3 flex items-center gap-3 bg-bg-body">
                      <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color flex items-center justify-center text-text-main font-semibold text-xs">
                        {event.patientName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text-main text-sm truncate">{event.patientName}</div>
                        <div className="text-xs text-text-muted truncate">
                          {patient?.phone || 'No phone on file'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {phoneClean && (
                        <a
                          href={`tel:${phoneClean}`}
                          className="w-10 h-10 rounded-xl border border-border-color text-text-main hover:bg-bg-body flex items-center justify-center transition-colors shrink-0"
                          title="Call patient"
                        >
                          <Phone size={16} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Doctor */}
                  {doctor && (
                    <div>
                      <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Doctor</h4>
                      <div className="border border-border-color rounded-xl p-3 flex items-center gap-3 bg-bg-body">
                        <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color text-text-main font-semibold flex items-center justify-center text-xs">
                          {doctor.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-text-main text-sm truncate">{doctor.name}</div>
                          <div className="text-xs text-text-muted truncate">{doctor.qualification} · {doctor.specialty}</div>
                        </div>
                        <Stethoscope size={16} className="text-text-muted" />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {event.notes && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-2">Clinical Notes</h4>
                      <div className="text-sm text-text-main leading-relaxed bg-bg-body/50 p-4 rounded-xl whitespace-pre-line">
                        {event.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-border-color flex flex-col gap-3">
                {/* Primary WhatsApp Action */}
                <button
                  onClick={handleWhatsApp}
                  disabled={!phoneClean}
                  className="w-full h-12 rounded-xl bg-[#25D366] text-white hover:bg-[#1ebe5d] active:scale-[0.98] font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#25D366]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <WhatsappLogo size={20} weight="fill" />
                  Send Appointment Details on WhatsApp
                </button>
                {/* Secondary actions */}
                <div className="flex gap-2">
                  <button
                    onClick={onDelete}
                    className="h-10 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 transition-colors flex items-center gap-2 text-sm font-semibold"
                  >
                    <Trash size={14} /> Delete
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <PencilSimple size={14} /> Edit Details
                  </button>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

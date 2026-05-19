import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, WhatsappLogo, Phone, Calendar, Clock, PencilSimple, Trash, Stethoscope } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';
import StatusBadge from '../ui/StatusBadge';

export default function AppointmentPanel({ event, isOpen, onClose, onEdit, onDelete }) {
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  if (!event) return null;

  const patient = patients.find(p => p.id === event.patientId);
  const doctor = doctors.find(d => d.id === event.doctorId);
  const phoneClean = patient?.phone?.replace(/[^0-9]/g, '');

  const handleWhatsApp = () => {
    if (!phoneClean) return;
    const startDate = event.start instanceof Date ? event.start : new Date(event.start);
    const msg = `Hi ${event.patientName}, this is a reminder for your ${event.treatmentName} appointment on ${format(startDate, 'EEE d MMM')} at ${format(startDate, 'h:mm a')} at Devnayan Dental Clinic.${doctor ? `\nDoctor: ${doctor.name}` : ''}`;
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
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
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-card shadow-2xl z-50 animate-in slide-in-from-right duration-300 focus:outline-none flex flex-col"
        >
          <div className="p-6 pb-4 flex justify-between items-start">
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusBadge status={event.status} />
                <span className="text-xs text-text-muted font-medium bg-bg-body border border-border-color px-2 py-0.5 rounded">
                  {event.chair}
                </span>
              </div>
              <Dialog.Title className="text-2xl font-bold text-text-main">
                {event.treatmentName}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:bg-bg-body p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

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
                  <button
                    onClick={handleWhatsApp}
                    disabled={!phoneClean}
                    className="flex-1 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <WhatsappLogo size={16} weight="fill" /> Reminder
                  </button>
                  {phoneClean && (
                    <a
                      href={`tel:${phoneClean}`}
                      className="w-10 h-10 rounded-xl border border-border-color text-text-main hover:bg-bg-body flex items-center justify-center transition-colors"
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

          <div className="p-6 pt-4 border-t border-border-color flex justify-between gap-3">
            <button
              onClick={onDelete}
              className="h-10 px-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <Trash size={14} /> Delete
            </button>
            <button
              onClick={onEdit}
              className="h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm"
            >
              <PencilSimple size={14} /> Edit details
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

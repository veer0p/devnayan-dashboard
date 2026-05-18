import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, WhatsappLogo, Phone, Calendar, Clock, User, PencilSimple, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';

export default function AppointmentPanel({ event, isOpen, onClose }) {
  if (!event) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40 transition-opacity" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-card shadow-2xl z-50 p-6 animate-in slide-in-from-right duration-300 focus:outline-none flex flex-col overflow-y-auto">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                  event.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                  event.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {event.status}
                </span>
                <span className="text-xs text-text-muted font-medium bg-bg-body px-2 rounded">
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

          <div className="flex flex-col gap-6 flex-1">
            {/* Time Info */}
            <div className="bg-bg-body rounded-xl p-4 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                <Calendar size={18} className="text-primary" />
                {format(event.start, 'EEE, d MMM yyyy')}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                <Clock size={18} className="text-primary" />
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-3">Patient Details</h4>
              <div className="border border-border-color rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                    {event.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-text-main text-sm">{event.patientName}</div>
                    <div className="text-xs text-text-muted">ID: {event.patientId} • New Patient</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button className="flex-1 h-10 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                  <WhatsappLogo size={18} weight="fill" /> Reminder
                </button>
                <button className="w-10 h-10 rounded-xl border border-border-color text-text-main hover:bg-bg-body flex items-center justify-center transition-colors">
                  <Phone size={18} />
                </button>
              </div>
            </div>

            {/* Clinical Notes */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted mb-3">Clinical Notes</h4>
              <div className="text-sm text-text-main leading-relaxed bg-bg-body/50 p-4 rounded-xl">
                Patient reports mild sensitivity in lower left quadrant. Needs x-ray before proceeding with the extraction.
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border-color flex justify-between mt-auto">
            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash size={20} />
            </button>
            <button className="px-4 py-2 bg-text-main text-white rounded-xl text-sm font-medium hover:bg-gray-800 flex items-center gap-2 transition-colors">
              <PencilSimple size={16} /> Edit Details
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

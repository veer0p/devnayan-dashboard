import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X, Warning, Clock, ArrowRight } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { mockDoctors } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';

export default function ConflictDialog({ events, isOpen, onClose, onSelect }) {
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  if (!events || events.length === 0) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-in fade-in duration-150" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[92vw] max-w-md max-h-[80vh] bg-bg-card rounded-2xl shadow-2xl z-[70] focus:outline-none border border-border-color flex flex-col overflow-hidden"
        >
          <div className="p-5 border-b border-border-color flex items-start gap-3 bg-bg-body">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <Warning size={20} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-bold text-text-main">
                {events.length} Overlapping Appointments
              </Dialog.Title>
              <Dialog.Description className="text-xs text-text-muted mt-0.5">
                Multiple doctors have appointments at the same time. Pick one to open.
              </Dialog.Description>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:bg-bg-card rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {events.map((evt, idx) => {
              const doctor = doctors.find(d => d.id === evt.doctorId);
              return (
                <motion.button
                  key={evt.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => { onSelect(evt); onClose(); }}
                  className="w-full text-left p-3 bg-bg-body border border-border-color rounded-xl hover:border-primary/40 transition-colors flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${doctor?.color || 'bg-primary'} text-white font-bold flex items-center justify-center text-sm shrink-0`}>
                    {doctor?.initials || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text-main truncate">{evt.patientName}</div>
                    <div className="text-xs text-text-muted truncate">{evt.treatmentName}</div>
                    <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5">
                      <Clock size={11} />
                      {format(new Date(evt.start), 'h:mm a')} – {format(new Date(evt.end), 'h:mm a')} • {evt.chair}
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

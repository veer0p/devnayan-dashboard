import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CalendarPlus } from '@phosphor-icons/react';
import { mockPatients, mockTreatments } from '../../data/appointments';

export default function BookingModal({ isOpen, onClose }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg bg-bg-card rounded-2xl shadow-xl z-50 p-6 animate-in zoom-in-95 duration-200 focus:outline-none">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
              <CalendarPlus size={24} className="text-primary" />
              Book Appointment
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:bg-bg-body p-1.5 rounded-lg transition-colors focus:outline-none">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Patient</label>
              <select className="w-full h-10 px-3 rounded-xl border border-border-color bg-bg-card outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm">
                <option value="">Select a patient...</option>
                {mockPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Treatment Type</label>
              <select className="w-full h-10 px-3 rounded-xl border border-border-color bg-bg-card outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm">
                <option value="">Select treatment...</option>
                {mockTreatments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.duration} mins)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-main">Date</label>
                <input type="date" className="w-full h-10 px-3 rounded-xl border border-border-color bg-bg-card outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-main">Time</label>
                <input type="time" className="w-full h-10 px-3 rounded-xl border border-border-color bg-bg-card outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Chair</label>
              <select className="w-full h-10 px-3 rounded-xl border border-border-color bg-bg-card outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm">
                <option>Chair 1</option>
                <option>Chair 2</option>
                <option>Chair 3</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Notes</label>
              <textarea 
                className="w-full p-3 rounded-xl border border-border-color bg-bg-card outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none" 
                rows="3" 
                placeholder="Optional notes for this visit..."
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button type="button" className="px-5 py-2 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-body transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
                Confirm Booking
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

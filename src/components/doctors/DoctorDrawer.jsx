import React from 'react';
import { Phone, Envelope, WhatsappLogo, PencilSimple, Trash, X, Stethoscope, Star, Clock, Wallet } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Drawer from '../ui/Drawer';

export default function DoctorDrawer({ doctor, isOpen, onClose, onEdit, onDelete, patientCount = 0, invoiceCount = 0 }) {
  if (!doctor) return null;

  const phoneClean = doctor.phone?.replace(/[^0-9]/g, '');

  const copyUpi = () => {
    if (!doctor.upiId) return;
    navigator.clipboard?.writeText(doctor.upiId).then(() => {
      toast.success('UPI ID copied');
    });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-main text-base font-semibold flex items-center justify-center shrink-0">
            {doctor.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-text-main flex items-center gap-2 min-w-0">
              <span className="truncate">{doctor.name}</span>
              {doctor.isPrimary && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-muted shrink-0">
                  <Star size={10} weight="fill" className="text-primary" /> Primary
                </span>
              )}
            </h2>
            <div className="text-sm text-text-muted mt-0.5 truncate">{doctor.qualification}</div>
            <div className="text-[11px] text-text-muted mt-0.5 truncate">{doctor.specialty} · {doctor.yearsOfExperience} yrs exp.</div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="h-9 w-9 sm:w-auto sm:px-3 rounded-md bg-primary/10 border border-primary/30 text-primary/90 hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center sm:gap-1.5 transition-colors text-[13px] font-semibold"
            title="Edit doctor"
          >
            <PencilSimple size={14} /> <span className="hidden sm:inline">Edit</span>
          </button>
          {!doctor.isPrimary && (
            <button
              onClick={onDelete}
              className="h-9 w-9 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400/90 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
              title="Delete doctor"
            >
              <Trash size={14} />
            </button>
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
            {doctor.phone && (
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
            {doctor.phone && (
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
            {doctor.email && (
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

        {doctor.upiId && (
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

        {doctor.schedule && (
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
    </Drawer>
  );
}

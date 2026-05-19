import React from 'react';
import { Receipt, PencilSimple, Trash, X, WhatsappLogo, Wallet, Eye } from '@phosphor-icons/react';
import { toast } from 'sonner';
import Drawer from '../ui/Drawer';
import StatusBadge from '../ui/StatusBadge';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';

export default function InvoiceDrawer({ invoice, isOpen, onClose, onEdit, onDelete, onViewFull, onTakePayment }) {
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  if (!invoice) return null;
  const patient = patients.find(p => p.id === invoice.patientId);
  const doctor = doctors.find(d => d.id === invoice.doctorId);
  const balance = Math.max(0, invoice.amount - invoice.paid);

  const handleWhatsApp = () => {
    if (!patient?.phone) {
      toast.error('No phone number on record for this patient');
      return;
    }
    const phone = patient.phone.replace(/[^0-9]/g, '');
    const message = `Hello ${invoice.patient},\n\nThis is your invoice ${invoice.id} from Devnayan Dental Clinic.\n\nTreatment: ${invoice.treatment}\nDate: ${new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}\nTotal: ₹${invoice.amount.toLocaleString()}\nPaid: ₹${invoice.paid.toLocaleString()}\nBalance: ₹${balance.toLocaleString()}\n\nThank you.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-start gap-3 bg-bg-body">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-card border border-border-color text-text-muted flex items-center justify-center shrink-0">
            <Receipt size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-mono text-text-muted tracking-wider truncate">{invoice.id}</div>
            <h2 className="text-lg font-semibold text-text-main truncate">{invoice.treatment}</h2>
            <div className="text-[11px] text-text-muted mt-0.5 truncate">
              {new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-main hover:bg-border-color rounded-xl transition-colors shrink-0"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Status */}
        <div className="flex items-center gap-3">
          <StatusBadge status={invoice.status} />
          {balance > 0 && <span className="text-xs text-text-muted">Balance ₹{balance.toLocaleString()}</span>}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden">
          <div className="p-4 bg-bg-body">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Total</div>
            <div className="mt-2 text-[18px] font-semibold tracking-tight text-primary tabular-nums">₹{invoice.amount.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-bg-body">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Paid</div>
            <div className="mt-2 text-[18px] font-semibold tracking-tight text-text-main tabular-nums">₹{invoice.paid.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-bg-body">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Balance</div>
            <div className={`mt-2 text-[18px] font-semibold tracking-tight tabular-nums ${balance > 0 ? 'text-rose-500' : 'text-text-main'}`}>₹{balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Patient + Doctor */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Patient</h4>
            <div className="border border-border-color rounded-xl p-3 bg-bg-body flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color text-text-main font-semibold flex items-center justify-center text-xs">
                {invoice.patient.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-main truncate">{invoice.patient}</div>
                {patient && <div className="text-xs text-text-muted mt-0.5 truncate">{patient.phone}</div>}
              </div>
            </div>
          </div>
          {doctor && (
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-medium text-text-muted/80 mb-2">Treating doctor</h4>
              <div className="border border-border-color rounded-xl p-3 bg-bg-body flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-bg-card border border-border-color text-text-main font-semibold flex items-center justify-center text-xs">
                  {doctor.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-main truncate">{doctor.name}</div>
                  <div className="text-xs text-text-muted mt-0.5 truncate">{doctor.qualification}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2">
          {balance > 0 && (
            <button
              onClick={onTakePayment}
              className="w-full h-11 rounded-md bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm"
            >
              <Wallet size={18} weight="bold" /> Take payment · ₹{balance.toLocaleString()}
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewFull}
              className="h-10 rounded-md bg-primary/10 border border-primary/30 text-primary/90 hover:bg-primary/20 hover:border-primary/60 hover:text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Eye size={15} /> View full
            </button>
            <button
              onClick={handleWhatsApp}
              className="h-10 rounded-md bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366]/90 hover:bg-[#25D366]/20 hover:border-[#25D366]/60 hover:text-[#25D366] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <WhatsappLogo size={15} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-color flex justify-between gap-3 bg-bg-card">
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
          <PencilSimple size={14} /> Edit invoice
        </button>
      </div>
    </Drawer>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Wallet, Money, QrCode, Check, ArrowLeft, WhatsappLogo, CopySimple, ShareNetwork, Tooth } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { mockDoctors } from '../../data/doctors';
import { mockPatientsList } from '../../data/patients';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { sendWhatsAppMessage, sendWhatsAppMedia } from '../../lib/openwa';
import { useCaptureInvoice } from '../../lib/useCaptureInvoice';
import { useClinic } from '../../context/ClinicContext';

const buildUpiUrl = ({ vpa, name, amount, note }) => {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
};

const qrSrc = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&qzone=2&data=${encodeURIComponent(data)}`;

export default function PaymentDialog({ invoice, isOpen, onClose, onPayment }) {
  const { clinic } = useClinic();
  const [step, setStep] = useState(1); // 1: method, 2: details, 3: success
  const [method, setMethod] = useState(null); // 'cash' | 'upi'
  const [amount, setAmount] = useState(0);
  const { capturePdf } = useCaptureInvoice();

  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const [patients] = useLocalStorage('patients', mockPatientsList);

  const doctor = useMemo(
    () => invoice ? doctors.find(d => d.id === invoice.doctorId) : null,
    [invoice, doctors]
  );
  const patient = useMemo(
    () => invoice ? patients.find(p => p.id === invoice.patientId) : null,
    [invoice, patients]
  );

  const balance   = invoice ? Math.max(0, invoice.amount - invoice.paid) : 0;
  const remaining = Math.max(0, balance - amount); // balance left after current payment

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMethod(null);
      setAmount(balance);
    }
  }, [isOpen, balance]);

  if (!invoice) return null;

  const upiUrl = doctor?.upiId
    ? buildUpiUrl({
        vpa: doctor.upiId,
        name: doctor.name,
        amount: amount || balance,
        note: `Invoice ${invoice.id} - ${invoice.treatment}`,
      })
    : '';

  const handleSelectMethod = (m) => {
    if (m === 'upi' && !doctor?.upiId) {
      toast.error(`No UPI ID on file for ${doctor?.name || 'this doctor'}. Add one in the Doctors page.`);
      return;
    }
    setMethod(m);
    setStep(2);
  };

  const handleConfirmPayment = () => {
    if (amount <= 0 || amount > balance) {
      toast.error(`Enter a valid amount up to ₹${balance.toLocaleString()}`);
      return;
    }
    onPayment({ amount, method });
    toast.success(`₹${amount.toLocaleString()} recorded as ${method.toUpperCase()}`);
    setStep(3);
  };

  const handleShareInvoice = async () => {
    if (!patient?.phone) {
      toast.error('No phone number to share with');
      return;
    }
    // `remaining` is already computed at component scope
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const message = [
      `Dear ${invoice.patient},`,
      ``,
      `Thank you for your payment at ${clinic.name}.`,
      ``,
      `Receipt No.  : REC-${invoice.id}`,
      `Treatment    : ${invoice.treatment}`,
      `Date         : ${dateStr}`,
      `Payment Mode : ${method === 'upi' ? 'UPI' : 'Cash'}`,
      ``,
      `Amount Paid  : Rs. ${amount.toLocaleString()}`,
      remaining > 0
        ? `Balance Due  : Rs. ${remaining.toLocaleString()}`
        : `Status       : Paid in Full`,
      ``,
      remaining > 0
        ? `Please clear the remaining balance at your next visit or contact us at +91 84870 05334.`
        : `Your account is fully settled. Thank you.`,
      ``,
      `Regards,`,
      `${clinic.name}`,
    ].filter(s => s !== undefined).join('\n');

    const toastId = toast.loading('Generating payment receipt PDF…');
    try {
      const pdfDataUrl = await capturePdf('receipt-capture-area');

      const res = await sendWhatsAppMedia(patient.phone, {
        base64: pdfDataUrl,
        mimetype: 'application/pdf',
        filename: `receipt-${invoice.id}.pdf`,
        caption: message,
      });

      if (res.success) {
        if (res.manual) {
          toast.success('Receipt PDF downloaded — message copied to clipboard!', { id: toastId });
        } else {
          toast.success('Payment receipt PDF sent via WhatsApp!', { id: toastId });
        }
        onClose();
      } else if (res.cancelled) {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to share receipt', { id: toastId });
    }
  };

  const copyUpiId = () => {
    navigator.clipboard?.writeText(doctor?.upiId || '').then(() => toast.success('UPI ID copied'));
  };

  const copyUpiLink = () => {
    navigator.clipboard?.writeText(upiUrl).then(() => toast.success('UPI link copied'));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] animate-in fade-in duration-200" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[92vw] max-w-md max-h-[88vh] bg-bg-card rounded-2xl shadow-2xl z-[70] focus:outline-none border border-border-color overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-body">
            <div className="flex items-center gap-3">
              {step > 1 && step < 3 && (
                <button
                  onClick={() => { setStep(1); setMethod(null); }}
                  className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-card rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} weight="bold" />
                </button>
              )}
              <Dialog.Title className="text-lg font-bold text-text-main">
                {step === 1 && 'Take Payment'}
                {step === 2 && (method === 'upi' ? 'Pay via UPI' : 'Cash Payment')}
                {step === 3 && 'Payment Complete'}
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:bg-bg-card rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="p-5 space-y-4"
                >
                  <div className="text-center bg-bg-body border border-border-color rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-wider text-text-muted font-semibold">Amount Due</div>
                    <div className="text-4xl font-bold text-text-main mt-1">₹{balance.toLocaleString()}</div>
                    <div className="text-xs text-text-muted mt-1">{invoice.id} • {invoice.patient}</div>
                  </div>

                  <div className="text-sm text-text-muted">How is the patient paying?</div>

                  <button
                    onClick={() => handleSelectMethod('cash')}
                    className="w-full flex items-center gap-4 p-4 bg-bg-body border border-border-color rounded-xl hover:border-primary/40 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                      <Money size={24} weight="duotone" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-text-main">Cash</div>
                      <div className="text-xs text-text-muted">Record cash received at clinic</div>
                    </div>
                    <div className="text-text-muted group-hover:text-primary transition-colors">→</div>
                  </button>

                  <button
                    onClick={() => handleSelectMethod('upi')}
                    className="w-full flex items-center gap-4 p-4 bg-bg-body border border-border-color rounded-xl hover:border-primary/40 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                      <QrCode size={24} weight="duotone" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-text-main">UPI</div>
                      <div className="text-xs text-text-muted">
                        {doctor?.upiId ? `Pay to ${doctor.upiId}` : 'No UPI ID configured'}
                      </div>
                    </div>
                    <div className="text-text-muted group-hover:text-primary transition-colors">→</div>
                  </button>
                </motion.div>
              )}

              {step === 2 && method === 'upi' && (
                <motion.div
                  key="step2-upi"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="p-5 space-y-4"
                >
                  <div className="bg-white rounded-2xl p-4 flex items-center justify-center">
                    <img
                      src={qrSrc(upiUrl)}
                      alt="UPI QR Code"
                      className="w-[240px] h-[240px]"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-text-muted">Scan with any UPI app</div>
                    <div className="text-2xl font-bold text-text-main mt-1">₹{(amount || balance).toLocaleString()}</div>
                    <div className="text-xs text-text-muted">to {doctor.name}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={copyUpiId}
                      className="flex-1 h-9 rounded-lg bg-bg-body border border-border-color hover:border-primary/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CopySimple size={14} /> Copy UPI ID
                    </button>
                    <a
                      href={upiUrl}
                      className="flex-1 h-9 rounded-lg bg-bg-body border border-border-color hover:border-primary/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShareNetwork size={14} /> Open UPI App
                    </a>
                  </div>

                  <div className="text-[10px] font-mono text-text-muted bg-bg-body border border-border-color rounded-lg p-2 break-all">
                    {doctor.upiId}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border-color">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Amount Received</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                      <input
                        type="number"
                        min="1"
                        max={balance}
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value || '0'))}
                        className="w-full h-11 pl-7 pr-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary text-lg font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    <Check size={18} weight="bold" /> Payment Done
                  </button>
                </motion.div>
              )}

              {step === 2 && method === 'cash' && (
                <motion.div
                  key="step2-cash"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="p-5 space-y-4"
                >
                  <div className="bg-bg-body border border-border-color rounded-2xl p-6 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-3">
                      <Money size={32} weight="duotone" />
                    </div>
                    <div className="text-xs uppercase tracking-wider text-text-muted font-semibold">Cash Amount</div>
                    <div className="text-3xl font-bold text-text-main mt-1">₹{(amount || balance).toLocaleString()}</div>
                    <div className="text-xs text-text-muted mt-1">Balance due: ₹{balance.toLocaleString()}</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Amount Received</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                      <input
                        type="number"
                        min="1"
                        max={balance}
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value || '0'))}
                        className="w-full h-11 pl-7 pr-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary text-lg font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    <Check size={18} weight="bold" /> Mark Paid
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center"
                  >
                    <Check size={42} weight="bold" />
                  </motion.div>
                  <div>
                    <div className="text-xl font-bold text-text-main">Payment Received</div>
                    <div className="text-text-muted text-sm mt-1">
                      ₹{amount.toLocaleString()} via {method === 'upi' ? 'UPI' : 'Cash'}
                    </div>
                  </div>
                  <div className="text-sm text-text-muted">
                    Share the receipt with {invoice.patient} on WhatsApp?
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={onClose}
                      className="h-11 rounded-xl bg-bg-body border border-border-color hover:bg-bg-card text-text-main text-sm font-semibold transition-colors"
                    >
                      Done
                    </button>
                    <button
                      onClick={handleShareInvoice}
                      className="h-11 rounded-xl bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <WhatsappLogo size={16} weight="fill" /> Share
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>

        {/* Off-screen Capture Area for Payment Receipt — ALL inline styles, no Tailwind */}
        <div style={{ position: 'fixed', top: -9999, left: -9999, width: 480, pointerEvents: 'none' }}>
          <div
            id="receipt-capture-area"
            style={{ background: '#fff', padding: 32, border: '1px solid #e5e7eb', borderRadius: 16, fontFamily: 'Arial, sans-serif', color: '#1f2937' }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#10B981,#059669)', padding: '20px 24px', borderRadius: 12, color: '#fff', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{clinic.name}</div>
                <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>Advance Dental Care Hospital</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 6 }}>Lal Bahadur Shastri Rd, Bardoli, Gujarat</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.75 }}>Receipt ID</div>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'monospace', marginTop: 2 }}>REC-{invoice?.id}</div>
                <div style={{ fontSize: 9, opacity: 0.75, marginTop: 4 }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Paid By / Date row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f3f4f6', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', fontWeight: 700 }}>Paid By</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginTop: 3 }}>{invoice?.patient}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', fontWeight: 700 }}>Payment Mode</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginTop: 3 }}>{method === 'upi' ? 'UPI' : 'Cash'}</div>
              </div>
            </div>

            {/* Details label */}
            <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', fontWeight: 700, marginBottom: 8 }}>Receipt Details</div>

            {/* Table — all borders via inline styles on cells */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', border: '1px solid #e5e7eb' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', border: '1px solid #e5e7eb' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '9px 10px', color: '#374151', border: '1px solid #e5e7eb' }}>Dental Treatment — {invoice?.treatment}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#374151', border: '1px solid #e5e7eb' }}>Rs. {invoice?.amount?.toLocaleString()}</td>
                </tr>
                <tr style={{ background: '#f0fdf4' }}>
                  <td style={{ padding: '9px 10px', color: '#065f46', fontWeight: 600, border: '1px solid #e5e7eb' }}>Amount Paid</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#059669', border: '1px solid #e5e7eb' }}>Rs. {amount?.toLocaleString()}</td>
                </tr>
                {remaining > 0 && (
                  <tr style={{ background: '#fff7ed' }}>
                    <td style={{ padding: '9px 10px', color: '#9a3412', fontWeight: 600, border: '1px solid #e5e7eb' }}>Balance Remaining</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#dc2626', border: '1px solid #e5e7eb' }}>Rs. {remaining?.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Status badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
              <div style={{ background: remaining <= 0 ? '#ecfdf5' : '#fff7ed', color: remaining <= 0 ? '#065f46' : '#9a3412', border: remaining <= 0 ? '1px solid #d1fae5' : '1px solid #fed7aa', borderRadius: 20, padding: '4px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                {remaining <= 0 ? 'Paid in Full' : 'Partially Paid'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Invoice Ref</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#111827' }}>{invoice?.id}</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>
              Thank you for choosing ${clinic.name} · Computer-generated receipt
            </div>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

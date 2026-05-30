import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Printer, WhatsappLogo, Tooth, CurrencyInr, Wallet } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { mockPatientsList } from '../../data/patients';
import { mockDoctors } from '../../data/doctors';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { sendWhatsAppMessage, sendWhatsAppMedia } from '../../lib/openwa';
import { useCaptureInvoice } from '../../lib/useCaptureInvoice';
import { useClinic } from '../../context/ClinicContext';



export default function InvoiceTemplate({ invoice, isOpen, onClose }) {
  const { clinic } = useClinic();
  const CLINIC = {
    name: clinic.name,
    tagline: clinic.tagline || 'Advance Dental Care Hospital',
    addressLine1: clinic.address,
    addressLine2: '',
    phone: clinic.phone,
    email: clinic.email || 'info@dentease.com',
  };
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const { capturePdf } = useCaptureInvoice();

  const patient = useMemo(
    () => invoice ? patients.find(p => p.id === invoice.patientId) : null,
    [invoice, patients]
  );
  const doctor = useMemo(
    () => invoice ? doctors.find(d => d.id === invoice.doctorId) : null,
    [invoice, doctors]
  );

  if (!invoice) return null;

  const amount = Number(invoice.amount ?? 0);
  const paid = Number(invoice.paid ?? 0);
  const balance = Math.max(0, amount - paid);
  const dateStr = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const handlePrint = () => {
    document.body.classList.add('printing-invoice');
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => document.body.classList.remove('printing-invoice'), 500);
    });
  };

  const handleWhatsApp = async () => {
    if (!patient?.phone) {
      toast.error('No phone number on record');
      return;
    }

    const payLink = `${window.location.origin}/pay/${invoice.id}`;
    const message = [
      `Dear ${invoice.patient || 'Patient'},`,
      ``,
      `Please find attached your invoice from ${clinic.name}.`,
      ``,
      `Invoice No.  : ${invoice.id}`,
      `Treatment    : ${invoice.treatment}`,
      `Date         : ${dateStr}`,
      doctor ? `Doctor       : ${doctor.name}` : '',
      ``,
      `Total Amount : Rs. ${amount.toLocaleString()}`,
      `Amount Paid  : Rs. ${paid.toLocaleString()}`,
      balance > 0
        ? `Balance Due  : Rs. ${balance.toLocaleString()}`
        : `Status       : Paid in Full`,
      balance > 0 ? `` : '',
      balance > 0
        ? `You may pay the balance online at:\n${payLink}\n\nAlternatively, scan the QR code in the attached invoice to pay via UPI.`
        : `Thank you for settling your payment promptly.`,
      ``,
      `For any queries, please contact us at ${clinic.phone}.`,
      ``,
      `Regards,`,
      `${clinic.name}`,
    ].filter(s => s !== undefined).join('\n');

    const toastId = toast.loading('Generating invoice PDF…');
    try {
      const pdfDataUrl = await capturePdf('invoice-capture-area');

      const res = await sendWhatsAppMedia(patient.phone, {
        base64: pdfDataUrl,
        mimetype: 'application/pdf',
        filename: `invoice-${invoice.id}.pdf`,
        caption: message,
      });

      if (res.success) {
        if (res.manual) {
          toast.success('Invoice PDF downloaded — message copied to clipboard!', { id: toastId });
        } else {
          toast.success('Invoice PDF sent via WhatsApp!', { id: toastId });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to share invoice', { id: toastId });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 print:hidden" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed inset-2 md:inset-8 bg-bg-body rounded-2xl z-50 flex flex-col overflow-hidden focus:outline-none print:inset-0 print:bg-white print:rounded-none"
        >
          {/* Top toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-border-color bg-bg-card print:hidden">
            <Dialog.Title className="text-base font-semibold text-text-main">
              Invoice {invoice.id}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="h-9 px-3 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <WhatsappLogo size={16} weight="fill" /> Share
              </button>
              <button
                onClick={handlePrint}
                className="h-9 px-3 rounded-lg bg-primary text-white hover:bg-primary-hover text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Printer size={16} weight="bold" /> Print
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg text-text-muted hover:bg-bg-body flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Invoice paper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 print:p-0 print:overflow-visible">
            <div 
              id="invoice-capture-area"
              className="invoice-paper mx-auto max-w-3xl bg-white text-gray-800 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-full"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#C8902B] to-[#B07D24] px-6 md:px-10 py-6 md:py-8 text-white print:py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
                      <Tooth size={30} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold tracking-tight">{CLINIC.name}</div>
                      <div className="text-sm opacity-90">{CLINIC.tagline}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest opacity-80 mb-1">Invoice</div>
                    <div className="text-2xl font-bold font-mono">{invoice.id}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm">
                  <div className="opacity-90">{CLINIC.addressLine1}<br />{CLINIC.addressLine2}</div>
                  <div className="opacity-90 md:text-center">{CLINIC.phone}</div>
                  <div className="opacity-90 md:text-right">{CLINIC.email}</div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 md:px-10 py-6 md:py-8 space-y-6">
                {/* Meta + parties */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Bill To</div>
                    <div className="font-bold text-gray-900 text-base">{invoice.patient}</div>
                    {patient && (
                      <>
                        <div className="text-sm text-gray-600 mt-0.5">{patient.phone}</div>
                        {patient.address && <div className="text-xs text-gray-500 mt-0.5">{patient.address}</div>}
                        <div className="text-xs text-gray-500 mt-0.5">{patient.age} yrs • {patient.gender}</div>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Treating Doctor</div>
                    {doctor ? (
                      <>
                        <div className="font-bold text-gray-900 text-base">{doctor.name}</div>
                        <div className="text-sm text-[#C8902B] font-medium mt-0.5">{doctor.qualification}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{doctor.specialty}</div>
                        {doctor.phone && <div className="text-xs text-gray-500 mt-0.5">{doctor.phone}</div>}
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Not specified</div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Invoice Date</div>
                    <div className="font-bold text-gray-900 text-base">{dateStr}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2 mt-4">Status</div>
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                      invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      invoice.status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>

                {/* Line items */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        <th className="px-4 py-3 w-12">#</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 w-20 text-center">Qty</th>
                        <th className="px-4 py-3 w-28 text-right">Rate</th>
                        <th className="px-4 py-3 w-32 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-600">1</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {invoice.treatment}
                          <div className="text-xs text-gray-500 font-normal mt-0.5">
                            Performed on {invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">1</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-full md:w-72 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (GST)</span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 text-gray-900">
                      <span>Total</span>
                      <span>₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Paid</span>
                      <span className="font-bold">₹{paid.toLocaleString()}</span>
                    </div>
                    {balance > 0 && (
                      <div className="flex justify-between bg-red-50 -mx-3 px-3 py-2 rounded-lg text-red-700">
                        <span className="font-bold">Balance Due</span>
                        <span className="font-bold">₹{balance.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment info — show QR for any outstanding balance */}
                {balance > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Pay Balance via UPI</div>
                        {doctor?.upiId && (
                          <div className="text-sm font-mono font-bold text-gray-900 mb-1">{doctor.upiId}</div>
                        )}
                        <div className="text-xs text-gray-600">
                          Scan QR code to pay <span className="font-semibold">Rs. {balance.toLocaleString()}</span> instantly via GPay / PhonePe / Paytm
                        </div>
                        <div className="text-xs text-gray-500 mt-2 break-all">
                          Or pay online: <span className="font-mono">{window.location.origin}/pay/{invoice.id}</span>
                        </div>
                      </div>
                      {doctor?.upiId && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&qzone=1&data=${encodeURIComponent(`upi://pay?pa=${doctor.upiId}&pn=${encodeURIComponent(clinic.name)}&am=${balance}&tn=Invoice+${invoice.id}`)}`}
                          alt="UPI QR Code"
                          className="w-20 h-20 rounded-lg border border-amber-200 shrink-0"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-4 items-end">
                  <div>
                    <div className="text-xs text-gray-500">Thank you for choosing</div>
                    <div className="font-bold text-gray-900">{CLINIC.name}</div>
                    <div className="text-xs text-gray-500 mt-2">Computer-generated invoice. No physical signature required for digital copies.</div>
                  </div>
                  <div className="text-right">
                    <div className="h-12 border-b border-gray-300 mb-1" />
                    <div className="text-xs text-gray-500">Authorized Signature</div>
                    {doctor && <div className="text-xs font-medium text-gray-700">{doctor.name}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

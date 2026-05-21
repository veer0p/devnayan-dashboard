import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Tooth, 
  Check, 
  WarningCircle, 
  Wallet, 
  QrCode, 
  WhatsappLogo, 
  Phone, 
  ArrowUpRight, 
  ShieldCheck, 
  CopySimple, 
  Timer
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useLocalStorage } from '../lib/useLocalStorage';
import { mockInvoices } from '../data/billing';
import { mockPatientsList } from '../data/patients';
import { mockDoctors } from '../data/doctors';
import { useClinic } from '../context/ClinicContext';

const CLINIC = {
  name: '${clinic.name}',
  tagline: 'Advance Dental Care Hospital',
  address: 'Lal Bahadur Shastri Rd, Rushikesh Nagar, Bardoli, Gujarat 394601',
  phone: '+91 84870 05334',
  email: 'atodariyaveer1331@gmail.com',
};

const buildUpiUrl = ({ vpa, name, amount, note }) => {
  const { clinic } = useClinic();
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

export default function PublicPayment() {
  const { clinic } = useClinic();
  const { invoiceId } = useParams();
  const [invoices, setInvoices] = useLocalStorage('invoices', mockInvoices);
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find invoice, patient, and doctor
  const invoice = useMemo(() => {
    return invoices.find(i => i.id === invoiceId);
  }, [invoices, invoiceId]);

  const patient = useMemo(() => {
    if (!invoice) return null;
    return patients.find(p => p.id === invoice.patientId);
  }, [invoice, patients]);

  const doctor = useMemo(() => {
    if (!invoice) return null;
    return doctors.find(d => d.id === invoice.doctorId);
  }, [invoice, doctors]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-bg-body flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-bg-card border border-border-color rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <WarningCircle size={32} weight="bold" />
          </div>
          <h2 className="text-xl font-bold text-text-main">Invoice Not Found</h2>
          <p className="text-sm text-text-muted">
            The invoice link you followed is invalid or has been expired. Please contact the clinic for assistance.
          </p>
          <div className="pt-4 border-t border-border-color flex justify-center gap-4">
            <a 
              href={`tel:${CLINIC.phone}`}
              className="flex items-center gap-2 px-4 py-2 bg-bg-body border border-border-color hover:border-primary/40 rounded-xl text-sm font-semibold text-text-main transition-all"
            >
              <Phone size={16} /> Call Clinic
            </a>
          </div>
        </div>
      </div>
    );
  }

  const balance = Math.max(0, invoice.amount - invoice.paid);
  const upiId = doctor?.upiId || 'atodariyaveer1331@oksbi'; // Fallback to developer UPI
  const doctorName = doctor?.name || '${clinic.name}';

  const upiUrl = buildUpiUrl({
    vpa: upiId,
    name: doctorName,
    amount: balance,
    note: `Invoice ${invoice.id} - ${invoice.treatment}`,
  });

  const handleSimulatePayment = () => {
  const { clinic } = useClinic();
    setIsProcessing(true);
    setTimeout(() => {
      // Record payment in state (localStorage)
      setInvoices(prev => prev.map(inv => {
        if (inv.id !== invoice.id) return inv;
        return {
          ...inv,
          paid: inv.amount,
          status: 'Paid'
        };
      }));
      setIsProcessing(false);
      setPaymentSuccess(true);
      toast.success('Payment completed successfully!');
    }, 2000);
  };

  const copyUpiId = () => {
  const { clinic } = useClinic();
    navigator.clipboard?.writeText(upiId).then(() => toast.success('UPI ID copied to clipboard!'));
  };

  return (
    <div className="min-h-screen bg-bg-body text-text-main flex flex-col items-center p-4 sm:p-6 pb-12">
      {/* Brand Header */}
      <div className="w-full max-w-xl text-center my-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-primary-hover text-white flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
          <Tooth size={26} weight="duotone" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-main">{CLINIC.name}</h1>
        <p className="text-xs text-text-muted mt-0.5">{CLINIC.tagline}</p>
      </div>

      <div className="w-full max-w-xl bg-bg-card border border-border-color rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Invoice Summary Ribbon */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-hover/[0.03] p-5 border-b border-border-color flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-text-muted">Invoice Ref</div>
            <div className="text-lg font-bold font-mono text-text-main mt-0.5">{invoice.id}</div>
          </div>
          <span className={`px-3 py-1 rounded-md text-xs font-bold ${
            invoice.status === 'Paid' || paymentSuccess ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
            invoice.status === 'Partial' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
            'bg-rose-500/10 text-rose-500 border border-rose-500/30'
          }`}>
            {paymentSuccess ? 'Paid' : invoice.status}
          </span>
        </div>

        {/* Success State */}
        {(invoice.status === 'Paid' || paymentSuccess) ? (
          <div className="p-8 text-center space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center animate-bounce">
              <Check size={44} weight="bold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-main">Thank You!</h2>
              <p className="text-sm text-text-muted mt-1.5">
                Your payment for invoice <span className="font-mono font-semibold text-text-main">{invoice.id}</span> has been processed successfully.
              </p>
            </div>
            <div className="bg-bg-body border border-border-color rounded-xl p-4 w-full text-left space-y-2">
              <div className="flex justify-between text-xs text-text-muted">
                <span>Treatment</span>
                <span className="font-semibold text-text-main">{invoice.treatment}</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>Amount Paid</span>
                <span className="font-bold text-emerald-500">₹{invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted pt-2 border-t border-border-color">
                <span>Payment Status</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <ShieldCheck size={14} /> Settled in Full
                </span>
              </div>
            </div>
            <div className="text-xs text-text-muted flex items-center gap-1 bg-emerald-500/[0.04] border border-emerald-500/10 px-3 py-2 rounded-lg">
              <Timer size={13} /> Saved directly in clinic ledger database
            </div>
          </div>
        ) : (
          /* Payment Form State */
          <div className="p-5 sm:p-6 space-y-6">
            {/* Amount Banner */}
            <div className="text-center bg-bg-body border border-border-color rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-text-muted font-semibold">Total Amount Outstanding</div>
              <div className="text-4xl font-extrabold text-text-main mt-1.5 tracking-tight">₹{balance.toLocaleString()}</div>
              <div className="text-xs text-text-muted mt-1.5">
                Patient: <span className="font-medium text-text-main">{invoice.patient}</span>
              </div>
            </div>

            {/* Treatment breakdown */}
            <div className="border border-border-color rounded-xl p-4 space-y-3 bg-bg-body/40">
              <h3 className="text-xs uppercase font-bold tracking-wider text-text-muted">Treatment Details</h3>
              <div className="flex justify-between text-sm items-start gap-4">
                <div>
                  <div className="font-semibold text-text-main">{invoice.treatment}</div>
                  <div className="text-xs text-text-muted mt-0.5">Assigned to: {doctorName}</div>
                </div>
                <div className="text-right font-semibold text-text-main">₹{invoice.amount.toLocaleString()}</div>
              </div>
              {invoice.paid > 0 && (
                <div className="flex justify-between text-xs text-text-muted pt-2 border-t border-border-color">
                  <span>Previously Paid</span>
                  <span>- ₹{invoice.paid.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* UPI QR Section */}
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="bg-white rounded-2xl p-4 border border-border-color/60 shadow-md">
                <img 
                  src={qrSrc(upiUrl)} 
                  alt="UPI Payment QR" 
                  className="w-[200px] h-[200px]"
                />
              </div>
              <div className="text-center">
                <div className="text-xs text-text-muted">Scan the QR above using any UPI app</div>
                <div className="text-xs text-text-muted mt-0.5">(GPay, PhonePe, Paytm, BHIM, etc.)</div>
              </div>
            </div>

            {/* Payee UPI details */}
            <div className="flex items-center justify-between p-3 bg-bg-body border border-border-color rounded-xl">
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Treating Doctor UPI ID</div>
                <div className="text-xs font-mono text-text-main mt-0.5 truncate">{upiId}</div>
              </div>
              <button 
                onClick={copyUpiId}
                className="h-8 px-3 rounded-lg bg-bg-card border border-border-color hover:border-primary/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 text-text-main"
              >
                <CopySimple size={13} /> Copy ID
              </button>
            </div>

            {/* Quick deep link buttons for mobile apps */}
            <div className="space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-text-muted mb-1.5">One-Tap Mobile Payment</div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={upiUrl}
                  className="h-11 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Pay via UPI App <ArrowUpRight size={13} weight="bold" />
                </a>
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isProcessing ? 'Verifying...' : 'Simulate Paid ✓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secure Checkout Badge */}
        <div className="p-4 bg-bg-body border-t border-border-color flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck size={16} className="text-primary" />
          <span>Secure transaction encrypted via UPI standard guidelines.</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-xl text-center mt-8 text-xs text-text-muted space-y-1">
        <div>Having issues with payment?</div>
        <div>Contact ${clinic.name} at <a href={`tel:${CLINIC.phone}`} className="font-semibold hover:underline text-text-main">{CLINIC.phone}</a></div>
      </div>
    </div>
  );
}

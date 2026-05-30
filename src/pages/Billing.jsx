import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, WhatsappLogo, Eye, PencilSimple, Trash, Wallet } from '@phosphor-icons/react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import InvoiceDrawer from '../components/billing/InvoiceDrawer';
import InvoiceTemplate from '../components/billing/InvoiceTemplate';
import PaymentDialog from '../components/billing/PaymentDialog';
import { mockInvoices, invoiceStatuses, nextInvoiceId, deriveStatus } from '../data/billing';
import { mockPatientsList } from '../data/patients';
import { mockDoctors } from '../data/doctors';
import { useLocalStorage } from '../lib/useLocalStorage';
import { sendWhatsAppMessage, sendWhatsAppMedia } from '../lib/openwa';
import { useCaptureInvoice } from '../lib/useCaptureInvoice';
import { useClinic } from '../context/ClinicContext';

const filterOptions = [
  { value: 'All', label: 'All Status' },
  ...invoiceStatuses.map(s => ({ value: s, label: s })),
];

export default function Billing() {
  const { clinic } = useClinic();
  const [invoices, setInvoices] = useLocalStorage('invoices', mockInvoices);
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sendingInvoice, setSendingInvoice] = useState(null); // invoice being PDF-captured

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialEditMode, setInitialEditMode] = useState(false);
  const [defaultPatientId, setDefaultPatientId] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [fullInvoice, setFullInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);

  const { capturePdf } = useCaptureInvoice();

  // Honor inbound "New invoice for this patient" intent (from Patient drawer)
  const location = useLocation();
  useEffect(() => {
    if (location.state?.invoiceForPatientId) {
      setDefaultPatientId(location.state.invoiceForPatientId);
      setViewingInvoice(null);
      setInitialEditMode(true);
      setIsDrawerOpen(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.amount, 0);
    const collected = invoices.reduce((s, i) => s + i.paid, 0);
    const pending = invoices.filter(i => i.status === 'Partial').reduce((s, i) => s + (i.amount - i.paid), 0);
    const overdue = invoices.filter(i => i.status === 'Unpaid').reduce((s, i) => s + i.amount, 0);
    const collectedPct = total > 0 ? Math.round((collected / total) * 100) : 0;
    return [
      { label: 'Total billed',   value: `₹${total.toLocaleString()}`,     sub: `${invoices.length} invoices`, accent: true },
      { label: 'Collected',      value: `₹${collected.toLocaleString()}`, sub: `${collectedPct}% of total` },
      { label: 'Partial',        value: `₹${pending.toLocaleString()}`,   sub: `${invoices.filter(i => i.status === 'Partial').length} pending` },
      { label: 'Unpaid',         value: `₹${overdue.toLocaleString()}`,   sub: `${invoices.filter(i => i.status === 'Unpaid').length} overdue` },
    ];
  }, [invoices]);

  const openAdd = () => {
    setViewingInvoice(null);
    setInitialEditMode(true);
    setIsDrawerOpen(true);
  };

  const openEdit = (inv) => {
    setViewingInvoice(inv);
    setInitialEditMode(true);
    setIsDrawerOpen(true);
  };

  const openView = (inv) => {
    setViewingInvoice(inv);
    setInitialEditMode(false);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (invoice, isEdit) => {
    if (isEdit) {
      setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
      return;
    }
    setInvoices(prev => [invoice, ...prev]);
    // Smooth handoff: if the new invoice still has a balance, jump straight into
    // the payment dialog so the user doesn't have to hunt the row down.
    // Defer one tick so the InvoiceModal can finish unmounting before the
    // PaymentDialog opens — keeps Radix focus management happy.
    if (invoice.amount - invoice.paid > 0) {
      setTimeout(() => setPayingInvoice(invoice), 0);
    }
  };

  const handleDelete = () => {
    if (!deletingInvoice) return;
    setInvoices(prev => prev.filter(i => i.id !== deletingInvoice.id));
    toast.success(`${deletingInvoice.id} deleted`);
    setViewingInvoice(null);
    setDeletingInvoice(null);
  };

  const handlePayment = ({ amount }) => {
    if (!payingInvoice) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== payingInvoice.id) return inv;
      const newPaid = Math.min(inv.amount, inv.paid + amount);
      const updated = { ...inv, paid: newPaid, status: deriveStatus(inv.amount, newPaid) };
      // Sync viewing drawer if open
      if (viewingInvoice?.id === inv.id) setViewingInvoice(updated);
      setPayingInvoice(updated);
      return updated;
    }));
  };

  const sendWhatsApp = async (inv) => {
    const patient = patients.find(p => p.id === inv.patientId);
    const doctor  = doctors.find(d => d.id === inv.doctorId);
    if (!patient?.phone) {
      toast.error('No phone number on record for this patient');
      return;
    }
    const invAmount = Number(inv.amount ?? 0);
    const invPaid = Number(inv.paid ?? 0);
    const balance = Math.max(0, invAmount - invPaid);
    const dateStr = inv.date ? new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const payLink = `${window.location.origin}/pay/${inv.id}`;

    const message = [
      `Dear ${inv.patient || 'Patient'},`,
      ``,
      inv.status === 'Paid'
        ? `Your invoice has been fully settled. Thank you for your prompt payment.`
        : `Please find below the details of your outstanding invoice from ${clinic.name}.`,
      ``,
      `Invoice No.  : ${inv.id}`,
      `Treatment    : ${inv.treatment}`,
      `Date         : ${dateStr}`,
      doctor ? `Doctor       : ${doctor.name}` : '',
      ``,
      `Total Amount : Rs. ${invAmount.toLocaleString()}`,
      `Amount Paid  : Rs. ${invPaid.toLocaleString()}`,
      balance > 0
        ? `Balance Due  : Rs. ${balance.toLocaleString()}`
        : `Status       : Paid in Full`,
      ``,
      balance > 0
        ? `Please pay the balance at your earliest convenience.\nPay online: ${payLink}\n\nScan the QR code in the attached PDF to pay via UPI (GPay / PhonePe / Paytm).`
        : `We appreciate your continued trust in ${clinic.name}.`,
      ``,
      `For any queries, contact us at ${clinic.phone}.`,
      ``,
      `Regards,`,
      `${clinic.name}`,
    ].filter(s => s !== undefined).join('\n');

    const toastId = toast.loading('Generating invoice PDF…');
    try {
      // Mount the hidden capture area with this invoice, then capture after a brief paint
      setSendingInvoice({ inv, patient, doctor });
      await new Promise(r => setTimeout(r, 300)); // allow DOM to paint

      const pdfDataUrl = await capturePdf('billing-invoice-capture');
      setSendingInvoice(null);

      const res = await sendWhatsAppMedia(patient.phone, {
        base64: pdfDataUrl,
        mimetype: 'application/pdf',
        filename: `invoice-${inv.id}.pdf`,
        caption: message,
      });

      if (res.success) {
        if (res.manual) {
          toast.success('Invoice PDF downloaded — message copied to clipboard!', { id: toastId });
        } else {
          toast.success('Invoice PDF sent via WhatsApp!', { id: toastId });
        }
      } else if (res.cancelled) {
        toast.dismiss(toastId);
      }
    } catch (err) {
      setSendingInvoice(null);
      toast.error(err.message || 'Failed to send invoice', { id: toastId });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Billing</h1>
          <p className="text-text-muted text-sm">Manage invoices and payments</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={openAdd}
            className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" /> New Invoice
          </button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-bg-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">{s.label}</div>
            <div className={`mt-2 text-[24px] leading-none font-semibold tracking-tight ${s.accent ? 'text-primary' : 'text-text-main'}`}>
              {s.value}
            </div>
            <div className="text-[11px] text-text-muted mt-2">{s.sub}</div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl shadow-sm"
      >
        <div className="p-4 border-b border-border-color flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <Select
            value={filter}
            onChange={setFilter}
            options={filterOptions}
            className="w-full sm:w-44"
            size="md"
          />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-text-muted border-b border-border-color">
                <th className="pb-3 pt-4 font-semibold pl-4">Invoice</th>
                <th className="pb-3 pt-4 font-semibold">Patient</th>
                <th className="pb-3 pt-4 font-semibold">Treatment</th>
                <th className="pb-3 pt-4 font-semibold">Date</th>
                <th className="pb-3 pt-4 font-semibold">Amount</th>
                <th className="pb-3 pt-4 font-semibold">Paid</th>
                <th className="pb-3 pt-4 font-semibold">Status</th>
                <th className="pb-3 pt-4 font-semibold pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr
                  key={inv.id}
                  onClick={() => openView(inv)}
                  className="border-b border-border-color last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3 pl-4 font-mono text-[12px] text-text-muted">{inv.id}</td>
                  <td className="py-3 font-medium text-text-main">{inv.patient}</td>
                  <td className="py-3 text-text-muted">{inv.treatment}</td>
                  <td className="py-3 text-text-muted text-[12px]">{new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3 font-semibold tabular-nums text-text-main">₹{inv.amount.toLocaleString()}</td>
                  <td className="py-3 font-medium tabular-nums text-text-muted">₹{inv.paid.toLocaleString()}</td>
                  <td className="py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); openView(inv); }}
                        className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary/80 shadow-sm hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center transition-colors"
                        title="View invoice"
                      >
                        <Eye size={14} />
                      </button>
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setPayingInvoice(inv); }}
                          title="Take payment"
                          className="h-8 px-2.5 rounded-md bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 flex items-center justify-center gap-1 transition-colors text-[11px] font-semibold"
                        >
                          <Wallet size={13} /> Pay
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(inv); }}
                        className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary/80 shadow-sm hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center transition-colors"
                        title="Edit invoice"
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); sendWhatsApp(inv); }}
                        className="h-8 w-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366]/80 shadow-sm hover:bg-[#25D366]/20 hover:border-[#25D366]/60 hover:text-[#25D366] flex items-center justify-center transition-colors"
                        title="Send via WhatsApp"
                      >
                        <WhatsappLogo size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingInvoice(inv); }}
                        className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400/80 shadow-sm hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
                        title="Delete invoice"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-text-muted">No invoices match your search.</div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-3 space-y-3">
          {filtered.map(inv => (
            <div
              key={inv.id}
              onClick={() => openView(inv)}
              className="bg-bg-body border border-border-color rounded-xl p-4 cursor-pointer active:bg-border-color/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-text-main">{inv.patient}</div>
                  <div className="text-xs text-text-muted mt-0.5">{inv.treatment}</div>
                </div>
                <StatusBadge status={inv.status} size="xs" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-text-muted text-xs font-mono">{inv.id}</span>
                  <span className="text-text-muted text-xs mx-2">·</span>
                  <span className="text-text-muted text-xs">{new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-text-main tabular-nums">₹{inv.amount.toLocaleString()}</span>
                  {inv.status !== 'Paid' && <span className="text-xs text-text-muted ml-2">({Math.round((inv.paid / inv.amount) * 100)}% paid)</span>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-12 text-center text-text-muted">No invoices found.</div>}
        </div>
      </motion.div>

      <InvoiceDrawer
        invoice={viewingInvoice}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setViewingInvoice(null);
          setDefaultPatientId(null);
        }}
        onUpdate={handleSubmit}
        onDelete={(inv) => setDeletingInvoice(inv)}
        onViewFull={(inv) => setFullInvoice(inv)}
        onTakePayment={(inv) => setPayingInvoice(inv)}
        initialEditMode={initialEditMode}
        nextId={nextInvoiceId(invoices)}
        defaultPatientId={defaultPatientId}
      />

      <InvoiceTemplate
        invoice={fullInvoice}
        isOpen={!!fullInvoice}
        onClose={() => setFullInvoice(null)}
      />

      <PaymentDialog
        invoice={payingInvoice}
        isOpen={!!payingInvoice}
        onClose={() => setPayingInvoice(null)}
        onPayment={handlePayment}
      />

      <ConfirmDialog
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={handleDelete}
        title="Delete this invoice?"
        description={deletingInvoice ? `Invoice ${deletingInvoice.id} for ${deletingInvoice.patient} (₹${deletingInvoice.amount.toLocaleString()}) will be permanently removed.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
      {/* Off-screen invoice capture for direct PDF generation */}
      {sendingInvoice && (() => {
        const { inv, patient, doctor } = sendingInvoice;
        const bal = Math.max(0, inv.amount - inv.paid);
        const dateStr = new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const upiUrl = doctor?.upiId ? `upi://pay?pa=${doctor.upiId}&pn=${encodeURIComponent(clinic.name)}&am=${bal}&tn=Invoice+${inv.id}` : null;
        return (
          <div style={{ position: 'fixed', top: -9999, left: -9999, width: 595, pointerEvents: 'none' }}>
            <div id="billing-invoice-capture" style={{ background: '#fff', padding: 40, fontFamily: 'Arial, sans-serif', color: '#1f2937' }}>

              {/* Header banner */}
              <div style={{ background: 'linear-gradient(135deg,#C8902B,#B07D24)', padding: '20px 28px', borderRadius: 12, color: '#fff', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{clinic.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3 }}>Advance Dental Care Hospital</div>
                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 8 }}>{clinic.address}</div>
                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{clinic.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.75 }}>Invoice</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', marginTop: 3 }}>{inv.id}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 5 }}>{dateStr}</div>
                </div>
              </div>

              {/* Bill To / Doctor row */}
              <div style={{ display: 'flex', gap: 32, marginBottom: 28 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.5, color: '#9ca3af', fontWeight: 700, marginBottom: 5 }}>Bill To</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{inv.patient}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{patient?.phone}</div>
                </div>
                {doctor && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.5, color: '#9ca3af', fontWeight: 700, marginBottom: 5 }}>Treating Doctor</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{doctor.name}</div>
                    <div style={{ fontSize: 11, color: '#C8902B', fontWeight: 500, marginTop: 3 }}>{doctor.qualification}</div>
                  </div>
                )}
              </div>

              {/* Line item table — inline borders on every cell */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', border: '1px solid #e5e7eb' }}>Description</th>
                    <th style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', border: '1px solid #e5e7eb' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '11px 14px', color: '#374151', border: '1px solid #e5e7eb' }}>{inv.treatment}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 600, color: '#111827', border: '1px solid #e5e7eb' }}>Rs. {inv.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <div style={{ width: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 5 }}>
                    <span>Total</span><span style={{ fontWeight: 600 }}>Rs. {inv.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669', marginBottom: 5 }}>
                    <span>Paid</span><span style={{ fontWeight: 700 }}>Rs. {inv.paid.toLocaleString()}</span>
                  </div>
                  {bal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#dc2626', paddingTop: 6, borderTop: '1px solid #e5e7eb' }}>
                      <span>Balance Due</span><span>Rs. {bal.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR + UPI section for pending */}
              {bal > 0 && (
                <div style={{ border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 18px', background: '#fffbeb', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#92400e', marginBottom: 5 }}>Pay Balance via UPI</div>
                    {doctor?.upiId && <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#111827', marginBottom: 5 }}>{doctor.upiId}</div>}
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      Scan QR to pay <strong style={{ color: '#111827' }}>Rs. {bal.toLocaleString()}</strong> via GPay / PhonePe / Paytm
                    </div>
                  </div>
                  {upiUrl && (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&qzone=1&data=${encodeURIComponent(upiUrl)}`}
                      alt="UPI QR"
                      style={{ width: 90, height: 90, border: '1px solid #fcd34d', borderRadius: 8, flexShrink: 0 }}
                    />
                  )}
                </div>
              )}

              {/* Footer */}
              <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>
                Thank you for choosing ${clinic.name} · Computer-generated invoice
              </div>

            </div>
          </div>
        );
      })()}
    </AppLayout>
  );
}

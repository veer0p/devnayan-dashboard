import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, WhatsappLogo, Eye, PencilSimple, Trash, Wallet } from '@phosphor-icons/react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import InvoiceModal from '../components/billing/InvoiceModal';
import InvoiceDrawer from '../components/billing/InvoiceDrawer';
import InvoiceTemplate from '../components/billing/InvoiceTemplate';
import PaymentDialog from '../components/billing/PaymentDialog';
import { mockInvoices, invoiceStatuses, nextInvoiceId, deriveStatus } from '../data/billing';
import { mockPatientsList } from '../data/patients';
import { useLocalStorage } from '../lib/useLocalStorage';

const filterOptions = [
  { value: 'All', label: 'All Status' },
  ...invoiceStatuses.map(s => ({ value: s, label: s })),
];

export default function Billing() {
  const [invoices, setInvoices] = useLocalStorage('invoices', mockInvoices);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [defaultPatientId, setDefaultPatientId] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [fullInvoice, setFullInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);

  // Honor inbound "New invoice for this patient" intent (from Patient drawer)
  const location = useLocation();
  useEffect(() => {
    if (location.state?.invoiceForPatientId) {
      setDefaultPatientId(location.state.invoiceForPatientId);
      setEditingInvoice(null);
      setIsModalOpen(true);
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
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditingInvoice(inv);
    setIsModalOpen(true);
    setViewingInvoice(null);
  };

  const handleSubmit = (invoice, isEdit) => {
    if (isEdit) {
      setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
    } else {
      setInvoices(prev => [invoice, ...prev]);
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

  const sendWhatsApp = (inv) => {
    const patient = mockPatientsList.find(p => p.id === inv.patientId);
    if (!patient?.phone) {
      toast.error('No phone number on record');
      return;
    }
    const balance = Math.max(0, inv.amount - inv.paid);
    const phone = patient.phone.replace(/[^0-9]/g, '');
    const message = `Hello ${inv.patient},\n\nInvoice ${inv.id} from Devnayan Dental Clinic.\n${inv.treatment} - ₹${inv.amount.toLocaleString()}\nPaid: ₹${inv.paid.toLocaleString()} | Balance: ₹${balance.toLocaleString()}\n\nThank you.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
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
                  onClick={() => setViewingInvoice(inv)}
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
                        onClick={(e) => { e.stopPropagation(); setViewingInvoice(inv); }}
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
              onClick={() => setViewingInvoice(inv)}
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

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingInvoice(null); setDefaultPatientId(null); }}
        onSubmit={handleSubmit}
        initialInvoice={editingInvoice}
        nextId={nextInvoiceId(invoices)}
        defaultPatientId={defaultPatientId}
      />

      <InvoiceDrawer
        invoice={viewingInvoice}
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        onEdit={() => openEdit(viewingInvoice)}
        onDelete={() => setDeletingInvoice(viewingInvoice)}
        onViewFull={() => setFullInvoice(viewingInvoice)}
        onTakePayment={() => setPayingInvoice(viewingInvoice)}
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
    </AppLayout>
  );
}

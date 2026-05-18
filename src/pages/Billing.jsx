import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, Receipt, WhatsappLogo, Eye, CaretDown, Check, Clock, Warning } from '@phosphor-icons/react';
import AppLayout from '../components/layout/AppLayout';

const invoices = [
  { id: 'INV-001', patient: 'Aarav Patel', treatment: 'General Consultation', date: '2026-05-10', amount: 500, paid: 500, status: 'Paid' },
  { id: 'INV-002', patient: 'Diya Sharma', treatment: 'Crown Preparation', date: '2026-05-01', amount: 5000, paid: 2500, status: 'Partial' },
  { id: 'INV-003', patient: 'Rohan Gupta', treatment: 'Extraction + Follow-up', date: '2025-11-15', amount: 2000, paid: 2000, status: 'Paid' },
  { id: 'INV-004', patient: 'Ananya Singh', treatment: 'Emergency Consultation', date: '2024-03-12', amount: 800, paid: 800, status: 'Paid' },
  { id: 'INV-005', patient: 'Kabir Kumar', treatment: 'General Consultation', date: '2026-05-10', amount: 500, paid: 0, status: 'Unpaid' },
  { id: 'INV-006', patient: 'Meera Desai', treatment: 'Teeth Whitening', date: '2026-04-20', amount: 3500, paid: 3500, status: 'Paid' },
  { id: 'INV-007', patient: 'Vikram Joshi', treatment: 'Root Canal', date: '2026-05-05', amount: 8000, paid: 4000, status: 'Partial' },
  { id: 'INV-008', patient: 'Priya Nair', treatment: 'Cleaning & Polishing', date: '2026-05-12', amount: 1200, paid: 0, status: 'Unpaid' },
];

const stats = [
  { label: 'Total Revenue', value: '₹21,500', sub: 'This month', color: 'text-primary' },
  { label: 'Collected', value: '₹13,300', sub: '61.8%', color: 'text-emerald-400' },
  { label: 'Pending', value: '₹8,200', sub: '3 invoices', color: 'text-amber-400' },
  { label: 'Overdue', value: '₹500', sub: '1 invoice', color: 'text-red-400' },
];

const statusStyle = {
  Paid: 'bg-emerald-900/30 text-emerald-400',
  Partial: 'bg-amber-900/30 text-amber-400',
  Unpaid: 'bg-red-900/30 text-red-400',
};

const statusIcon = {
  Paid: <Check size={12} weight="bold" />,
  Partial: <Clock size={12} weight="bold" />,
  Unpaid: <Warning size={12} weight="bold" />,
};

export default function Billing() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Billing</h1>
          <p className="text-text-muted text-sm">Manage invoices and payments</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
            <Plus size={16} weight="bold" /> New Invoice
          </button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border border-border-color rounded-xl p-4"
          >
            <div className="text-xs text-text-muted font-medium mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-text-muted mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl shadow-sm"
      >
        {/* Toolbar */}
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
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-9 px-3 bg-bg-card border border-border-color rounded-lg text-sm focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
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
                <tr key={inv.id} className="border-b border-border-color last:border-0 hover:bg-bg-body/50 transition-colors cursor-pointer">
                  <td className="py-3 pl-4 font-mono text-xs text-primary font-semibold">{inv.id}</td>
                  <td className="py-3 font-medium">{inv.patient}</td>
                  <td className="py-3 text-text-muted">{inv.treatment}</td>
                  <td className="py-3 text-text-muted">{new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3 font-semibold">₹{inv.amount.toLocaleString()}</td>
                  <td className="py-3 font-medium text-emerald-400">₹{inv.paid.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusStyle[inv.status]}`}>
                      {statusIcon[inv.status]} {inv.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-green-400 hover:bg-green-900/20 rounded transition-colors" title="Send via WhatsApp">
                        <WhatsappLogo size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-3 space-y-3">
          {filtered.map(inv => (
            <div key={inv.id} className="bg-bg-body border border-border-color rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-text-main">{inv.patient}</div>
                  <div className="text-xs text-text-muted mt-0.5">{inv.treatment}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${statusStyle[inv.status]}`}>
                  {statusIcon[inv.status]} {inv.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-text-muted text-xs">{inv.id}</span>
                  <span className="text-text-muted text-xs mx-2">•</span>
                  <span className="text-text-muted text-xs">{new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-text-main">₹{inv.amount.toLocaleString()}</span>
                  {inv.status !== 'Paid' && <span className="text-xs text-emerald-400 ml-2">(₹{inv.paid} paid)</span>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-12 text-center text-text-muted">No invoices found.</div>}
        </div>
      </motion.div>
    </AppLayout>
  );
}

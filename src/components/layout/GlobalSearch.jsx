import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  X,
  Users,
  ChatCircleDots,
  ShoppingCart,
  Package,
  Stethoscope,
  CornersIn,
} from '@phosphor-icons/react';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { mockPatientsList } from '../../data/patients';
import { mockInvoices } from '../../data/billing';
import { mockInventory } from '../../data/inventory';
import { mockAppointments } from '../../data/appointments';
import { mockDoctors } from '../../data/doctors';
import { format } from 'date-fns';

const groupMeta = {
  patients:     { label: 'Patients',     icon: Users,           path: '/patients',     color: 'text-blue-500' },
  appointments: { label: 'Appointments', icon: ChatCircleDots,  path: '/appointments', color: 'text-emerald-500' },
  invoices:     { label: 'Invoices',     icon: ShoppingCart,    path: '/billing',      color: 'text-amber-500' },
  inventory:    { label: 'Inventory',    icon: Package,         path: '/inventory',    color: 'text-purple-400' },
  doctors:      { label: 'Doctors',      icon: Stethoscope,     path: '/doctors',      color: 'text-primary' },
};

export default function GlobalSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [appointments] = useLocalStorage('appointments', mockAppointments);
  const [invoices] = useLocalStorage('invoices', mockInvoices);
  const [inventory] = useLocalStorage('inventory', mockInventory);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();

    const matchedPatients = patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    ).slice(0, 6).map(p => ({
      group: 'patients',
      id: p.id,
      title: p.name,
      subtitle: `${p.phone} • ${p.age} yrs`,
      meta: p.balance > 0 ? `₹${p.balance.toLocaleString()} due` : '',
    }));

    const matchedAppts = appointments.filter(a =>
      a.patientName.toLowerCase().includes(q) ||
      a.treatmentName.toLowerCase().includes(q) ||
      a.chair?.toLowerCase().includes(q)
    ).slice(0, 5).map(a => ({
      group: 'appointments',
      id: a.id,
      title: `${a.patientName} • ${a.treatmentName}`,
      subtitle: `${format(new Date(a.start), 'EEE d MMM, h:mm a')} • ${a.chair}`,
      meta: a.status,
    }));

    const matchedInvoices = invoices.filter(i =>
      i.patient.toLowerCase().includes(q) ||
      i.treatment.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    ).slice(0, 5).map(i => ({
      group: 'invoices',
      id: i.id,
      title: `${i.id} • ${i.patient}`,
      subtitle: `${i.treatment} • ${new Date(i.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      meta: `₹${i.amount.toLocaleString()} • ${i.status}`,
    }));

    const matchedInventory = inventory.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q)
    ).slice(0, 5).map(it => ({
      group: 'inventory',
      id: it.id,
      title: it.name,
      subtitle: `${it.category} • ${it.stock} ${it.unit}`,
      meta: it.stock <= it.minStock ? 'Low Stock' : `₹${it.price.toLocaleString()}/unit`,
    }));

    const matchedDoctors = doctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q) ||
      d.upiId?.toLowerCase().includes(q)
    ).slice(0, 5).map(d => ({
      group: 'doctors',
      id: d.id,
      title: d.name,
      subtitle: `${d.qualification} • ${d.specialty}`,
      meta: d.upiId || '',
    }));

    return [
      ...matchedPatients,
      ...matchedAppts,
      ...matchedInvoices,
      ...matchedInventory,
      ...matchedDoctors,
    ];
  }, [query, patients, appointments, invoices, inventory, doctors]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const handleSelect = (r) => {
    navigate(groupMeta[r.group].path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    }
  };

  // Group results
  const grouped = useMemo(() => {
    const out = {};
    results.forEach(r => {
      if (!out[r.group]) out[r.group] = [];
      out[r.group].push(r);
    });
    return out;
  }, [results]);

  let runningIdx = -1;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] animate-in fade-in duration-150" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-[50%] top-[12vh] translate-x-[-50%] w-[94vw] max-w-2xl max-h-[76vh] bg-bg-card rounded-2xl shadow-2xl z-[90] border border-border-color flex flex-col overflow-hidden focus:outline-none"
        >
          <Dialog.Title className="sr-only">Global Search</Dialog.Title>
          <div className="flex items-center gap-3 p-4 border-b border-border-color bg-bg-body">
            <MagnifyingGlass size={20} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search patients, appointments, invoices, inventory, doctors..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-text-muted/60 text-text-main"
            />
            <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] bg-bg-card border border-border-color rounded px-1.5 py-0.5 text-text-muted font-mono">
              ESC
            </kbd>
            <button onClick={onClose} className="md:hidden text-text-muted hover:bg-bg-card p-1 rounded">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!query.trim() && (
              <div className="p-12 text-center text-text-muted">
                <CornersIn size={32} className="mx-auto mb-3 opacity-40" />
                <div className="text-sm font-medium">Start typing to search</div>
                <div className="text-xs mt-1">across patients, appointments, invoices, inventory and doctors</div>
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div className="p-12 text-center text-text-muted">
                <div className="text-sm font-medium">No matches for "{query}"</div>
              </div>
            )}

            {Object.entries(grouped).map(([group, items]) => {
              const meta = groupMeta[group];
              const Icon = meta.icon;
              return (
                <div key={group}>
                  <div className="px-4 py-2 sticky top-0 bg-bg-card/95 backdrop-blur border-b border-border-color/40">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className={meta.color} />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">{meta.label}</span>
                      <span className="text-[10px] text-text-muted">{items.length}</span>
                    </div>
                  </div>
                  {items.map(r => {
                    runningIdx += 1;
                    const isActive = runningIdx === activeIdx;
                    const idx = runningIdx;
                    return (
                      <motion.button
                        key={`${r.group}-${r.id}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelect(r)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                          isActive ? 'bg-bg-body' : 'hover:bg-bg-body/50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-bg-body border border-border-color flex items-center justify-center ${meta.color} shrink-0`}>
                          <Icon size={14} weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-main truncate">{r.title}</div>
                          <div className="text-[11px] text-text-muted truncate">{r.subtitle}</div>
                        </div>
                        {r.meta && (
                          <div className="text-[11px] font-semibold text-text-muted shrink-0">{r.meta}</div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-border-color bg-bg-body text-[10px] text-text-muted flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg-card border border-border-color rounded">↑</kbd><kbd className="px-1 py-0.5 bg-bg-card border border-border-color rounded">↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg-card border border-border-color rounded">↵</kbd> Open</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

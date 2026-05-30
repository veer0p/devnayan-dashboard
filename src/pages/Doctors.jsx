import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, Stethoscope, PencilSimple, Trash, Phone, WhatsappLogo, Wallet, Star } from '@phosphor-icons/react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DoctorDrawer from '../components/doctors/DoctorDrawer';
import { useLocalStorage } from '../lib/useLocalStorage';
import { mockDoctors, doctorSpecialties } from '../data/doctors';
import { mockPatientsList } from '../data/patients';
import { mockInvoices } from '../data/billing';

const specialtyOptions = [
  { value: 'All', label: 'All Specialties' },
  ...doctorSpecialties.map(s => ({ value: s, label: s })),
];

const DOCTOR_DOT_HEX = {
  'bg-primary':       '#C8902B',
  'bg-blue-500':      '#3B82F6',
  'bg-emerald-500':   '#10B981',
  'bg-purple-500':    '#A855F7',
  'bg-rose-500':      '#F43F5E',
  'bg-amber-500':     '#F59E0B',
};
const doctorDotHex = (c) => DOCTOR_DOT_HEX[c] || '#9CA3AF';

export default function Doctors() {
  const [doctors, setDoctors] = useLocalStorage('doctors', mockDoctors);
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [invoices] = useLocalStorage('invoices', mockInvoices);

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');

  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [initialEditMode, setInitialEditMode] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState(null);

  const filtered = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                         d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialty === 'All' ? true : d.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  const countsByDoctor = useMemo(() => {
    const counts = {};
    doctors.forEach(d => {
      counts[d.id] = {
        patients: patients.filter(p => p.doctorId === d.id).length,
        invoices: invoices.filter(i => i.doctorId === d.id).length,
        revenue: invoices.filter(i => i.doctorId === d.id).reduce((s, i) => s + i.paid, 0),
      };
    });
    return counts;
  }, [doctors, patients, invoices]);

  const openAdd = () => {
    setViewingDoctor(null);
    setInitialEditMode(true);
    setIsDrawerOpen(true);
  };

  const openEdit = (doctor) => {
    setViewingDoctor(doctor);
    setInitialEditMode(true);
    setIsDrawerOpen(true);
  };

  const openView = (doctor) => {
    setViewingDoctor(doctor);
    setInitialEditMode(false);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (doctor, isEdit) => {
    if (doctor.isPrimary) {
      // ensure only one primary
      setDoctors(prev => {
        const updated = prev.map(d => d.id === doctor.id ? doctor : { ...d, isPrimary: false });
        if (!isEdit) {
          return [...updated.filter(d => !d.isPrimary || d.id === doctor.id), doctor].filter((d, i, arr) =>
            arr.findIndex(x => x.id === d.id) === i
          );
        }
        return updated;
      });
    } else if (isEdit) {
      setDoctors(prev => prev.map(d => d.id === doctor.id ? doctor : d));
    } else {
      setDoctors(prev => [...prev, doctor]);
    }
  };

  const handleDelete = () => {
    if (!deletingDoctor) return;
    setDoctors(prev => prev.filter(d => d.id !== deletingDoctor.id));
    toast.success(`${deletingDoctor.name} removed`);
    setViewingDoctor(null);
    setDeletingDoctor(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Doctors</h1>
          <p className="text-text-muted text-sm">{doctors.length} doctors • Linked to patients & invoices</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={openAdd}
            className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" /> Add Doctor
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl shadow-sm mb-6"
      >
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <Select
            value={specialty}
            onChange={setSpecialty}
            options={specialtyOptions}
            className="w-full sm:w-56"
            size="md"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doctor, idx) => {
          const counts = countsByDoctor[doctor.id] || { patients: 0, invoices: 0, revenue: 0 };
          const phoneClean = doctor.phone?.replace(/[^0-9]/g, '');
          return (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => openView(doctor)}
              className="bg-bg-card border border-border-color rounded-xl p-5 cursor-pointer hover:border-text-muted/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-lg bg-bg-body border border-border-color text-text-main font-semibold flex items-center justify-center text-sm">
                    {doctor.initials}
                    <span
                      className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-bg-card"
                      style={{ background: doctorDotHex(doctor.color) }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-text-main flex items-center gap-2 truncate">
                      {doctor.name}
                      {doctor.isPrimary && (
                        <Star size={11} weight="fill" className="text-primary shrink-0" title="Primary" />
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">{doctor.qualification}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(doctor); }}
                    className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary/80 shadow-sm hover:bg-primary/20 hover:border-primary/60 hover:text-primary flex items-center justify-center transition-colors"
                    title="Edit doctor"
                  >
                    <PencilSimple size={13} />
                  </button>
                  {!doctor.isPrimary && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingDoctor(doctor); }}
                      className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400/80 shadow-sm hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-rose-500 flex items-center justify-center transition-colors"
                      title="Delete doctor"
                    >
                      <Trash size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-text-muted mb-3 flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2 py-0.5 rounded bg-bg-body border border-border-color">
                  {doctor.specialty}
                </span>
                {doctor.yearsOfExperience > 0 && (
                  <span>{doctor.yearsOfExperience} yrs exp.</span>
                )}
              </div>

              {doctor.upiId && (
                <div className="flex items-center gap-2 text-[11px] text-text-muted mb-4 p-2 bg-bg-body border border-border-color rounded-lg">
                  <Wallet size={12} className="text-text-muted shrink-0" />
                  <span className="font-mono truncate flex-1">{doctor.upiId}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border-color">
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Patients</div>
                  <div className="text-sm font-semibold text-text-main mt-0.5 tabular-nums">{counts.patients}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Invoices</div>
                  <div className="text-sm font-semibold text-text-main mt-0.5 tabular-nums">{counts.invoices}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Revenue</div>
                  <div className="text-sm font-semibold text-text-main mt-0.5 tabular-nums">₹{counts.revenue.toLocaleString()}</div>
                </div>
              </div>

              {phoneClean && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border-color">
                  <a
                    href={`tel:${phoneClean}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-8 rounded-lg bg-primary/10 border border-primary/30 text-primary/90 flex items-center justify-center gap-1.5 text-[11px] font-semibold hover:bg-primary/20 hover:border-primary/60 hover:text-primary transition-colors"
                  >
                    <Phone size={11} /> Call
                  </a>
                  <a
                    href={`https://wa.me/${phoneClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366]/90 flex items-center justify-center gap-1.5 text-[11px] font-semibold hover:bg-[#25D366]/20 hover:border-[#25D366]/60 hover:text-[#25D366] transition-colors"
                  >
                    <WhatsappLogo size={11} /> WhatsApp
                  </a>
                </div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-muted bg-bg-card rounded-2xl border border-border-color">
            <Stethoscope size={36} className="mx-auto mb-3 opacity-40" />
            No doctors match your search.
          </div>
        )}
      </div>

      <DoctorDrawer
        doctor={viewingDoctor}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setViewingDoctor(null); }}
        initialEditMode={initialEditMode}
        onUpdate={(updated, isEdit) => {
          handleSubmit(updated, isEdit);
          if (isEdit) {
            setViewingDoctor(updated);
          } else {
            setViewingDoctor(null);
            setIsDrawerOpen(false);
          }
        }}
        onDelete={() => setDeletingDoctor(viewingDoctor)}
        patientCount={viewingDoctor ? (countsByDoctor[viewingDoctor.id]?.patients || 0) : 0}
        invoiceCount={viewingDoctor ? (countsByDoctor[viewingDoctor.id]?.invoices || 0) : 0}
      />

      <ConfirmDialog
        isOpen={!!deletingDoctor}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={handleDelete}
        title="Remove doctor?"
        description={deletingDoctor ? `${deletingDoctor.name} will be removed. Existing patients & invoices keep the reference but won't be assignable to this doctor anymore.` : ''}
        confirmLabel="Remove"
        variant="danger"
      />
    </AppLayout>
  );
}

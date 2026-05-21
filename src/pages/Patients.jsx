import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PatientTable from '../components/patients/PatientTable';
import PatientDrawer from '../components/patients/PatientDrawer';
import AddPatientModal from '../components/patients/AddPatientModal';
import { mockPatientsList } from '../data/patients';
import { useLocalStorage } from '../lib/useLocalStorage';

const statusOptions = [
  { value: 'All', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const balanceOptions = [
  { value: 'All', label: 'All Balances' },
  { value: 'Has balance', label: 'Has Balance' },
  { value: 'Cleared', label: 'Cleared' },
];

export default function Patients() {
  const [patients, setPatients] = useLocalStorage('patients', mockPatientsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All');

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);

  React.useEffect(() => {
    const oldNumbers = [
      '+91 98765 43210',
      '+91 98765 43211',
      '+91 98765 43212',
      '+91 98765 43213',
      '+91 98765 43214',
      '+91 84870 05334'
    ];
    const needsMigration = patients.some(p => oldNumbers.includes(p.phone));
    if (needsMigration) {
      const migrated = patients.map(p => {
        if (oldNumbers.includes(p.phone)) {
          return { ...p, phone: '9537293756' };
        }
        return p;
      });
      setPatients(migrated);
    }
  }, [patients, setPatients]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'All' ? true : p.status === statusFilter;
      let matchesBalance = true;
      if (balanceFilter === 'Has balance') matchesBalance = p.balance > 0;
      if (balanceFilter === 'Cleared') matchesBalance = p.balance === 0;
      return matchesSearch && matchesStatus && matchesBalance;
    });
  }, [patients, searchQuery, statusFilter, balanceFilter]);

  const openAdd = () => {
    setEditingPatient(null);
    setIsAddModalOpen(true);
  };

  const openEdit = (patient) => {
    setEditingPatient(patient);
    setIsAddModalOpen(true);
    setSelectedPatient(null);
  };

  const handleSubmit = (patient, isEdit) => {
    if (isEdit) {
      setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
    } else {
      setPatients(prev => [patient, ...prev]);
    }
  };

  const handleDelete = () => {
    if (!deletingPatient) return;
    setPatients(prev => prev.filter(p => p.id !== deletingPatient.id));
    toast.success(`${deletingPatient.name} deleted`);
    setSelectedPatient(null);
    setDeletingPatient(null);
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-title"
        >
          <h1 className="text-2xl font-semibold mb-1">Patients</h1>
          <p className="text-text-muted text-sm">{patients.length} patients registered</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={openAdd}
            className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" /> Add Patient
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl shadow-sm flex flex-col"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-border-color flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm flex-1 md:flex-initial">
              <Funnel size={16} className="text-text-muted shrink-0" />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                className="w-full md:w-36"
                size="md"
              />
              <Select
                value={balanceFilter}
                onChange={setBalanceFilter}
                options={balanceOptions}
                className="w-full md:w-40"
                size="md"
              />
            </div>
          </div>
        </div>

        <PatientTable
          patients={filteredPatients}
          onRowClick={setSelectedPatient}
          onEdit={openEdit}
          onDelete={setDeletingPatient}
        />
      </motion.div>

      {selectedPatient && (
        <PatientDrawer
          patient={selectedPatient}
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={() => openEdit(selectedPatient)}
          onDelete={() => setDeletingPatient(selectedPatient)}
          onUpdate={(updated) => {
            setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedPatient(updated);
          }}
        />
      )}

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingPatient(null); }}
        onSubmit={handleSubmit}
        initialPatient={editingPatient}
      />

      <ConfirmDialog
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDelete}
        title="Delete patient record?"
        description={deletingPatient ? `${deletingPatient.name} and all associated treatment history will be permanently removed. This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </AppLayout>
  );
}

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import AppLayout from '../components/layout/AppLayout';
import PatientTable from '../components/patients/PatientTable';
import PatientDrawer from '../components/patients/PatientDrawer';
import AddPatientModal from '../components/patients/AddPatientModal';
import { mockPatientsList } from '../data/patients';

export default function Patients() {
  const [patients, setPatients] = useState(mockPatientsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtering Logic
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Search
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.phone.includes(searchQuery);
      
      // Status
      const matchesStatus = statusFilter === 'All' ? true : p.status === statusFilter;
      
      // Balance
      let matchesBalance = true;
      if (balanceFilter === 'Has balance') matchesBalance = p.balance > 0;
      if (balanceFilter === 'Cleared') matchesBalance = p.balance === 0;

      return matchesSearch && matchesStatus && matchesBalance;
    });
  }, [patients, searchQuery, statusFilter, balanceFilter]);

  const handleAddPatient = (newPatient) => {
    setPatients([newPatient, ...patients]);
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
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-text-main text-white flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
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
            <div className="flex items-center gap-2 text-sm">
              <Funnel size={16} className="text-text-muted" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 bg-bg-card border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              
              <select 
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="h-9 px-3 bg-bg-card border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Balances</option>
                <option value="Has balance">Has Balance</option>
                <option value="Cleared">Cleared</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <PatientTable patients={filteredPatients} onRowClick={setSelectedPatient} />
      </motion.div>

      {/* Patient Drawer Slide-out */}
      {selectedPatient && (
        <PatientDrawer 
          patient={selectedPatient} 
          isOpen={!!selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      )}

      {/* Add Patient Modal */}
      <AddPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddPatient}
      />
    </AppLayout>
  );
}

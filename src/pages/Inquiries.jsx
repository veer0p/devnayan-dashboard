import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MagnifyingGlass,
  Funnel,
  Trash,
  PencilSimple,
  WhatsappLogo,
  Eye,
  CheckCircle,
  X,
  PlusCircle,
  EnvelopeSimple,
  CalendarCheck,
  Note
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getOpenWaConfig, sendWhatsAppMessage } from '../lib/openwa';
import { useClinic } from '../context/ClinicContext';

const statusOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function Inquiries() {
  const { clinic } = useClinic();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deletingInquiry, setDeletingInquiry] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);

  // WhatsApp compose state
  const [whatsAppInquiry, setWhatsAppInquiry] = useState(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [selectedTemplateMsg, setSelectedTemplateMsg] = useState('greeting');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState('pending');
  const [formMessage, setFormMessage] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const config = getOpenWaConfig();

  // Load Inquiries
  const loadInquiries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/inquiries`, {
        headers: {
          'X-API-Key': config.apiKey,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load: status ${response.status}`);
      }
      const data = await response.json();
      setInquiries(data);
      setIsDemoMode(false);
    } catch (e) {
      console.warn('Inquiries API not accessible. Loading from LocalStorage (Demo Mode).', e);
      setIsDemoMode(true);
      const localInquiriesRaw = localStorage.getItem('dentease.local_inquiries') || '[]';
      setInquiries(JSON.parse(localInquiriesRaw));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // Filtered list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.phone.includes(searchQuery) ||
        (inq.email && inq.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inq.message && inq.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'All' ? true : inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Delete inquiry
  const handleDelete = async () => {
    if (!deletingInquiry) return;
    try {
      if (!isDemoMode) {
        const response = await fetch(`${config.apiUrl}/api/inquiries/${deletingInquiry.id}`, {
          method: 'DELETE',
          headers: {
            'X-API-Key': config.apiKey,
          },
        });
        if (!response.ok) throw new Error('API delete error');
      }

      // Local state update
      const updated = inquiries.filter((i) => i.id !== deletingInquiry.id);
      setInquiries(updated);
      if (isDemoMode) {
        localStorage.setItem('dentease.local_inquiries', JSON.stringify(updated));
      }
      toast.success('Inquiry successfully deleted');
    } catch (err) {
      toast.error('Failed to delete inquiry');
    } finally {
      setDeletingInquiry(null);
      setSelectedInquiry(null);
    }
  };

  // Open Form modal
  const openAdd = () => {
    setEditingInquiry(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormStatus('pending');
    setFormMessage('');
    setFormNotes('');
    setIsAddEditModalOpen(true);
  };

  const openEdit = (inq) => {
    setEditingInquiry(inq);
    setFormName(inq.name);
    setFormPhone(inq.phone);
    setFormEmail(inq.email || '');
    setFormStatus(inq.status || 'pending');
    setFormMessage(inq.message || '');
    setFormNotes(inq.notes || '');
    setIsAddEditModalOpen(true);
  };

  // Submit manual creation / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      toast.error('Name and Phone are required');
      return;
    }

    const payload = {
      name: formName,
      phone: formPhone,
      email: formEmail || null,
      status: formStatus,
      message: formMessage || null,
      notes: formNotes || null,
    };

    try {
      if (editingInquiry) {
        // Update
        if (!isDemoMode) {
          const response = await fetch(`${config.apiUrl}/api/inquiries/${editingInquiry.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': config.apiKey,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('API edit error');
          const updatedData = await response.json();
          setInquiries((prev) => prev.map((i) => (i.id === editingInquiry.id ? updatedData : i)));
        } else {
          const updated = inquiries.map((i) =>
            i.id === editingInquiry.id
              ? { ...i, ...payload, updatedAt: new Date().toISOString() }
              : i
          );
          setInquiries(updated);
          localStorage.setItem('dentease.local_inquiries', JSON.stringify(updated));
        }
        toast.success('Inquiry updated successfully');
      } else {
        // Create
        if (!isDemoMode) {
          const response = await fetch(`${config.apiUrl}/api/inquiries`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': config.apiKey,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('API create error');
          const createdData = await response.json();
          setInquiries((prev) => [createdData, ...prev]);
        } else {
          const newInq = {
            id: Math.random().toString(36).substring(2, 9),
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const updated = [newInq, ...inquiries];
          setInquiries(updated);
          localStorage.setItem('dentease.local_inquiries', JSON.stringify(updated));
        }
        toast.success('Inquiry created successfully');
      }
      setIsAddEditModalOpen(false);
      loadInquiries(); // reload to get proper dates/sorting
    } catch (e) {
      toast.error('Failed to save inquiry');
    }
  };

  // Pre-filled WhatsApp templates
  const getWhatsAppMessageBody = (inq) => {
    if (!inq) return '';
    const cleanName = inq.name.split(' ')[0];
    if (selectedTemplateMsg === 'greeting') {
      return `Hello ${cleanName}, thank you for reaching out to ${clinic.name} via our landing page. ${clinic.doctorName} would love to know how we can assist you with your dental needs?`;
    }
    if (selectedTemplateMsg === 'appointment') {
      return `Hi ${cleanName}, we received your inquiry for dental treatment. Would you like to schedule an appointment with ${clinic.doctorName}? Let us know what day and time works best for you.`;
    }
    return customWaMessage;
  };

  // Send WhatsApp message
  const handleSendWhatsApp = async () => {
    if (!whatsAppInquiry) return;
    const body = getWhatsAppMessageBody(whatsAppInquiry);
    try {
      const result = await sendWhatsAppMessage(whatsAppInquiry.phone, body);
      if (result.success) {
        if (result.manual) {
          toast.success('Redirecting to WhatsApp web...');
        } else {
          toast.success('WhatsApp message sent successfully!');
          // Auto-mark as contacted
          await handleUpdateStatus(whatsAppInquiry.id, 'contacted');
        }
      }
      setWhatsAppInquiry(null);
      setCustomWaMessage('');
    } catch (e) {
      toast.error(e.message || 'Failed to send WhatsApp message');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      if (!isDemoMode) {
        await fetch(`${config.apiUrl}/api/inquiries/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }
      const updated = inquiries.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
      setInquiries(updated);
      if (isDemoMode) {
        localStorage.setItem('dentease.local_inquiries', JSON.stringify(updated));
      }
      // If selectedInquiry is currently open in drawer, update it
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-title"
        >
          <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
            Inquiries
            {isDemoMode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider">
                Demo Fallback
              </span>
            )}
          </h1>
          <p className="text-text-muted text-sm">
            {filteredInquiries.length} of {inquiries.length} inquiries loaded
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={openAdd}
            className="h-10 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus size={16} weight="bold" /> Add Inquiry
          </button>
        </motion.div>
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-border-color rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-border-color flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, phone, message..."
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
                className="w-full md:w-40"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs">Fetching inquiries from database...</span>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-20 text-center text-text-muted text-sm font-light">
              No inquiries found matching the selected filters.
            </div>
          ) : (
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-bg-body text-text-muted font-medium border-b border-border-color">
                  <th className="p-4">Date</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Template</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => {
                  const dateStr = new Date(inq.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr
                      key={inq.id}
                      className="border-b border-border-color/60 hover:bg-bg-body/40 transition-colors"
                    >
                      <td className="p-4 font-light text-text-muted">{dateStr}</td>
                      <td className="p-4 font-semibold text-text-main">
                        <div className="flex flex-col">
                          <span>{inq.name}</span>
                          {inq.email && <span className="text-[10px] text-text-muted font-normal">{inq.email}</span>}
                        </div>
                      </td>
                      <td className="p-4 font-light">{inq.phone}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-muted-bg text-text-muted text-[10px] font-bold font-mono">
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inq.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : inq.status === 'contacted'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="p-1.5 hover:bg-bg-body rounded-md text-text-muted hover:text-text-main transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setWhatsAppInquiry(inq)}
                            className="p-1.5 hover:bg-emerald-500/10 rounded-md text-emerald-500 hover:text-emerald-600 transition-all"
                            title="Contact via WhatsApp"
                          >
                            <WhatsappLogo size={16} weight="fill" />
                          </button>
                          <button
                            onClick={() => openEdit(inq)}
                            className="p-1.5 hover:bg-bg-body rounded-md text-text-muted hover:text-text-main transition-all"
                            title="Edit"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingInquiry(inq)}
                            className="p-1.5 hover:bg-destructive/10 rounded-md text-destructive hover:text-destructive-hover transition-all"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Slide Drawer for details */}
      <AnimatePresence>
        {selectedInquiry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInquiry(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-bg-card border-l border-border-color z-50 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-border-color pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-text-main">Inquiry Details</h3>
                  <span className="text-[10px] text-text-muted">
                    ID: {selectedInquiry.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 hover:bg-bg-body rounded-full text-text-muted hover:text-text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                {/* Profile Card */}
                <div className="p-4 rounded-xl bg-bg-body border border-border-color flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
                    {selectedInquiry.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-sm">{selectedInquiry.name}</h4>
                    <p className="text-xs text-text-muted">{selectedInquiry.phone}</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-text-muted font-medium">Submitted At</span>
                    <span className="col-span-2 text-text-main font-light">
                      {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-text-muted font-medium">Email Address</span>
                    <span className="col-span-2 text-text-main font-light break-all">
                      {selectedInquiry.email || 'None Provided'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="col-span-2">
                      <span className="px-1.5 py-0.5 rounded bg-muted-bg text-text-muted font-mono font-bold uppercase text-[9px]">
                        {selectedInquiry.templateId || 'General'}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-text-muted font-medium">Status</span>
                    <span className="col-span-2">
                      <div className="flex gap-1.5">
                        {['pending', 'contacted', 'closed'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(selectedInquiry.id, st)}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border transition-all ${
                              selectedInquiry.status === st
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-transparent border-border-color text-text-muted hover:bg-bg-body'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </span>
                  </div>
                </div>

                {/* Patient Inquiry Message */}
                <div className="space-y-2">
                  <span className="text-xs text-text-muted font-semibold flex items-center gap-1.5">
                    <EnvelopeSimple size={16} />
                    Message Submitted:
                  </span>
                  <div className="p-4 rounded-xl border border-border-color bg-bg-body text-xs text-text-main leading-relaxed italic font-light">
                    {selectedInquiry.message || 'No text message entered.'}
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div className="space-y-2">
                  <span className="text-xs text-text-muted font-semibold flex items-center gap-1.5">
                    <Note size={16} />
                    Internal Admin Notes:
                  </span>
                  <div className="p-4 rounded-xl border border-border-color bg-amber-500/[0.02] text-xs text-text-main leading-relaxed font-light">
                    {selectedInquiry.notes || 'No administrative notes saved. Click Edit to add notes.'}
                  </div>
                </div>
              </div>

              <div className="border-t border-border-color pt-4 mt-6 flex gap-3">
                <button
                  onClick={() => setWhatsAppInquiry(selectedInquiry)}
                  className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <WhatsappLogo size={16} weight="fill" />
                  <span>WhatsApp Patient</span>
                </button>
                <button
                  onClick={() => openEdit(selectedInquiry)}
                  className="px-4 h-10 rounded-xl border border-border-color hover:bg-bg-body text-text-main font-medium text-xs"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEditModalOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg-card border border-border-color rounded-2xl p-6 shadow-2xl z-50"
            >
              <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4">
                <h3 className="text-base font-bold text-text-main">
                  {editingInquiry ? 'Edit Inquiry' : 'Add New Inquiry'}
                </h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1 hover:bg-bg-body rounded-full text-text-muted hover:text-text-main"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Aarav Patel"
                      className="w-full h-9 px-3 bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="9537293756"
                      className="w-full h-9 px-3 bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Email Address</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-9 px-3 bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Status</label>
                  <div className="flex gap-2">
                    {['pending', 'contacted', 'closed'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormStatus(st)}
                        className={`px-3 py-1.5 uppercase font-bold rounded-lg border transition-all ${
                          formStatus === st
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-bg-body border-border-color text-text-muted hover:bg-bg-body/70'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Inquiry Message</label>
                  <textarea
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    rows={2}
                    placeholder="Message submitted by user..."
                    className="w-full p-3 bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Internal Admin Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    placeholder="E.g. Called and scheduled for root canal on next Monday..."
                    className="w-full p-3 bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="border-t border-border-color pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 h-9 rounded-lg border border-border-color text-text-main hover:bg-bg-body"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 h-9 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingInquiry}
        title="Delete Inquiry"
        description={`Are you sure you want to delete ${deletingInquiry?.name}'s inquiry? This action cannot be undone.`}
        onClose={() => setDeletingInquiry(null)}
        onConfirm={handleDelete}
      />

      {/* WhatsApp Quick Reply Modal */}
      <AnimatePresence>
        {whatsAppInquiry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWhatsAppInquiry(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-55"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-card border border-border-color rounded-2xl p-6 shadow-2xl z-55"
            >
              <div className="flex items-center justify-between border-b border-border-color pb-3 mb-4">
                <h3 className="text-base font-bold text-text-main flex items-center gap-1.5">
                  <WhatsappLogo size={18} weight="fill" className="text-emerald-500" />
                  Quick Reply via WhatsApp
                </h3>
                <button
                  onClick={() => setWhatsAppInquiry(null)}
                  className="p-1 hover:bg-bg-body rounded-full text-text-muted hover:text-text-main"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-text-muted">Recipient Name: <span className="font-bold text-text-main">{whatsAppInquiry.name}</span></p>
                  <p className="text-text-muted">Phone Number: <span className="font-bold text-text-main">{whatsAppInquiry.phone}</span></p>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-text-muted">Choose Template:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTemplateMsg('greeting')}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 ${
                        selectedTemplateMsg === 'greeting'
                          ? 'border-emerald-500 bg-emerald-500/[0.03] text-text-main font-semibold'
                          : 'border-border-color text-text-muted hover:bg-bg-body'
                      }`}
                    >
                      <EnvelopeSimple size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Greeting & Follow-up</p>
                        <p className="text-[10px] text-text-muted mt-0.5 leading-snug">Initial hello & support request.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedTemplateMsg('appointment')}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 ${
                        selectedTemplateMsg === 'appointment'
                          ? 'border-emerald-500 bg-emerald-500/[0.03] text-text-main font-semibold'
                          : 'border-border-color text-text-muted hover:bg-bg-body'
                      }`}
                    >
                      <CalendarCheck size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Schedule Slots</p>
                        <p className="text-[10px] text-text-muted mt-0.5 leading-snug">Offer to book an appt slot.</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-text-muted">Message Draft:</span>
                  <div className="p-3 bg-bg-body border border-border-color rounded-lg font-light leading-relaxed italic max-h-[100px] overflow-y-auto">
                    {getWhatsAppMessageBody(whatsAppInquiry)}
                  </div>
                </div>

                <div className="border-t border-border-color pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setWhatsAppInquiry(null)}
                    className="px-4 h-9 rounded-lg border border-border-color text-text-main hover:bg-bg-body"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    className="px-4 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <WhatsappLogo size={16} weight="fill" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

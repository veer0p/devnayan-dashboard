import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DownloadSimple,
  WhatsappLogo,
  Calendar,
  Funnel,
  TrendUp,
  Users,
  ShoppingCart,
  ChatCircleDots,
  Circle,
  FileText,
  User,
  Stethoscope,
  EnvelopeSimple,
  CaretRight,
  Checks,
  Warning,
  Clock,
  CheckCircle,
  X
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import Select from '../components/ui/Select';
import { useLocalStorage } from '../lib/useLocalStorage';
import { mockInvoices } from '../data/billing';
import { mockAppointments } from '../data/appointments';
import { mockPatientsList } from '../data/patients';
import { mockDoctors } from '../data/doctors';
import { sendWhatsAppMedia } from '../lib/openwa';
import { useCaptureInvoice } from '../lib/useCaptureInvoice';
import { useClinic } from '../context/ClinicContext';
import { useTheme } from '../lib/useTheme';

const dateRangeOptions = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'this-year', label: 'This Year' },
  { value: 'all-time', label: 'All Time' },
];

export default function Reports() {
  const { clinic } = useClinic();
  const { theme } = useTheme();
  const [invoices] = useLocalStorage('invoices', mockInvoices);
  const [appointments] = useLocalStorage('appointments', mockAppointments);
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  const [dateRange, setDateRange] = useState('this-month');
  const [selectedDoctorId, setSelectedDoctorId] = useState('All');
  const [activeTab, setActiveTab] = useState('revenue');

  // WhatsApp Send Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [recipientDoctorId, setRecipientDoctorId] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const { capturePdf } = useCaptureInvoice();

  // Populate recipient details when modal opens
  useEffect(() => {
    if (isShareModalOpen) {
      // Default to the first doctor or selected doctor
      const defaultDoc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
      if (defaultDoc) {
        setRecipientDoctorId(defaultDoc.id);
        setCustomPhone(defaultDoc.phone);
      }
    }
  }, [isShareModalOpen, selectedDoctorId, doctors]);

  // Update phone when selected recipient doctor changes
  const handleRecipientChange = (docId) => {
    setRecipientDoctorId(docId);
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      setCustomPhone(doc.phone);
    }
  };

  // Resolve Doctor Filter Options
  const doctorOptions = useMemo(() => {
    return [
      { value: 'All', label: 'All Doctors' },
      ...doctors.map(d => ({ value: d.id, label: d.name }))
    ];
  }, [doctors]);

  // Filter Data helper
  const filteredData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (dateRange === 'last-7-days') {
      startDate.setDate(today.getDate() - 7);
    } else if (dateRange === 'last-30-days') {
      startDate.setDate(today.getDate() - 30);
    } else if (dateRange === 'this-month') {
      startDate.setDate(1); // 1st of current month
    } else if (dateRange === 'this-year') {
      startDate.setMonth(0, 1); // Jan 1st of current year
    } else if (dateRange === 'all-time') {
      startDate = new Date(0); // Beginning of epoch
    }

    // Filter invoices
    const filteredInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      const matchesDate = invDate >= startDate && invDate <= today;
      const matchesDoctor = selectedDoctorId === 'All' || inv.doctorId === selectedDoctorId;
      return matchesDate && matchesDoctor;
    });

    // Filter appointments
    const filteredAppointments = appointments.filter(appt => {
      const apptDate = new Date(appt.start);
      const matchesDate = apptDate >= startDate && apptDate <= today;
      const matchesDoctor = selectedDoctorId === 'All' || appt.doctorId === selectedDoctorId;
      return matchesDate && matchesDoctor;
    });

    // Filter patients (based on registration date or active status in current date range)
    const filteredPatients = patients.filter(pt => {
      const regDate = new Date(pt.registrationDate);
      const matchesDate = regDate >= startDate && regDate <= today;
      const matchesDoctor = selectedDoctorId === 'All' || pt.doctorId === selectedDoctorId;
      return matchesDate && matchesDoctor;
    });

    return {
      invoices: filteredInvoices,
      appointments: filteredAppointments,
      patients: filteredPatients,
      startDate,
      endDate: today,
    };
  }, [dateRange, selectedDoctorId, invoices, appointments, patients]);

  // Financial Stats & Breakdown
  const financialStats = useMemo(() => {
    const invs = filteredData.invoices;
    const totalBilled = invs.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invs.reduce((sum, inv) => sum + inv.paid, 0);
    const outstanding = Math.max(0, totalBilled - totalCollected);

    // Status breakdown
    const statusCounts = { Paid: 0, Partial: 0, Unpaid: 0 };
    invs.forEach(inv => {
      if (statusCounts[inv.status] !== undefined) {
        statusCounts[inv.status]++;
      }
    });

    const statusPieData = [
      { name: 'Paid', value: statusCounts.Paid, color: '#10B981' },
      { name: 'Partial', value: statusCounts.Partial, color: '#F59E0B' },
      { name: 'Unpaid', value: statusCounts.Unpaid, color: '#EF4444' },
    ].filter(d => d.value > 0);

    // Treatment breakdown by revenue
    const treatmentRev = {};
    invs.forEach(inv => {
      treatmentRev[inv.treatment] = (treatmentRev[inv.treatment] || 0) + inv.amount;
    });
    const treatmentChartData = Object.entries(treatmentRev)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Trend calculation
    // Group invoices by date (daily or monthly depending on range)
    const trendMap = {};
    invs.forEach(inv => {
      const dateKey = new Date(inv.date).toLocaleDateString('en-GB', {
        day: dateRange === 'last-7-days' || dateRange === 'this-month' ? 'numeric' : undefined,
        month: 'short',
        year: dateRange === 'this-year' || dateRange === 'all-time' ? '2-digit' : undefined,
      });
      if (!trendMap[dateKey]) trendMap[dateKey] = { date: dateKey, revenue: 0, collected: 0 };
      trendMap[dateKey].revenue += inv.amount;
      trendMap[dateKey].collected += inv.paid;
    });

    const trendData = Object.values(trendMap);

    return {
      totalBilled,
      totalCollected,
      outstanding,
      statusPieData,
      treatmentChartData,
      trendData,
    };
  }, [filteredData.invoices, dateRange]);

  // Appointment Stats & Breakdown
  const appointmentStats = useMemo(() => {
    const appts = filteredData.appointments;
    const totalAppts = appts.length;

    // Status breakdown
    const statusCounts = {};
    appts.forEach(appt => {
      statusCounts[appt.status] = (statusCounts[appt.status] || 0) + 1;
    });
    const statusPieData = Object.entries(statusCounts).map(([name, value]) => {
      let color = '#C8902B';
      if (name === 'Completed') color = '#10B981';
      if (name === 'Confirmed') color = '#3B82F6';
      if (name === 'Pending') color = '#F59E0B';
      if (name === 'Cancelled') color = '#EF4444';
      return { name, value, color };
    });

    // Doctor patient load
    const docLoad = {};
    appts.forEach(appt => {
      const doc = doctors.find(d => d.id === appt.doctorId);
      const docName = doc ? doc.name : 'Unknown Doctor';
      docLoad[docName] = (docLoad[docName] || 0) + 1;
    });
    const doctorLoadData = Object.entries(docLoad).map(([name, appointments]) => ({ name, appointments }));

    // Treatment popularity
    const treatmentCounts = {};
    appts.forEach(appt => {
      treatmentCounts[appt.treatmentName] = (treatmentCounts[appt.treatmentName] || 0) + 1;
    });
    const treatmentApptData = Object.entries(treatmentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalAppts,
      statusPieData,
      doctorLoadData,
      treatmentApptData,
    };
  }, [filteredData.appointments, doctors]);

  // Patient Growth & Demographics Stats
  const patientStats = useMemo(() => {
    const pts = filteredData.patients;
    const totalPatients = pts.length;

    // Gender breakdown
    const genderCounts = { Male: 0, Female: 0, Other: 0 };
    pts.forEach(p => {
      if (p.gender && genderCounts[p.gender] !== undefined) {
        genderCounts[p.gender]++;
      }
    });
    const genderPieData = [
      { name: 'Male', value: genderCounts.Male, color: '#3B82F6' },
      { name: 'Female', value: genderCounts.Female, color: '#EC4899' },
      { name: 'Other', value: genderCounts.Other, color: '#8B5CF6' },
    ].filter(d => d.value > 0);

    // Age breakdown
    const ageGroups = { 'Under 18': 0, '18-35': 0, '36-50': 0, '50+': 0 };
    pts.forEach(p => {
      if (p.age < 18) ageGroups['Under 18']++;
      else if (p.age <= 35) ageGroups['18-35']++;
      else if (p.age <= 50) ageGroups['36-50']++;
      else ageGroups['50+']++;
    });
    const ageChartData = Object.entries(ageGroups).map(([name, count]) => ({ name, count }));

    // Growth trend over time (based on registration date)
    const growthMap = {};
    pts.forEach(p => {
      const dateKey = new Date(p.registrationDate).toLocaleDateString('en-GB', {
        month: 'short',
        year: dateRange === 'this-year' || dateRange === 'all-time' ? '2-digit' : undefined,
      });
      growthMap[dateKey] = (growthMap[dateKey] || 0) + 1;
    });
    const growthTrendData = Object.entries(growthMap).map(([date, newPatients]) => ({ date, newPatients }));

    return {
      totalPatients,
      genderPieData,
      ageChartData,
      growthTrendData,
    };
  }, [filteredData.patients, dateRange]);

  // Set default custom message when date range or selected doctor changes
  useEffect(() => {
    const docText = selectedDoctorId === 'All' ? 'all doctors' : doctors.find(d => d.id === selectedDoctorId)?.name || 'doctor';
    const rangeText = dateRangeOptions.find(o => o.value === dateRange)?.label || 'specified period';
    setCustomMessage(
      `Hello Doctor,\n\nPlease find attached the clinical performance report for ${clinic.name}.\n\n` +
      `Summary for ${docText} (${rangeText}):\n` +
      `- Total Revenue: Rs. ${financialStats.totalBilled.toLocaleString()}\n` +
      `- Collections: Rs. ${financialStats.totalCollected.toLocaleString()}\n` +
      `- Outstanding: Rs. ${financialStats.outstanding.toLocaleString()}\n` +
      `- Appointments: ${appointmentStats.totalAppts}\n\n` +
      `Regards,\n${clinic.name}`
    );
  }, [dateRange, selectedDoctorId, clinic.name, financialStats, appointmentStats, doctors]);

  // Export PDF Handler
  const handleExportPdf = async () => {
    const toastId = toast.loading('Generating report PDF…');
    try {
      setIsCapturing(true);
      await new Promise(r => setTimeout(r, 400)); // Paint DOM

      const pdfDataUrl = await capturePdf('reports-pdf-capture');
      setIsCapturing(false);

      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `Clinical_Report_${dateRange}_${selectedDoctorId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report PDF downloaded successfully!', { id: toastId });
    } catch (err) {
      setIsCapturing(false);
      toast.error(err.message || 'Failed to generate PDF', { id: toastId });
    }
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = async (e) => {
    e.preventDefault();
    if (!customPhone) {
      toast.error('Please enter a recipient phone number.');
      return;
    }

    const toastId = toast.loading('Generating report PDF and initiating WhatsApp send…');
    setIsShareModalOpen(false);

    try {
      setIsCapturing(true);
      await new Promise(r => setTimeout(r, 400)); // Paint DOM

      const pdfDataUrl = await capturePdf('reports-pdf-capture');
      setIsCapturing(false);

      const res = await sendWhatsAppMedia(customPhone, {
        base64: pdfDataUrl,
        mimetype: 'application/pdf',
        filename: `clinical-report-${dateRange}.pdf`,
        caption: customMessage,
      });

      if (res.success) {
        if (res.manual) {
          toast.success('Report PDF downloaded and WhatsApp web link opened!', { id: toastId });
        } else {
          toast.success('Report PDF sent to doctor via WhatsApp successfully!', { id: toastId });
        }
      }
    } catch (err) {
      setIsCapturing(false);
      toast.error(err.message || 'Failed to share report PDF.', { id: toastId });
    }
  };

  // Chart styling based on theme
  const chartStyles = useMemo(() => {
    const isDark = theme === 'dark' || !theme;
    return {
      gridColor: isDark ? '#252e42' : '#e4e7ec',
      textColor: isDark ? '#9CA3AF' : '#64748b',
      tooltipBg: isDark ? '#111827' : '#ffffff',
      tooltipBorder: isDark ? '#252e42' : '#e4e7ec',
      tooltipText: isDark ? '#F9FAFB' : '#0f172a',
    };
  }, [theme]);

  const activeDoctorName = useMemo(() => {
    if (selectedDoctorId === 'All') return 'All Doctors';
    return doctors.find(d => d.id === selectedDoctorId)?.name || 'Selected Doctor';
  }, [selectedDoctorId, doctors]);

  const activeRangeName = useMemo(() => {
    return dateRangeOptions.find(o => o.value === dateRange)?.label || 'This Month';
  }, [dateRange]);

  return (
    <AppLayout>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">Reports</h1>
          <p className="text-text-muted text-sm">Interactive analytics and clinical summaries</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <button
            onClick={handleExportPdf}
            className="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-border-color bg-bg-card hover:bg-bg-body text-text-main flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <DownloadSimple size={16} weight="bold" /> Export PDF
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm"
          >
            <WhatsappLogo size={18} weight="fill" /> Share Report
          </button>
        </motion.div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-card border border-border-color rounded-2xl p-4 mb-6 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} /> Date Range
          </label>
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={dateRangeOptions}
            size="md"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Funnel size={13} /> Doctor Filter
          </label>
          <Select
            value={selectedDoctorId}
            onChange={setSelectedDoctorId}
            options={doctorOptions}
            size="md"
            className="w-full"
          />
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden mb-6">
        <div className="bg-bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-semibold flex items-center gap-1.5">
            <ShoppingCart size={13} className="text-primary" /> Total Revenue
          </div>
          <div className="mt-2 text-[24px] leading-none font-semibold tracking-tight text-primary">
            ₹{financialStats.totalBilled.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-2">Billed in selected range</div>
        </div>

        <div className="bg-bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-semibold flex items-center gap-1.5">
            <Checks size={13} className="text-emerald-500" /> Collected
          </div>
          <div className="mt-2 text-[24px] leading-none font-semibold tracking-tight text-emerald-500">
            ₹{financialStats.totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-2">
            {financialStats.totalBilled > 0
              ? `${Math.round((financialStats.totalCollected / financialStats.totalBilled) * 100)}% of total billed`
              : '0% collection rate'}
          </div>
        </div>

        <div className="bg-bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-semibold flex items-center gap-1.5">
            <Warning size={13} className="text-rose-500" /> Outstanding
          </div>
          <div className="mt-2 text-[24px] leading-none font-semibold tracking-tight text-rose-500">
            ₹{financialStats.outstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-muted mt-2">Pending payment balances</div>
        </div>

        <div className="bg-bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-semibold flex items-center gap-1.5">
            <ChatCircleDots size={13} className="text-blue-500" /> Appointments
          </div>
          <div className="mt-2 text-[24px] leading-none font-semibold tracking-tight text-text-main">
            {appointmentStats.totalAppts}
          </div>
          <div className="text-[11px] text-text-muted mt-2">Scheduled visits</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-color mb-6 gap-6">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'revenue' ? 'text-primary' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Revenue & Billing
          {activeTab === 'revenue' && (
            <motion.div layoutId="activeReportTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'appointments' ? 'text-primary' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Appointments & Load
          {activeTab === 'appointments' && (
            <motion.div layoutId="activeReportTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'patients' ? 'text-primary' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Patients & Growth
          {activeTab === 'patients' && (
            <motion.div layoutId="activeReportTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Billing & Collection Trend */}
                <div className="bg-bg-card border border-border-color rounded-2xl p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold mb-4 text-text-main">Billing & Collections Trend</h3>
                  <div className="h-72 w-full">
                    {financialStats.trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialStats.trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} vertical={false} />
                          <XAxis dataKey="date" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <YAxis stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: chartStyles.tooltipText, fontWeight: 'bold' }}
                            itemStyle={{ fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Bar dataKey="revenue" name="Total Billed (₹)" fill="#C8902B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="collected" name="Collected (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        No financial data for the selected range.
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Status Breakdown */}
                <div className="bg-bg-card border border-border-color rounded-2xl p-5 flex flex-col">
                  <h3 className="text-sm font-semibold mb-4 text-text-main">Invoice Status Breakdown</h3>
                  <div className="h-48 w-full relative flex-1">
                    {financialStats.statusPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financialStats.statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {financialStats.statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        No invoices.
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    {financialStats.statusPieData.map(d => (
                      <div key={d.name} className="p-2 bg-bg-body rounded-lg border border-border-color">
                        <div className="text-[10px] text-text-muted font-medium mb-0.5">{d.name}</div>
                        <div className="text-sm font-semibold" style={{ color: d.color }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatment Revenue Table/Breakdown */}
              <div className="bg-bg-card border border-border-color rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 text-text-main">Revenue by Treatment Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="h-64 w-full">
                    {financialStats.treatmentChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialStats.treatmentChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} horizontal={false} />
                          <XAxis type="number" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <YAxis dataKey="name" type="category" stroke={chartStyles.textColor} fontSize={10} width={110} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                          <Bar dataKey="value" name="Revenue (₹)" fill="#C8902B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        No treatments recorded.
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Top Revenue Sources</h4>
                    <div className="divide-y divide-border-color max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                      {financialStats.treatmentChartData.map((item, idx) => (
                        <div key={item.name} className="py-2.5 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-text-main truncate font-medium">{item.name}</span>
                          </div>
                          <span className="font-semibold text-text-main tabular-nums">₹{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                      {financialStats.treatmentChartData.length === 0 && (
                        <div className="py-8 text-center text-text-muted text-sm">No treatment revenues.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doctor Patient Load */}
                <div className="bg-bg-card border border-border-color rounded-2xl p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold mb-4 text-text-main">Doctor Load (Appointments Count)</h3>
                  <div className="h-72 w-full">
                    {appointmentStats.doctorLoadData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={appointmentStats.doctorLoadData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} vertical={false} />
                          <XAxis dataKey="name" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <YAxis stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                          <Bar dataKey="appointments" name="Appointments" fill="#C8902B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        No appointments found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Status Breakdown */}
                <div className="bg-bg-card border border-border-color rounded-2xl p-5 flex flex-col">
                  <h3 className="text-sm font-semibold mb-4 text-text-main">Appointment Status Breakdown</h3>
                  <div className="h-48 w-full relative flex-1 flex items-center justify-center">
                    {appointmentStats.statusPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentStats.statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {appointmentStats.statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-text-muted text-sm">No scheduled visits.</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                    {appointmentStats.statusPieData.map(d => (
                      <div key={d.name} className="p-2 bg-bg-body rounded-lg border border-border-color">
                        <div className="text-[10px] text-text-muted font-medium mb-0.5">{d.name}</div>
                        <div className="text-sm font-semibold" style={{ color: d.color }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatment Appts Table */}
              <div className="bg-bg-card border border-border-color rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 text-text-main">Treatment Popularity (Appointment Count)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="h-64 w-full">
                    {appointmentStats.treatmentApptData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={appointmentStats.treatmentApptData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} horizontal={false} />
                          <XAxis type="number" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <YAxis dataKey="name" type="category" stroke={chartStyles.textColor} fontSize={10} width={110} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                          <Bar dataKey="count" name="Appointments Count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        No appointments recorded.
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Top Appointment Categories</h4>
                    <div className="divide-y divide-border-color max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                      {appointmentStats.treatmentApptData.map((item, idx) => (
                        <div key={item.name} className="py-2.5 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-text-main truncate font-medium">{item.name}</span>
                          </div>
                          <span className="font-semibold text-text-main">{item.count} appts</span>
                        </div>
                      ))}
                      {appointmentStats.treatmentApptData.length === 0 && (
                        <div className="py-8 text-center text-text-muted text-sm">No treatments recorded.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Registrations growth */}
                <div className="bg-bg-card border border-border-color rounded-2xl p-5 lg:col-span-2">
                  <h3 className="text-sm font-semibold mb-4 text-text-main">New Patient Registrations</h3>
                  <div className="h-72 w-full">
                    {patientStats.growthTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={patientStats.growthTrendData}>
                          <defs>
                            <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C8902B" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#C8902B" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} vertical={false} />
                          <XAxis dataKey="date" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <YAxis stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                          <Area type="monotone" dataKey="newPatients" name="New Patients" stroke="#C8902B" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        No patient registrations in this period.
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Gender Breakdown */}
                <div className="bg-bg-card border border-border-color rounded-2xl p-5 flex flex-col">
                  <h3 className="text-sm font-semibold mb-4 text-text-main">Patient Gender Demographics</h3>
                  <div className="h-48 w-full relative flex-1 flex items-center justify-center">
                    {patientStats.genderPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={patientStats.genderPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {patientStats.genderPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: chartStyles.tooltipBg,
                              borderColor: chartStyles.tooltipBorder,
                              borderRadius: '8px',
                            }}
                            itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-text-muted text-sm">No demographics data.</div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    {patientStats.genderPieData.map(d => (
                      <div key={d.name} className="p-2 bg-bg-body rounded-lg border border-border-color">
                        <div className="text-[10px] text-text-muted font-medium mb-0.5">{d.name}</div>
                        <div className="text-sm font-semibold" style={{ color: d.color }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age Group Breakdown */}
              <div className="bg-bg-card border border-border-color rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-4 text-text-main">Age Group Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patientStats.ageChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} vertical={false} />
                      <XAxis dataKey="name" stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                      <YAxis stroke={chartStyles.textColor} fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: chartStyles.tooltipBg,
                          borderColor: chartStyles.tooltipBorder,
                          borderRadius: '8px',
                        }}
                        itemStyle={{ fontSize: '12px', color: chartStyles.tooltipText }}
                      />
                      <Bar dataKey="count" name="Patients Count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Share Report to Doctor Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border-color rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-border-color bg-bg-body">
                <div>
                  <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                    <WhatsappLogo size={20} weight="fill" className="text-[#25D366]" /> Share Clinical Report
                  </h3>
                  <p className="text-xs text-text-muted mt-1">Send a compiled PDF summary directly to a doctor</p>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-border-color/40 text-text-muted flex items-center justify-center transition-colors"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <form onSubmit={handleWhatsAppShare} className="p-5 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                    Select Doctor
                  </label>
                  <select
                    value={recipientDoctorId}
                    onChange={e => handleRecipientChange(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary transition-all text-text-main"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 99135 20707"
                    value={customPhone}
                    onChange={e => setCustomPhone(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary transition-all text-text-main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                    Custom Caption Message
                  </label>
                  <textarea
                    rows={6}
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    className="w-full p-3 text-sm bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary transition-all text-text-main resize-none font-sans"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-color">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-border-color bg-bg-body text-text-muted hover:text-text-main text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    <WhatsappLogo size={18} weight="fill" /> Send Report PDF
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden high-fidelity layout optimized for A4 PDF Capture */}
      {(isCapturing || true) && (
        <div style={{ position: 'fixed', top: -9999, left: -9999, width: 595, pointerEvents: 'none' }}>
          <div id="reports-pdf-capture" style={{ background: '#fff', padding: '35px 40px', fontFamily: 'Arial, sans-serif', color: '#1f2937' }}>
            {/* Header Letterhead */}
            <div style={{ borderBottom: '2px solid #C8902B', paddingBottom: 15, marginBottom: 25, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#C8902B' }}>{clinic.name}</div>
                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>Advance Dental Hospital & Research Centre</div>
                <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>{clinic.address || 'Bardoli, Gujarat, India'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#1f2937' }}>Clinical Performance Report</div>
                <div style={{ fontSize: 9, color: '#4b5563', marginTop: 3 }}>Period: {activeRangeName}</div>
                <div style={{ fontSize: 9, color: '#6b7280', marginTop: 1 }}>Doctor: {activeDoctorName}</div>
              </div>
            </div>

            {/* Overview Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, marginBottom: 25 }}>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 8 }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Total Billed</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#C8902B', marginTop: 5 }}>Rs. {financialStats.totalBilled.toLocaleString()}</div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 8 }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Total Collected</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981', marginTop: 5 }}>Rs. {financialStats.totalCollected.toLocaleString()}</div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 8 }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Outstanding</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#EF4444', marginTop: 5 }}>Rs. {financialStats.outstanding.toLocaleString()}</div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 8 }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Total Visits</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginTop: 5 }}>{appointmentStats.totalAppts}</div>
              </div>
            </div>

            {/* Detailed tables for PDF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 25 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#C8902B', borderBottom: '1px solid #e5e7eb', paddingBottom: 5, marginBottom: 10 }}>Revenue by Treatment</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb' }}>Treatment</th>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialStats.treatmentChartData.map(item => (
                      <tr key={item.name}>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', color: '#374151' }}>{item.name}</td>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>Rs. {item.value.toLocaleString()}</td>
                      </tr>
                    ))}
                    {financialStats.treatmentChartData.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ padding: 12, textAlign: 'center', color: '#9ca3af' }}>No treatments recorded in this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#C8902B', borderBottom: '1px solid #e5e7eb', paddingBottom: 5, marginBottom: 10 }}>Appointments by Status</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb' }}>Status</th>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentStats.statusPieData.map(item => (
                      <tr key={item.name}>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', color: '#374151' }}>{item.name}</td>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{item.value}</td>
                      </tr>
                    ))}
                    {appointmentStats.statusPieData.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ padding: 12, textAlign: 'center', color: '#9ca3af' }}>No appointments recorded in this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#C8902B', borderBottom: '1px solid #e5e7eb', paddingBottom: 5, marginBottom: 10, marginTop: 15 }}>Doctor Roster Load</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb' }}>Doctor</th>
                      <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right' }}>Appointments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentStats.doctorLoadData.map(item => (
                      <tr key={item.name}>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', color: '#374151' }}>{item.name}</td>
                        <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{item.appointments}</td>
                      </tr>
                    ))}
                    {appointmentStats.doctorLoadData.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ padding: 12, textAlign: 'center', color: '#9ca3af' }}>No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patients Outstanding balances section */}
            <div style={{ marginBottom: 25 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#C8902B', borderBottom: '1px solid #e5e7eb', paddingBottom: 5, marginBottom: 10 }}>Outstanding Ledger List</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', border: '1px solid #e5e7eb' }}>Patient</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #e5e7eb' }}>Phone</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #e5e7eb', textAlign: 'right' }}>Billed Amount</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #e5e7eb', textAlign: 'right' }}>Paid Amount</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #e5e7eb', textAlign: 'right' }}>Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.invoices.filter(inv => inv.status !== 'Paid').slice(0, 10).map(inv => {
                    const balance = Math.max(0, inv.amount - inv.paid);
                    const patientObj = patients.find(p => p.id === inv.patientId);
                    return (
                      <tr key={inv.id}>
                        <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', color: '#111827', fontWeight: 500 }}>{inv.patient}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', color: '#4b5563' }}>{patientObj?.phone || 'N/A'}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#4b5563' }}>Rs. {inv.amount.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#10B981' }}>Rs. {inv.paid.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>Rs. {balance.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {filteredData.invoices.filter(inv => inv.status !== 'Paid').length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 12, textAlign: 'center', color: '#10B981', fontWeight: 600 }}>All invoices are fully paid! Clean ledger sheet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signatures and Footer */}
            <div style={{ marginTop: 40, paddingTop: 15, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af' }}>
              <div>
                Report generated on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ textAlign: 'right', fontStyle: 'italic' }}>
                Computer generated clinical dashboard summary · {clinic.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

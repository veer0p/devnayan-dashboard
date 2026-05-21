import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  UserPlus,
  Wallet,
  Stethoscope,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CaretRight,
} from '@phosphor-icons/react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import CountUp from '../components/ui/CountUp';
import { StatusDot } from '../components/ui/StatusBadge';
import { useLocalStorage } from '../lib/useLocalStorage';
import { mockPatientsList } from '../data/patients';
import { mockInvoices } from '../data/billing';
import { mockInventory } from '../data/inventory';
import { mockAppointments } from '../data/appointments';
import { mockDoctors } from '../data/doctors';
import { useClinic } from '../context/ClinicContext';

const sameDay = (a, b) => {
  const { clinic } = useClinic();
  const da = a instanceof Date ? a : new Date(a);
  const db = b instanceof Date ? b : new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const monthKey = (date) => {
  const { clinic } = useClinic();
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key) => {
  const { clinic } = useClinic();
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};

const daysAgo = (date) => {
  const { clinic } = useClinic();
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

// Delta indicator — small arrow + percent, monochrome by default.
const Delta = ({ value, label }) => {
  const { clinic } = useClinic();
  if (value == null) return null;
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
      {positive ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
      {Math.abs(value)}%
      {label && <span className="text-text-muted/70 font-normal ml-1">{label}</span>}
    </span>
  );
};

export default function Dashboard() {
  const { clinic } = useClinic();
  const navigate = useNavigate();
  const [patients] = useLocalStorage('patients', mockPatientsList);
  const [invoices] = useLocalStorage('invoices', mockInvoices);
  const [inventory] = useLocalStorage('inventory', mockInventory);
  const [appointments] = useLocalStorage('appointments', mockAppointments);
  const [doctors] = useLocalStorage('doctors', mockDoctors);

  const today = new Date();

  const stats = useMemo(() => {
    const todaysAppointments = appointments.filter(a => sameDay(new Date(a.start), today));
    const todaysRevenue = invoices
      .filter(i => sameDay(new Date(i.date), today))
      .reduce((s, i) => s + i.paid, 0);
    const newPatients = patients.filter(p => daysAgo(p.registrationDate) <= 30).length;
    const lowStock = inventory.filter(i => i.stock <= i.minStock).length;
    return { todaysAppointments, todaysRevenue, newPatients, lowStock };
  }, [appointments, invoices, patients, inventory, today]);

  const monthlyRevenue = useMemo(() => {
    const buckets = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      buckets[monthKey(d)] = { key: monthKey(d), label: monthLabel(monthKey(d)), revenue: 0, paid: 0, count: 0 };
    }
    invoices.forEach(inv => {
      const k = monthKey(inv.date);
      if (buckets[k]) {
        buckets[k].revenue += inv.amount;
        buckets[k].paid += inv.paid;
        buckets[k].count += 1;
      }
    });
    return Object.values(buckets);
  }, [invoices, today]);

  const monthDelta = useMemo(() => {
    if (monthlyRevenue.length < 2) return null;
    const last = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const prev = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (!prev) return null;
    return Math.round(((last - prev) / prev) * 100);
  }, [monthlyRevenue]);

  const totals = useMemo(() => {
    const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
    const collected = invoices.reduce((s, i) => s + i.paid, 0);
    const outstanding = totalRevenue - collected;
    return {
      totalRevenue,
      collected,
      outstanding,
      collectedPct: totalRevenue ? Math.round((collected / totalRevenue) * 100) : 0,
    };
  }, [invoices]);

  // Today's schedule, sorted by start time
  const todaysScheduleSorted = useMemo(
    () => [...stats.todaysAppointments].sort((a, b) => new Date(a.start) - new Date(b.start)),
    [stats.todaysAppointments]
  );

  const topTreatments = useMemo(() => {
    const map = {};
    invoices.forEach(inv => {
      if (!map[inv.treatment]) map[inv.treatment] = { name: inv.treatment, count: 0, revenue: 0 };
      map[inv.treatment].count += 1;
      map[inv.treatment].revenue += inv.amount;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [invoices]);

  const outstandingPatients = useMemo(() => {
    const map = {};
    invoices.forEach(inv => {
      const balance = inv.amount - inv.paid;
      if (balance <= 0) return;
      if (!map[inv.patientId]) {
        const patient = patients.find(p => p.id === inv.patientId);
        map[inv.patientId] = {
          id: inv.patientId,
          name: inv.patient,
          phone: patient?.phone,
          balance: 0,
          invoiceCount: 0,
        };
      }
      map[inv.patientId].balance += balance;
      map[inv.patientId].invoiceCount += 1;
    });
    return Object.values(map).sort((a, b) => b.balance - a.balance).slice(0, 5);
  }, [invoices, patients]);

  const doctorPerformance = useMemo(() => {
    return doctors.map(d => {
      const docInvoices = invoices.filter(i => i.doctorId === d.id);
      const revenue = docInvoices.reduce((s, i) => s + i.paid, 0);
      const patientCount = patients.filter(p => p.doctorId === d.id).length;
      return { id: d.id, name: d.name, initials: d.initials, revenue, patientCount, invoiceCount: docInvoices.length };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [doctors, invoices, patients]);

  const recentActivity = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [invoices]);

  // One contextual notice (not a card grid of insights) — quietly surfaced.
  const notice = useMemo(() => {
    const overduePatients = patients.filter(p => p.status === 'Active' && daysAgo(p.lastVisit) > 180);
    if (overduePatients.length > 0) {
      return {
        text: `${overduePatients.length} active patient${overduePatients.length > 1 ? 's' : ''} haven't visited in 6+ months.`,
        cta: 'Review',
        path: '/patients',
      };
    }
    if (stats.lowStock > 0) {
      return {
        text: `${stats.lowStock} inventory item${stats.lowStock > 1 ? 's are' : ' is'} below minimum stock.`,
        cta: 'Review',
        path: '/inventory',
      };
    }
    if (totals.outstanding > 0) {
      return {
        text: `₹${totals.outstanding.toLocaleString()} outstanding across ${outstandingPatients.length} patient${outstandingPatients.length > 1 ? 's' : ''}.`,
        cta: 'Collect',
        path: '/billing',
      };
    }
    return null;
  }, [patients, stats.lowStock, totals.outstanding, outstandingPatients.length]);

  const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  const kpis = [
    {
      label: "Today's appointments",
      value: stats.todaysAppointments.length,
      sub: stats.todaysAppointments.filter(a => a.status === 'Confirmed').length === stats.todaysAppointments.length
        ? 'all confirmed'
        : `${stats.todaysAppointments.filter(a => a.status === 'Confirmed').length} confirmed`,
    },
    {
      label: "Today's revenue",
      value: stats.todaysRevenue,
      prefix: '₹',
      accent: true,
      sub: stats.todaysRevenue > 0 ? 'collected today' : 'no payments yet',
    },
    {
      label: 'New patients (30d)',
      value: stats.newPatients,
      sub: 'last 30 days',
    },
    {
      label: 'Low stock',
      value: stats.lowStock,
      sub: stats.lowStock > 0 ? 'needs reorder' : 'all good',
      onClick: () => navigate('/inventory'),
    },
  ];

  const quickActions = [
    { label: 'Book appointment', icon: <CalendarPlus size={16} />, path: '/appointments' },
    { label: 'Add patient', icon: <UserPlus size={16} />, path: '/patients' },
    { label: 'New invoice', icon: <Wallet size={16} />, path: '/billing' },
    { label: 'Manage doctors', icon: <Stethoscope size={16} />, path: '/doctors' },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-text-main">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, {clinic.doctorName.split(" ")[0] + " " + clinic.doctorName.split(" ")[1]}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {quickActions.map(q => (
            <button
              key={q.label}
              onClick={() => navigate(q.path)}
              className="h-9 px-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 transition-colors flex items-center gap-2 text-[13px] font-medium text-text-main shadow-sm group"
            >
              <span className="text-primary/80 group-hover:text-primary transition-colors">{q.icon}</span>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notice strip (single, contextual, muted) */}
      {notice && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border-color bg-bg-card"
        >
          <div className="flex items-center gap-2.5 text-sm text-text-main">
            <span className="w-1 h-4 rounded-full bg-primary/70" />
            {notice.text}
          </div>
          <button
            onClick={() => navigate(notice.path)}
            className="h-8 px-3 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 text-[12px] font-semibold text-primary flex items-center gap-1 transition-colors"
          >
            {notice.cta}
            <CaretRight size={12} />
          </button>
        </motion.div>
      )}

      {/* KPI row */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-color rounded-xl border border-border-color overflow-hidden mb-6"
      >
        {kpis.map((k, i) => (
          <motion.button
            key={k.label}
            variants={fadeIn}
            onClick={k.onClick}
            disabled={!k.onClick}
            className={`relative bg-bg-card p-5 text-left transition-colors group ${k.onClick ? 'hover:bg-bg-body cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-start justify-between">
              <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">{k.label}</div>
              {k.onClick && (
                <CaretRight size={12} className="text-text-muted/60 group-hover:text-text-main transition-colors" />
              )}
            </div>
            <div className={`mt-2 text-[28px] leading-none font-semibold tracking-tight ${k.accent ? 'text-primary' : 'text-text-main'}`}>
              <CountUp value={k.value} prefix={k.prefix || ''} />
            </div>
            {k.sub && <div className="text-[11px] text-text-muted mt-2">{k.sub}</div>}
          </motion.button>
        ))}
      </motion.div>

      {/* Two-column main */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart — 2/3 width */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="xl:col-span-2 bg-bg-card border border-border-color rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Revenue · last 12 months</div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[26px] font-semibold tracking-tight text-text-main">
                  <CountUp value={totals.totalRevenue} prefix="₹" />
                </span>
                {monthDelta != null && <Delta value={monthDelta} label="MoM" />}
              </div>
              <div className="mt-1 text-[12px] text-text-muted">
                <span className="text-text-main font-medium">₹{totals.collected.toLocaleString()}</span> collected · {totals.collectedPct}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Outstanding</div>
              <div className="mt-1.5 text-[20px] font-semibold tracking-tight text-text-main">₹{totals.outstanding.toLocaleString()}</div>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 0, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8902B" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#C8902B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border-color)', strokeWidth: 1 }}
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-color)',
                    borderRadius: 8,
                    fontSize: 12,
                    padding: '8px 10px',
                    color: 'var(--color-text-main)',
                  }}
                  labelStyle={{ color: 'var(--color-text-muted)', marginBottom: 4 }}
                  itemStyle={{ color: 'var(--color-text-main)' }}
                  formatter={(v, name) => [`₹${Number(v).toLocaleString()}`, name === 'revenue' ? 'Billed' : 'Collected']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C8902B"
                  strokeWidth={1.5}
                  fill="url(#revFill)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0, fill: '#C8902B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Today's schedule — 1/3 width */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-bg-card border border-border-color rounded-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Today's schedule</div>
            <button
              onClick={() => navigate('/appointments')}
              className="h-7 px-2 rounded-md border border-border-color bg-bg-body hover:bg-bg-card hover:border-text-muted/50 text-[11px] font-semibold text-text-main flex items-center gap-1 transition-colors"
            >
              Open <CaretRight size={10} />
            </button>
          </div>
          <div className="flex-1 -mx-2">
            {todaysScheduleSorted.length === 0 ? (
              <div className="text-sm text-text-muted py-10 text-center">No appointments today.</div>
            ) : (
              todaysScheduleSorted.slice(0, 6).map((a, idx) => {
                const start = new Date(a.start);
                const doctor = doctors.find(d => d.id === a.doctorId);
                return (
                  <button
                    key={a.id}
                    onClick={() => navigate('/appointments')}
                    className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-bg-body rounded-md transition-colors text-left group"
                  >
                    <div className="text-[11px] font-mono text-text-muted w-14 shrink-0">
                      {format(start, 'h:mm a')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text-main truncate">{a.patientName}</div>
                      <div className="text-[11px] text-text-muted truncate">
                        {a.treatmentName}{doctor ? ` · ${doctor.initials}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusDot status={a.status} />
                      <span className="text-[10px] text-text-muted">{a.status}</span>
                    </div>
                    <CaretRight size={12} className="text-text-muted/60 group-hover:text-text-main transition-colors shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Three-column secondary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top treatments */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-bg-card border border-border-color rounded-xl p-6"
        >
          <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium mb-4">Top treatments</div>
          <div className="space-y-3.5">
            {topTreatments.length === 0 && (
              <div className="text-sm text-text-muted py-4">No invoices yet.</div>
            )}
            {topTreatments.map((t, idx) => {
              const max = topTreatments[0]?.revenue || 1;
              const pct = (t.revenue / max) * 100;
              const palette = ['#C8902B', '#10B981', '#3B82F6', '#A855F7', '#EC4899', '#F59E0B'];
              const color = palette[idx % palette.length];
              return (
                <div key={t.name}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13px] text-text-main truncate pr-2 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      {t.name}
                    </span>
                    <span className="text-[12px] font-medium text-text-main shrink-0 tabular-nums">
                      ₹{t.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-[3px] bg-bg-body rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.04, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">{t.count} invoice{t.count !== 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Outstanding balances */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-bg-card border border-border-color rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Outstanding</div>
            <button
              onClick={() => navigate('/billing')}
              className="h-7 px-2 rounded-md border border-border-color bg-bg-body hover:bg-bg-card hover:border-text-muted/50 text-[11px] font-semibold text-text-main flex items-center gap-1 transition-colors"
            >
              Open <CaretRight size={10} />
            </button>
          </div>
          {outstandingPatients.length === 0 ? (
            <div className="text-sm text-text-muted py-8 text-center">All paid up.</div>
          ) : (
            <div className="space-y-3">
              {outstandingPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate('/billing')}
                  className="w-full flex items-center gap-3 -mx-2 px-2 py-1.5 rounded-md hover:bg-bg-body transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-md bg-bg-body border border-border-color flex items-center justify-center text-[11px] font-semibold text-text-muted shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text-main truncate">{p.name}</div>
                    <div className="text-[10px] text-text-muted">{p.invoiceCount} pending</div>
                  </div>
                  <div className="text-[13px] font-medium text-text-main tabular-nums shrink-0">
                    ₹{p.balance.toLocaleString()}
                  </div>
                  <CaretRight size={12} className="text-text-muted/60 group-hover:text-text-main transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Doctor performance */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-bg-card border border-border-color rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Doctors</div>
            <button
              onClick={() => navigate('/doctors')}
              className="h-7 px-2 rounded-md border border-border-color bg-bg-body hover:bg-bg-card hover:border-text-muted/50 text-[11px] font-semibold text-text-main flex items-center gap-1 transition-colors"
            >
              Open <CaretRight size={10} />
            </button>
          </div>
          <div className="space-y-1">
            {doctorPerformance.map(d => (
              <button
                key={d.id}
                onClick={() => navigate('/doctors')}
                className="w-full flex items-center gap-3 -mx-2 px-2 py-1.5 rounded-md hover:bg-bg-body transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-bg-body border border-border-color flex items-center justify-center text-[11px] font-mono font-semibold text-text-muted shrink-0">
                  {d.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text-main truncate">{d.name}</div>
                  <div className="text-[10px] text-text-muted">{d.patientCount} patients · {d.invoiceCount} invoices</div>
                </div>
                <div className="text-[13px] font-medium text-text-main tabular-nums shrink-0">
                  ₹{d.revenue.toLocaleString()}
                </div>
                <CaretRight size={12} className="text-text-muted/60 group-hover:text-text-main transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent invoices */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="bg-bg-card border border-border-color rounded-xl"
      >
        <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-text-muted/80 font-medium">Recent invoices</div>
          <button
            onClick={() => navigate('/billing')}
            className="h-7 px-2 rounded-md border border-border-color bg-bg-body hover:bg-bg-card hover:border-text-muted/50 text-[11px] font-semibold text-text-main flex items-center gap-1 transition-colors"
          >
            See all <CaretRight size={10} />
          </button>
        </div>
        <div className="divide-y divide-border-color">
          {recentActivity.map(inv => (
            <button
              key={inv.id}
              onClick={() => navigate('/billing')}
              className="w-full px-6 py-3 flex items-center gap-4 hover:bg-bg-body transition-colors text-left group"
            >
              <div className="font-mono text-[11px] text-text-muted w-16 shrink-0">{inv.id}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-text-main truncate">{inv.patient}</div>
                <div className="text-[11px] text-text-muted truncate">{inv.treatment}</div>
              </div>
              <div className="text-[11px] text-text-muted shrink-0 hidden sm:block">
                {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusDot status={inv.status} />
                <span className="text-[11px] text-text-muted w-14">{inv.status}</span>
              </div>
              <div className="text-[13px] font-medium text-text-main tabular-nums shrink-0 w-20 text-right">
                ₹{inv.amount.toLocaleString()}
              </div>
              <CaretRight size={12} className="text-text-muted/60 group-hover:text-text-main transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}

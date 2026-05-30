import React from 'react';
import clsx from 'clsx';

const STATUS_CHIP_STYLES = {
  // Invoice / Appointment / Doctor statuses (Success/Active states)
  Paid:      'text-emerald-700 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  Confirmed: 'text-emerald-700 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  Completed: 'text-sky-700 bg-sky-50 border border-sky-200/50 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20',
  'In Stock':  'text-emerald-700 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  OK:        'text-emerald-700 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  Active:    'text-emerald-700 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  Cleared:   'text-emerald-700 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',

  // Warning/Pending states
  Partial:   'text-amber-800 bg-amber-50 border border-amber-200/50 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  Pending:   'text-amber-800 bg-amber-50 border border-amber-200/50 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',

  // Danger/Failure states
  Unpaid:    'text-rose-700 bg-rose-50 border border-rose-200/50 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
  Cancelled: 'text-rose-700 bg-rose-50 border border-rose-200/50 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
  'Low Stock': 'text-rose-700 bg-rose-50 border border-rose-200/50 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
  Low:       'text-rose-700 bg-rose-50 border border-rose-200/50 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
  Overdue:   'text-rose-700 bg-rose-50 border border-rose-200/50 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',

  Inactive:  'text-slate-600 bg-slate-100 border border-slate-200/60 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-700/50',
};

const DOT_COLORS = {
  Paid:      'bg-emerald-500 dark:bg-emerald-400',
  Confirmed: 'bg-emerald-500 dark:bg-emerald-400',
  Completed: 'bg-sky-500 dark:bg-sky-400',
  'In Stock':  'bg-emerald-500 dark:bg-emerald-400',
  OK:        'bg-emerald-500 dark:bg-emerald-400',
  Active:    'bg-emerald-500 dark:bg-emerald-400',
  Cleared:   'bg-emerald-500 dark:bg-emerald-400',

  Partial:   'bg-amber-500 dark:bg-amber-400',
  Pending:   'bg-amber-500 dark:bg-amber-400',

  Unpaid:    'bg-rose-500 dark:bg-rose-400',
  Cancelled: 'bg-rose-500 dark:bg-rose-400',
  'Low Stock': 'bg-rose-500 dark:bg-rose-400',
  Low:       'bg-rose-500 dark:bg-rose-400',
  Overdue:   'bg-rose-500 dark:bg-rose-400',

  Inactive:  'bg-slate-500 dark:bg-slate-400',
};

export function StatusDot({ status, className = '' }) {
  const color = DOT_COLORS[status] || 'bg-slate-400';
  return <span className={clsx('inline-block w-1.5 h-1.5 rounded-full shrink-0', color, className)} />;
}

export default function StatusBadge({ status, className = '', size = 'sm' }) {
  const chipStyle = STATUS_CHIP_STYLES[status] || 'text-slate-600 bg-slate-100 border border-slate-200/50 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-700/50';
  
  const sizes = {
    xs: 'text-[9px] px-1.5 py-0.5 rounded-md gap-1',
    sm: 'text-[10px] px-2 py-0.5 rounded-full gap-1.5',
    md: 'text-[11px] px-2.5 py-1 rounded-full gap-1.5',
  };
  
  return (
    <span className={clsx('inline-flex items-center font-bold uppercase tracking-wider', chipStyle, sizes[size], className)}>
      <StatusDot status={status} />
      <span>{status}</span>
    </span>
  );
}

import React from 'react';
import clsx from 'clsx';

const DOT_COLORS = {
  // Invoice statuses
  Paid:      'bg-emerald-500',
  Partial:   'bg-amber-500',
  Unpaid:    'bg-rose-500',
  // Appointment statuses
  Confirmed: 'bg-emerald-500',
  Completed: 'bg-sky-500',
  Pending:   'bg-amber-500',
  Cancelled: 'bg-rose-500',
  // Inventory / generic
  'Low Stock': 'bg-rose-500',
  'In Stock':  'bg-emerald-500',
  Low:       'bg-rose-500',
  OK:        'bg-emerald-500',
  // Patient
  Active:    'bg-emerald-500',
  Inactive:  'bg-text-muted',
  // History
  Cleared:   'bg-emerald-500',
  Overdue:   'bg-rose-500',
};

export function StatusDot({ status, className = '' }) {
  const color = DOT_COLORS[status] || 'bg-text-muted';
  return <span className={clsx('inline-block w-1.5 h-1.5 rounded-full shrink-0', color, className)} />;
}

export default function StatusBadge({ status, className = '', size = 'sm' }) {
  const sizes = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 font-medium text-text-muted', sizes[size], className)}>
      <StatusDot status={status} />
      <span>{status}</span>
    </span>
  );
}

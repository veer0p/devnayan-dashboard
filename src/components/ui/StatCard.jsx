import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Info } from '@phosphor-icons/react';

export const Card = ({ children, className, colSpan = 1 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        "bg-bg-card border border-border-color rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow",
        className,
        {
          'col-span-1': colSpan === 1,
          'col-span-2': colSpan === 2,
          'col-span-3': colSpan === 3,
          'col-span-4': colSpan === 4,
        }
      )}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ title, action, children }) => {
  return (
    <div className="flex justify-between items-center mb-4 text-sm font-medium text-text-muted">
      <span className="flex items-center gap-1.5 cursor-pointer hover:text-text-main transition-colors">
        {title} <Info size={14} />
      </span>
      {action && <div>{action}</div>}
      {children}
    </div>
  );
};

export const StatValue = ({ value, sub, children }) => {
  return (
    <div>
      <div className="text-[28px] font-bold mb-1 text-text-main">{value}</div>
      <div className="text-xs text-text-muted flex items-center gap-1.5">
        {sub}
        {children}
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'green', className }) => {
  return (
    <span className={clsx(
      "px-2 py-0.5 rounded text-[10px] font-medium inline-flex items-center gap-1",
      variant === 'green' ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400",
      className
    )}>
      {children}
    </span>
  );
};

export const Pill = ({ children, active, variant = 'primary', className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors flex items-center gap-1",
        active && variant === 'primary' ? "bg-primary text-white border-primary" : "",
        active && variant === 'light' ? "bg-primary/15 text-primary border-primary/30" : "",
        !active ? "border-border-color text-text-muted hover:bg-bg-body" : "",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  size = 'md',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const ref = useRef(null);

  const normalized = useMemo(
    () => options.map(o => typeof o === 'string' ? { value: o, label: o } : o),
    [options]
  );
  const selected = normalized.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => (i + 1) % normalized.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => (i - 1 + normalized.length) % normalized.length);
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        onChange(normalized[activeIdx].value);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, activeIdx, normalized, onChange]);

  useEffect(() => {
    if (open) {
      const idx = normalized.findIndex(o => o.value === value);
      setActiveIdx(idx >= 0 ? idx : 0);
    }
  }, [open, normalized, value]);

  const sizes = {
    sm: 'h-8 px-2.5 text-xs rounded-md',
    md: 'h-9 px-3 text-sm rounded-lg',
    lg: 'h-11 px-3 text-sm rounded-xl',
  };

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={clsx(
          'w-full bg-bg-card border border-border-color flex items-center justify-between gap-2 transition-all cursor-pointer focus:outline-none focus:border-primary',
          sizes[size],
          open && 'border-primary ring-1 ring-primary/30',
          disabled && 'opacity-50 cursor-not-allowed',
          buttonClassName,
        )}
      >
        <span className={clsx('truncate text-left', !selected && 'text-text-muted')}>
          {selected ? selected.label : placeholder}
        </span>
        <CaretDown size={14} className={clsx('text-text-muted shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1 bg-bg-card border border-border-color rounded-lg shadow-xl z-[100] py-1 max-h-60 overflow-auto custom-scrollbar"
          >
            {normalized.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isActive = idx === activeIdx;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors',
                    isActive && 'bg-bg-body',
                    isSelected ? 'text-primary font-medium' : 'text-text-main',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} weight="bold" className="text-primary shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

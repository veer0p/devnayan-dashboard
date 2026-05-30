import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SquaresFour,
  ChatCircleDots,
  Users,
  ShoppingCart,
  DotsThree,
  Package,
  Stethoscope,
  ChatTeardrop,
  X,
  EnvelopeSimple,
  ChartBar
} from '@phosphor-icons/react';
import clsx from 'clsx';
import { useClinic } from '../../context/ClinicContext';

const primary = [
  { label: 'Home', icon: SquaresFour, path: '/' },
  { label: 'Calendar', icon: ChatCircleDots, path: '/appointments' },
  { label: 'Patients', icon: Users, path: '/patients' },
  { label: 'Billing', icon: ShoppingCart, path: '/billing' },
];

const more = [
  { label: 'Inquiries', icon: EnvelopeSimple, path: '/inquiries' },
  { label: 'Reports', icon: ChartBar, path: '/reports' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
  { label: 'Help', icon: ChatTeardrop, path: '/help' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 xl:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed left-0 right-0 bottom-0 bg-bg-card border-t border-border-color rounded-t-3xl z-50 xl:hidden pb-safe shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-border-color">
                <span className="font-semibold text-text-main">More</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-9 h-9 rounded-full bg-bg-body flex items-center justify-center text-text-muted hover:text-text-main"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {more.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                        active
                          ? 'bg-primary/15 border-primary/40 text-primary'
                          : 'bg-bg-body border-border-color text-text-main hover:border-primary/40'
                      )}
                    >
                      <Icon size={26} weight={active ? 'fill' : 'regular'} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="px-5 pb-6 text-[10px] text-text-muted text-center">
                Devnayan • Powered by Dentease
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border-color z-30 xl:hidden">
        <div className="grid grid-cols-5 h-16">
          {primary.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 relative"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute top-0 h-0.5 w-10 bg-primary rounded-full"
                  />
                )}
                <Icon size={22} weight={active ? 'fill' : 'regular'} className={active ? 'text-primary' : 'text-text-muted'} />
                <span className={clsx('text-[10px] font-semibold', active ? 'text-primary' : 'text-text-muted')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1"
          >
            <DotsThree size={22} weight="bold" className="text-text-muted" />
            <span className="text-[10px] font-semibold text-text-muted">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

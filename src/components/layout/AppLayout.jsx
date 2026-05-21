import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from '../ui/ThemeToggle';
import WhatsAppStatus from './WhatsAppStatus';
import { List, X, MagnifyingGlass } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMobileSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex w-full h-screen p-2 md:p-3 pb-[68px] xl:pb-3 gap-3 bg-bg-body overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden xl:block">
        <Sidebar />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 xl:hidden"
            >
              <Sidebar onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col bg-bg-card rounded-2xl shadow-sm overflow-hidden p-3 md:p-6 relative z-10 w-full min-w-0">
        <div className="overflow-y-auto h-full pr-1 md:pr-2 custom-scrollbar">
          {/* Mobile header bar */}
          <div className="flex items-center justify-between mb-4 xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-border-color text-text-main hover:bg-bg-body transition-colors"
            >
              <List size={22} weight="bold" />
            </button>
            <span className="font-bold text-lg text-primary">Devnayan</span>
            <div className="flex items-center gap-2">
              <WhatsAppStatus />
              <ThemeToggle size="sm" />
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-border-color text-text-main hover:bg-bg-body transition-colors"
                title="Search"
              >
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </div>
          </div>
          <div className="hidden xl:block">
            <TopBar />
          </div>
          {children}
        </div>
      </main>

      {/* Mobile/global search (Cmd+K works on all screens) */}
      <GlobalSearch isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
    </div>
  );
}

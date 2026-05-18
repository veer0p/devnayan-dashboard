import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { List, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex w-full h-screen p-2 md:p-3 gap-3 bg-bg-body overflow-hidden">
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
            <div className="w-10" /> {/* Spacer */}
          </div>
          <div className="hidden xl:block">
            <TopBar />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { MagnifyingGlass, Bell } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from '../ui/ThemeToggle';

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center bg-bg-body px-4 py-2 rounded-xl w-full md:w-[320px] gap-2 text-text-muted border border-border-color hover:border-primary/40 hover:bg-bg-card transition-colors shadow-sm group"
      >
        <MagnifyingGlass size={18} />
        <span className="bg-transparent border-none outline-none w-full text-sm text-left text-text-muted group-hover:text-text-main truncate">
          Search anything…
        </span>
        <span className="text-[11px] bg-bg-card px-1.5 py-0.5 rounded border border-border-color shadow-sm font-medium text-text-muted shrink-0">⌘K</span>
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center border border-border-color rounded-full text-text-main hover:bg-bg-body transition-colors"
        >
          <Bell size={20} />
        </motion.button>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

import React from 'react';
import { MagnifyingGlass, Bell, DownloadSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export default function TopBar() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center bg-bg-body px-4 py-2 rounded-xl w-full md:w-[300px] gap-2 text-text-muted border border-border-color focus-within:border-primary/50 focus-within:bg-bg-card transition-colors shadow-sm">
        <MagnifyingGlass size={18} />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent border-none outline-none w-full text-sm text-text-main placeholder:text-text-muted"
        />
        <span className="text-[11px] bg-bg-card px-1.5 py-0.5 rounded border border-border-color shadow-sm font-medium text-text-muted">⌘K</span>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center border border-border-color rounded-full text-text-main hover:bg-bg-body transition-colors"
        >
          <Bell size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm shadow-sm transition-colors"
        >
          Export <DownloadSimple size={16} weight="bold" />
        </motion.button>
      </div>
    </header>
  );
}

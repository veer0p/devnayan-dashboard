import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';

export default function Drawer({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-md',
  showClose = false,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={`fixed right-0 top-0 bottom-0 w-full ${maxWidth} bg-bg-card shadow-2xl z-50 flex flex-col border-l border-border-color`}
          >
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main hover:bg-bg-body rounded-xl transition-colors z-10"
              >
                <X size={20} weight="bold" />
              </button>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

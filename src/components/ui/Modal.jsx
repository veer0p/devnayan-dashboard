import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';

export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'max-w-lg',
  preventOutsideClose = true,
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          onPointerDownOutside={(e) => preventOutsideClose && e.preventDefault()}
          onInteractOutside={(e) => preventOutsideClose && e.preventDefault()}
          className={`fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[92vw] ${maxWidth} max-h-[88vh] bg-bg-card rounded-2xl shadow-2xl z-50 p-6 animate-in zoom-in-95 duration-200 focus:outline-none overflow-y-auto custom-scrollbar border border-border-color`}
        >
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold flex items-center gap-2 text-text-main">
              {icon}
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-text-muted hover:bg-bg-body p-1.5 rounded-lg transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

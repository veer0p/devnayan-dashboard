import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Warning, Trash } from '@phosphor-icons/react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) {
  const Icon = variant === 'danger' ? Trash : Warning;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-in fade-in duration-150" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-bg-card rounded-2xl shadow-2xl z-[70] p-6 animate-in zoom-in-95 duration-150 focus:outline-none border border-border-color">
          <div className="flex items-start gap-4 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-rose-500/15 text-rose-500' : 'bg-primary/15 text-primary'}`}>
              <Icon size={20} weight="bold" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <Dialog.Title className="text-lg font-semibold text-text-main mb-1">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-text-muted leading-relaxed">
                  {description}
                </Dialog.Description>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-medium text-text-muted hover:bg-bg-body transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors ${
                variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

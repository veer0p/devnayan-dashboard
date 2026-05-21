import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, WhatsappLogo, PaperPlaneTilt } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { sendWhatsAppMessage } from '../../lib/openwa';
import { useClinic } from '../../context/ClinicContext';

/**
 * Beautiful custom dialog for composing and sending a WhatsApp message to a patient.
 * Replaces the browser window.prompt() that was used previously.
 *
 * Props:
 *  - patient: { name, phone } — the recipient
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - defaultMessage: string (optional) — pre-filled message text
 */
export default function WhatsAppMessageDialog({ patient, isOpen, onClose, defaultMessage = '' }) {
  const { clinic } = useClinic();
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  // Reset message when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [isOpen, defaultMessage]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message before sending.');
      return;
    }
    setSending(true);
    const toastId = toast.loading('Sending WhatsApp message...');
    try {
      const res = await sendWhatsAppMessage(patient.phone, message.trim());
      if (res.success) {
        if (res.manual) {
          toast.success('WhatsApp opened — message copied to clipboard!', { id: toastId });
        } else {
          toast.success('Message sent via WhatsApp!', { id: toastId });
        }
        onClose();
      } else if (res.cancelled) {
        toast.dismiss(toastId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send WhatsApp message', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
  const { clinic } = useClinic();
    // Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (!patient) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-bg-card border border-border-color rounded-2xl shadow-2xl z-50 focus:outline-none">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border-color">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 flex items-center justify-center">
                      <WhatsappLogo size={17} weight="fill" className="text-[#25D366]" />
                    </div>
                    <div>
                      <Dialog.Title className="text-sm font-semibold text-text-main">
                        Send WhatsApp Message
                      </Dialog.Title>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        To: <span className="font-medium text-text-main">{patient.name}</span>
                        <span className="ml-1.5 font-mono">{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button className="w-8 h-8 rounded-lg text-text-muted hover:bg-bg-body flex items-center justify-center transition-colors">
                      <X size={16} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Body */}
                <div className="p-5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Message
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={5}
                    placeholder={`Hi ${patient.name},\n\nThank you for visiting ${clinic.name}.\n\nRegards,\n${clinic.name}`}
                    className="w-full bg-bg-body border border-border-color rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-muted/50 resize-none focus:outline-none focus:border-[#25D366]/60 focus:ring-1 focus:ring-[#25D366]/30 transition-colors leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-text-muted/60">
                      Ctrl+Enter to send · *text* for bold
                    </span>
                    <span className={`text-[10px] tabular-nums ${message.length > 900 ? 'text-rose-400' : 'text-text-muted/60'}`}>
                      {message.length} / 1000
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    onClick={onClose}
                    className="flex-1 h-10 rounded-xl bg-bg-body border border-border-color text-text-main text-sm font-medium hover:bg-bg-body/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="flex-1 h-10 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#25D366]/20"
                  >
                    <PaperPlaneTilt size={15} weight="fill" />
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

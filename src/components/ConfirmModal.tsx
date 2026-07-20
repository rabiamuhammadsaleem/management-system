import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="confirm-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-none bg-[#0c0c0c] p-6 shadow-2xl border border-zinc-800 z-10"
          >
            <div className="flex items-start space-x-4">
              {isDanger && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-zinc-900 border border-zinc-800 text-rose-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-base font-serif font-normal italic text-zinc-100 tracking-wide">
                  {title}
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed uppercase tracking-wider">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                id="btn-confirm-cancel"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-none border border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-400 bg-[#0f0f0f] hover:bg-zinc-900 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                id="btn-confirm-submit"
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer ${
                  isDanger
                    ? "bg-rose-950/40 border border-rose-900 text-rose-400 hover:bg-rose-900/50"
                    : "bg-[#C5A059] text-black hover:bg-[#d6b57a]"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

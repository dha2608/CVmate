import { memo, useCallback } from 'react';
import { useToastStore } from '@/store/toastStore';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToastType } from '@/store/toastStore';

// Hoist static config outside component — prevents recreation on every render
const TOAST_INITIAL = { opacity: 0, x: 100, scale: 0.95 };
const TOAST_ANIMATE = { opacity: 1, x: 0, scale: 1 };
const TOAST_EXIT = { opacity: 0, x: 100, scale: 0.95 };
const TOAST_TRANSITION = { type: 'spring' as const, stiffness: 500, damping: 30 };

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const BG_MAP: Record<ToastType, string> = {
  success:
    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error:
    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning:
    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const ToastItem = memo(
  ({
    toast,
    onRemove,
  }: {
    toast: { id: string; type: ToastType; message: string };
    onRemove: (id: string) => void;
  }) => {
    const handleRemove = useCallback(() => onRemove(toast.id), [toast.id, onRemove]);
    return (
      <motion.div
        key={toast.id}
        initial={TOAST_INITIAL}
        animate={TOAST_ANIMATE}
        exit={TOAST_EXIT}
        transition={TOAST_TRANSITION}
        className={`pointer-events-auto ${BG_MAP[toast.type] ?? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'} border rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3`}
      >
        <div className="flex-shrink-0 mt-0.5">{ICON_MAP[toast.type] ?? null}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium break-words leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -mt-1 -mr-1"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </motion.div>
    );
  }
);
ToastItem.displayName = 'ToastItem';

const Toast = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-2 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;

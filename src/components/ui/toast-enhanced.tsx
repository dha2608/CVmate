import { motion } from 'framer-motion';
import { Button } from './button';

interface ToastEnhancedProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  onClose?: () => void;
}

export const ToastEnhanced = ({ type, message, description, onClose }: ToastEnhancedProps) => {
  const colors: Record<string, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`rounded-md shadow-lg text-white p-4 flex gap-2 ${colors[type]}`}
    >
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>
      {onClose && (
        <Button size="icon" variant="ghost" aria-label="Close" onClick={onClose}>
          ✕
        </Button>
      )}
    </motion.div>
  );
};

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface HelpItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ContextualHelpProps {
  items: HelpItem[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const ContextualHelp = ({
  items,
  position = 'top-right',
  className
}: ContextualHelpProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const currentItem = items.find(item => item.id === activeItem);

  return (
    <>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-40 w-12 h-12 rounded-full",
          "bg-crimson-red text-white shadow-lg",
          "flex items-center justify-center",
          "hover:bg-fire-red transition-colors",
          positionClasses[position],
          className
        )}
        aria-label="Help"
        aria-expanded={isOpen}
      >
        <HelpCircle size={24} />
      </motion.button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed z-50 w-80 max-w-[calc(100vw-2rem)]",
              "bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
              "max-h-[80vh] flex flex-col",
              positionClasses[position],
              "mt-14"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Help & Support</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close help"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!activeItem ? (
                <div className="p-4 space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveItem(item.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="mb-4 text-sm text-crimson-red hover:underline"
                  >
                    ← Back
                  </button>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {currentItem?.content}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

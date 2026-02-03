import { ReactNode } from 'react';

interface DialogEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const DialogEnhanced = ({ open, onOpenChange, children }: DialogEnhancedProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute inset-0 m-auto max-w-lg bg-white p-6 rounded-md shadow-lg h-fit w-[90vw] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
};

export const DialogContentEnhanced = ({ children }: { children: ReactNode }) => <>{children}</>;
export const DialogHeaderEnhanced = ({ children }: { children: ReactNode }) => (
  <header className="mb-4 text-lg font-semibold">{children}</header>
);
export const DialogTitleEnhanced = ({ children }: { children: ReactNode }) => (
  <h2 className="text-xl font-bold mb-2">{children}</h2>
);
export const DialogDescriptionEnhanced = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-gray-600 mb-4">{children}</p>
);
export const DialogFooterEnhanced = ({ children }: { children: ReactNode }) => (
  <footer className="mt-4 flex justify-end gap-2">{children}</footer>
);
export const DialogClose = () => null;

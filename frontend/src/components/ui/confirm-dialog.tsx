import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  requireInput?: boolean;
  inputPlaceholder?: string;
  inputLabel?: string;
}

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  resolve: ((value: string | boolean) => void) | null;
}

let confirmDialogState: ConfirmDialogState = {
  isOpen: false,
  options: { message: '' },
  resolve: null,
};

let setConfirmDialogState: ((state: ConfirmDialogState) => void) | null = null;

export const ConfirmDialogProvider = () => {
  const [state, setState] = useState<ConfirmDialogState>(confirmDialogState);
  const [inputValue, setInputValue] = useState('');

  setConfirmDialogState = setState;

  const handleConfirm = () => {
    if (state.options.requireInput && !inputValue.trim()) {
      return;
    }
    if (state.resolve) {
      state.resolve(state.options.requireInput ? inputValue : true);
    }
    setState({ isOpen: false, options: { message: '' }, resolve: null });
    setInputValue('');
  };

  const handleCancel = () => {
    if (state.resolve) {
      state.resolve(false);
    }
    setState({ isOpen: false, options: { message: '' }, resolve: null });
    setInputValue('');
  };

  return (
    <Dialog open={state.isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.options.title || 'Confirm Action'}</DialogTitle>
          <DialogDescription>{state.options.message}</DialogDescription>
        </DialogHeader>
        {state.options.requireInput && (
          <div className="space-y-2">
            {state.options.inputLabel && (
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {state.options.inputLabel}
              </label>
            )}
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={state.options.inputPlaceholder || 'Enter value...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  handleConfirm();
                }
              }}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {state.options.cancelText || 'Cancel'}
          </Button>
          <Button
            variant={state.options.variant || 'default'}
            onClick={handleConfirm}
            disabled={state.options.requireInput && !inputValue.trim()}
          >
            {state.options.confirmText || 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const confirmDialog = (options: ConfirmDialogOptions): Promise<string | boolean> => {
  return new Promise((resolve) => {
    if (setConfirmDialogState) {
      setConfirmDialogState({
        isOpen: true,
        options,
        resolve,
      });
    } else {
      // Fallback to browser confirm if provider not mounted
      const result = window.confirm(options.message);
      resolve(result);
    }
  });
};

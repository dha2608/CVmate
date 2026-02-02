import { useEffect, useRef } from 'react';

/**
 * Hook để manage focus khi mở/đóng modals
 * Lưu previous focus và restore khi đóng
 */
export const useFocusManagement = (isOpen: boolean) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Find first focusable element in modal
      const modal = document.querySelector('[role="dialog"], [data-modal]');
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        firstFocusableRef.current = focusableElements[0] as HTMLElement;
        firstFocusableRef.current?.focus();
      }
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  return { firstFocusableRef };
};

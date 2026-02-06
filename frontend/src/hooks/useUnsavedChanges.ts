import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDirtyStateStore } from '@/store/dirtyStateStore';
import { ConfirmDialog } from '@/components/ui/AlertDialog';

export const useUnsavedChanges = (message?: string) => {
  const { isDirty } = useDirtyStateStore();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Intercept navigation attempts
  const handleNavigation = (path: string) => {
    if (isDirty && location.pathname !== path) {
      setPendingNavigation(path);
      setShowDialog(true);
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    useDirtyStateStore.getState().clearDirty();
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowDialog(false);
    setPendingNavigation(null);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPendingNavigation(null);
  };

  return {
    isDirty,
    handleNavigation,
    Dialog: (
      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Unsaved Changes"
        description={
          message ||
          'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
        }
        confirmText="Leave"
        cancelText="Stay"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        variant="destructive"
      />
    ),
  };
};

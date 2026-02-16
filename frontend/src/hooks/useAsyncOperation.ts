import { useState, useCallback } from 'react';
import { useToastStore } from '@/store/toastStore';
import { getUserFriendlyMessage } from '@/lib/errorHandler';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
  } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const toast = useToastStore();

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      const errorMessage = getUserFriendlyMessage(err);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [operation, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, toast]);

  return { execute, isLoading, error };
};

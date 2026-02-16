import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxRetries = 3, retryDelay = 1000, onRetry, onMaxRetriesReached } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      if (retryCount >= maxRetries) {
        onMaxRetriesReached?.();
        throw new Error(`Max retries (${maxRetries}) reached`);
      }

      setIsRetrying(true);
      setRetryCount((prev) => prev + 1);

      try {
        onRetry?.(retryCount + 1);
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (retryCount + 1)));
        const result = await fn();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        setIsRetrying(false);
        throw error;
      }
    },
    [retryCount, maxRetries, retryDelay, onRetry, onMaxRetriesReached]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return { retry, retryCount, isRetrying, reset };
};

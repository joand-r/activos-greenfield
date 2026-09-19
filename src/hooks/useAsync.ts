import { useState, useCallback } from "react";

export interface UseAsyncReturn<T, Args extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | string | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useAsync<T, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>
): UseAsyncReturn<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | string | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err: any) {
        const message = err?.message || "Ocurrió un error inesperado";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}

import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(fetchFn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setState({ data: null, loading: false, error: message });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refresh: execute };
}

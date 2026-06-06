import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export function useFetch<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    apiFetch(endpoint)
      .then(resData => {
        if (isMounted) {
          setData(resData);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, error, isLoading };
}

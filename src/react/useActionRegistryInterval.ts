'use client';
import { useEffect, useState } from 'react';
import { ActionsRegistry } from '../api';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export function useActionsRegistryInterval({
  refreshInterval = TEN_MINUTES_MS,
}: {
  refreshInterval?: number;
} = {}) {
  const [isRegistryLoaded, setRegistryLoaded] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      await ActionsRegistry.getInstance().init();
      setRegistryLoaded(true);
    };

    if (!isRegistryLoaded && !isLoading) {
      setLoading(true);
      refresh().then(() => setLoading(false));
    }

    const interval = setInterval(refresh, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [isRegistryLoaded, refreshInterval]);

  return { isRegistryLoaded };
}

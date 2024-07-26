'use client';
import { useEffect, useState } from 'react';
import { ActionsRegistry } from '../api';

export function useActionsRegistryInterval() {
  const [isRegistryLoaded, setRegistryLoaded] = useState(false);

  useEffect(() => {
    ActionsRegistry.getInstance()
      .init()
      .then(() => {
        setRegistryLoaded(true);
      });
  }, [isRegistryLoaded]);

  return { isRegistryLoaded };
}

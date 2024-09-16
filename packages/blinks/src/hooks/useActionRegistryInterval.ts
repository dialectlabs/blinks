'use client';
import { ActionsRegistry } from '@dialectlabs/blinks-core';
import { useEffect, useState } from 'react';

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

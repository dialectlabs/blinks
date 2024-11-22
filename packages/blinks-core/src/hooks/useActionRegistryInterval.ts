import { useEffect, useState } from 'react';
import { ActionsRegistry } from '../api';

export function useActionsRegistryInterval() {
  const [isRegistryLoaded, setRegistryLoaded] = useState(false);

  useEffect(() => {
    const registry = ActionsRegistry.getInstance();
    registry.init().then(() => {
      setRegistryLoaded(true);
    });

    return () => {
      registry.stopRefresh();
    };
  }, [isRegistryLoaded]);

  return { isRegistryLoaded };
}

import { useEffect, useState } from 'react';
import { BlinksRegistry } from '../api';

export function useBlinksRegistryInterval() {
  const [isRegistryLoaded, setRegistryLoaded] = useState(false);

  useEffect(() => {
    const registry = BlinksRegistry.getInstance();
    registry.init().then(() => {
      setRegistryLoaded(true);
    });

    return () => {
      registry.stopRefresh();
    };
  }, [isRegistryLoaded]);

  return { isRegistryLoaded };
}

export { useBlinksRegistryInterval as useActionsRegistryInterval };

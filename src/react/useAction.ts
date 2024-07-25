'use client';
import { useEffect, useState } from 'react';
import { Action, type ActionAdapter } from '../api';
import { useActionsRegistryInterval } from './useActionRegistryInterval.ts';

interface UseActionOptions {
  url: string;
  adapter: ActionAdapter;
  refreshInterval?: number;
}

export function useAction({ url, adapter, refreshInterval }: UseActionOptions) {
  const { isRegistryLoaded } = useActionsRegistryInterval({ refreshInterval });
  const [action, setAction] = useState<Action | null>(null);

  useEffect(() => {
    setAction(null);
    if (!isRegistryLoaded) {
      return;
    }
    Action.fetch(url)
      .then(setAction)
      .catch((e) => {
        console.error('[@dialectlabs/blinks] Failed to fetch action', e);
        setAction(null);
      });
  }, [url, isRegistryLoaded]);

  useEffect(() => {
    action?.setAdapter(adapter);
  }, [action, adapter]);

  return { action };
}

'use client';
import type { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Action } from '../api';
import { useActionAdapter } from './useActionAdapter.ts';
import { useActionsRegistryInterval } from './useActionRegistryInterval.ts';

interface UseActionOptions {
  rpcUrlOrConnection: string | Connection;
  refreshInterval?: number;
}

export function useAction(
  actionUrl: string,
  { rpcUrlOrConnection, refreshInterval }: UseActionOptions,
) {
  const { isRegistryLoaded } = useActionsRegistryInterval({ refreshInterval });
  const { adapter } = useActionAdapter(rpcUrlOrConnection);
  const [action, setAction] = useState<Action | null>(null);

  useEffect(() => {
    setAction(null);
    if (!isRegistryLoaded) {
      return;
    }
    Action.fetch(actionUrl)
      .then(setAction)
      .catch((e) => {
        console.error('[@dialectlabs/blinks] Failed to fetch action', e);
        setAction(null);
      });
  }, [actionUrl, isRegistryLoaded]);

  useEffect(() => {
    action?.setAdapter(adapter);
  }, [action, adapter]);

  return { action };
}

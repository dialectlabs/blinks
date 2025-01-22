import { useCallback, useEffect, useState } from 'react';
import {
  Action,
  defaultActionSupportStrategy,
  type ActionSupportStrategy,
} from '../api';
import { useActionApiUrl } from './useActionApiUrl.ts';
import { useActionsRegistryInterval } from './useActionRegistryInterval.ts';

interface UseActionOptions {
  url: string | URL;
  securityRegistryRefreshInterval?: number;
  supportStrategy?: ActionSupportStrategy;
}

export function useAction({
  url,
  supportStrategy = defaultActionSupportStrategy,
}: UseActionOptions) {
  const { isRegistryLoaded } = useActionsRegistryInterval();
  const { actionApiUrl, isUrlLoading } = useActionApiUrl(url);
  const [action, setAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAction = useCallback(() => {
    if (!actionApiUrl) {
      return () => {};
    }

    let ignore = false;
    setIsLoading(true);
    setHasFetched(false);
    Action.fetch(actionApiUrl, supportStrategy)
      .then((action) => {
        if (!ignore) {
          setIsLoading(false);
          setAction(action);
          setHasFetched(true);
        }
      })
      .catch((e) => {
        if (!ignore) {
          console.error('[@dialectlabs/blinks-core] Failed to fetch action', e);
          setAction(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [actionApiUrl, supportStrategy]);

  useEffect(() => {
    if (!isRegistryLoaded) {
      return;
    }

    const cleanup = fetchAction();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only update if actionApiUrl changes or registry loaded
  }, [actionApiUrl, isRegistryLoaded]);

  // this effect handles race conditions between fetching the action support strategy changes
  // hasFetched dependency is used instead of action dependency to ensure there's no infinite loop
  useEffect(() => {
    if (!action || !hasFetched) {
      return;
    }
    try {
      const updated = action.withUpdate({
        supportStrategy,
      });
      setAction(updated);
    } catch (e) {
      console.error('[@dialectlabs/blinks-core] Failed to update action', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only update if supportStrategy changes
  }, [supportStrategy, hasFetched]);

  return {
    action,
    isLoading: !isRegistryLoaded || isUrlLoading || isLoading,
    refresh: fetchAction,
  };
}

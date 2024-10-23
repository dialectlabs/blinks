import { useEffect, useState } from 'react';
import {
  Action,
  type ActionSupportStrategy,
  defaultActionSupportStrategy,
} from '../api';
import { unfurlUrlToActionApiUrl } from '../utils';
import { useActionsRegistryInterval } from './useActionRegistryInterval.ts';

interface UseActionOptions {
  url: string | URL;
  securityRegistryRefreshInterval?: number;
  supportStrategy?: ActionSupportStrategy;
}

function useActionApiUrl(url: string | URL) {
  const [apiUrl, setApiUrl] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    unfurlUrlToActionApiUrl(new URL(url))
      .then((apiUrl) => {
        if (ignore) {
          return;
        }
        setApiUrl(apiUrl);
      })
      .catch((e) => {
        console.error(
          '[@dialectlabs/blinks-core] Failed to unfurl action URL',
          e,
        );
        setApiUrl(null);
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return { actionApiUrl: apiUrl };
}

export function useAction({
  url,
  supportStrategy = defaultActionSupportStrategy,
}: UseActionOptions) {
  const { isRegistryLoaded } = useActionsRegistryInterval();
  const { actionApiUrl } = useActionApiUrl(url);
  const [action, setAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (!isRegistryLoaded || !actionApiUrl) {
      return;
    }

    let ignore = false;
    setHasFetched(false);
    Action.fetch(actionApiUrl, supportStrategy)
      .then((action) => {
        if (ignore) {
          return;
        }
        setAction(action);
        setHasFetched(true);
      })
      .catch((e) => {
        console.error('[@dialectlabs/blinks-core] Failed to fetch action', e);
        setAction(null);
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only update if actionApiUrl changes
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

  return { action, isLoading };
}

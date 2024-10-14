import { useEffect, useState } from 'react';
import {
  Action,
  type ActionAdapter,
  type ActionSupportStrategy,
  defaultActionSupportStrategy,
} from '../api';
import { unfurlUrlToActionApiUrl } from '../utils';
import { useActionsRegistryInterval } from './useActionRegistryInterval.ts';

interface UseActionOptions {
  url: string | URL;
  adapter: ActionAdapter;
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
  adapter,
  supportStrategy = defaultActionSupportStrategy,
}: UseActionOptions) {
  const { isRegistryLoaded } = useActionsRegistryInterval();
  const { actionApiUrl } = useActionApiUrl(url);
  const [action, setAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (!isRegistryLoaded || !actionApiUrl) {
      return;
    }

    let ignore = false;
    Action.fetch(actionApiUrl, adapter, supportStrategy)
      .then((action) => {
        if (ignore) {
          return;
        }
        setAction(action);
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
  }, [actionApiUrl, isRegistryLoaded]);

  useEffect(() => {
    if (!action) {
      return;
    }
    try {
      const updated = Action.update(action, {
        adapter,
        supportStrategy,
      });
      setAction(updated);
    } catch (e) {
      console.error('[@dialectlabs/blinks-core] Failed to update action', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only update if adapter or supportStrategy changes
  }, [adapter, supportStrategy]);

  return { action, isLoading };
}

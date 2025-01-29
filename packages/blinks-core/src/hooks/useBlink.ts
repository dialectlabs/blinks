import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BlinkInstance,
  defaultBlinkSupportStrategy,
  type BlinkSupportStrategy,
} from '../api';
import { useBlink as useApiBlink } from '../service-api';
import { useBlinkApiUrl } from './useBlinkApiUrl.ts';
import { useBlinksRegistryInterval } from './useBlinksRegistryInterval.ts';

interface UseBlinkOptions {
  url: string | URL;
  supportStrategy?: BlinkSupportStrategy;
}

/**
 * Newer version of `useAction` hook, that returns a `BlinkInstance` and uses Dialect API
 * @param url - blink url (api url, interstitial or to-be-mapped from actions.json
 * @param supportStrategy {BlinkSupportStrategy} - support strategy function
 */
export function useBlink({
  url,
  supportStrategy = defaultBlinkSupportStrategy,
}: UseBlinkOptions) {
  const { isRegistryLoaded } = useBlinksRegistryInterval();

  const {
    blink: blinkJson,
    isLoading,
    metadata,
    refresh,
    blinkApiUrl,
  } = useApiBlink({ url: url.toString() });

  const blink = useMemo(
    () =>
      isRegistryLoaded && blinkApiUrl && blinkJson && metadata
        ? BlinkInstance.hydrate(
            blinkApiUrl,
            blinkJson,
            metadata,
            supportStrategy,
          )
        : null,
    [blinkApiUrl, blinkJson, metadata, supportStrategy, isRegistryLoaded],
  );

  return {
    blink,
    blinkJson,
    metadata,
    blinkApiUrl,
    isLoading: isLoading || !isRegistryLoaded,
    refresh,
  };
}

/**
 * NOTE: returned `action` property will be removed in the nearest future in favor of `blink`
 * left for backwards compatibility
 */
export function useAction({
  url,
  supportStrategy = defaultBlinkSupportStrategy,
}: UseBlinkOptions) {
  const { isRegistryLoaded } = useBlinksRegistryInterval();
  const { blinkApiUrl, isUrlLoading } = useBlinkApiUrl(url);
  const [blink, setBlink] = useState<BlinkInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAction = useCallback(() => {
    if (!blinkApiUrl) {
      return () => {};
    }

    let ignore = false;
    setIsLoading(true);
    setHasFetched(false);
    BlinkInstance.fetch(blinkApiUrl, supportStrategy)
      .then((action) => {
        if (!ignore) {
          setIsLoading(false);
          setBlink(action);
          setHasFetched(true);
        }
      })
      .catch((e) => {
        if (!ignore) {
          console.error('[@dialectlabs/blinks-core] Failed to fetch action', e);
          setBlink(null);
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
  }, [blinkApiUrl, supportStrategy]);

  useEffect(() => {
    if (!isRegistryLoaded) {
      return;
    }

    const cleanup = fetchAction();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only update if actionApiUrl changes or registry loaded
  }, [blinkApiUrl, isRegistryLoaded]);

  // this effect handles race conditions between fetching the action support strategy changes
  // hasFetched dependency is used instead of action dependency to ensure there's no infinite loop
  useEffect(() => {
    if (!blink || !hasFetched) {
      return;
    }
    try {
      const updated = blink.withUpdate({
        supportStrategy,
      });
      setBlink(updated);
    } catch (e) {
      console.error('[@dialectlabs/blinks-core] Failed to update action', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only update if supportStrategy changes
  }, [supportStrategy, hasFetched]);

  return {
    // NOTE: this will be removed in the nearest future
    action: blink,
    blink,
    isLoading: !isRegistryLoaded || isUrlLoading || isLoading,
    refresh: fetchAction,
  };
}

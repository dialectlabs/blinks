import { useCallback, useEffect, useState } from 'react';
import type { LinkedAction, TypedAction } from '../api';
import { useActionApiUrl } from '../hooks/useActionApiUrl.ts';
import { type Supportability, getBlinkSupportabilityMetadata } from '../utils';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';
import type { BlinkContext, BlinkPreview } from './types.ts';

// todo: figure out type naming (in order to avoid future conflicts when merging with non-headless)
export type Blink = TypedAction & {
  extendedDescription?: string;
  preview: BlinkPreview;
  context: BlinkContext;
  links?: {
    actions?: LinkedAction[];
    dataTable?: string;
  };
};

/**
 * This is an updated version of the useAction hook, which used Dialect API to fetch the action.
 *
 * @params url - Blink URL: either a direct API url, an interstitial URL or a URL that can be mapped to a blink api URL through actions.json on the host
 * Note: no need to pass `solana-actions` prefix.
 */
export const useBlink = ({ url }: { url?: string | null }) => {
  const [blinkData, setBlinkData] = useState<{
    blink: Blink;
    metadata: Supportability;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { actionApiUrl, isUrlLoading } = useActionApiUrl(url);

  const loadBlink = useCallback(
    async ({ abortController }: { abortController?: AbortController } = {}) => {
      if (!url || !actionApiUrl) {
        return;
      }

      setIsLoading(true);

      try {
        const blinkData = await fetchBlink(actionApiUrl);

        if (!abortController?.signal.aborted) {
          setBlinkData(blinkData);
          setIsLoading(false);
        }
      } catch {
        if (!abortController?.signal.aborted) {
          console.error(
            '[@dialectlabs/blinks-core] Failed to fetch blink',
            actionApiUrl,
          );
          setBlinkData(null);
          setIsLoading(false);
        }
      }
    },
    [url, actionApiUrl],
  );

  useEffect(() => {
    const abortController = new AbortController();

    loadBlink({ abortController });

    return () => {
      abortController.abort();
    };
  }, [loadBlink]);

  return {
    // raw blink data
    blink: blinkData?.blink ?? null,
    // blink metadata, such as blockchain and solana actions version (if specified in blink response)
    metadata: blinkData?.metadata ?? null,
    isLoading: isLoading || isUrlLoading,
    refresh: loadBlink,
  };
};

export const fetchBlink = async (
  apiUrl: string,
  options: { abortController?: AbortController } = {},
): Promise<{ blink: Blink; metadata: Supportability }> => {
  const url = new URL(`https://api.dial.to/v1/blink`);
  url.searchParams.append('apiUrl', apiUrl);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
    },
    signal: options.abortController?.signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch blink');
  }

  const blink = await response.json();
  const metadata = getBlinkSupportabilityMetadata(response);

  return { blink, metadata };
};

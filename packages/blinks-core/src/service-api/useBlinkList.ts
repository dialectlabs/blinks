import { useCallback, useEffect, useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';
import type { BlinkPreview } from './types.ts';

export interface BlinkList {
  id: string;
  name: string;
  entries: BlinkListEntry[];
}

export type BlinkListEntry = BlinkPreview & {
  id: string;
  links: {
    blink: string;
    dataTable?: string;
  };
};

/**
 * Slightly modified version of the useBlinkList hook, which used Dialect API to fetch the blink list.
 *
 * NOTE: not intended to be used with local urls (e.g. `localhost`)
 */
export const useBlinkList = ({
  id,
  wallet,
}: {
  id?: string | null;
  wallet?: string | null; // user wallet address
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlinkList | null>(null);

  const loadBlinkList = useCallback(
    async (options: { abortController?: AbortController } = {}) => {
      if (!id) {
        return;
      }

      setLoading(true);

      try {
        const data = await fetchBlinkList(id, wallet, options);

        if (!options.abortController?.signal.aborted) {
          setData(data);
          setLoading(false);
        }
      } catch {
        if (!options.abortController?.signal.aborted) {
          console.error(
            `[@dialectlabs/blinks-core] Failed to fetch blink list: ${id}`,
          );

          setData(null);
          setLoading(false);
        }
      }
    },
    [id, wallet],
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadBlinkList({ abortController });
    return () => {
      abortController.abort();
    };
  }, [loadBlinkList]);

  return {
    loading,
    refresh: loadBlinkList,
    data,
  };
};

export async function fetchBlinkList(
  id: string,
  wallet?: string | null,
  options: { abortController?: AbortController } = {},
): Promise<BlinkList> {
  const urlObj = new URL(`https://api.dial.to/v1/blink-lists/${id}`);
  if (wallet) {
    urlObj.searchParams.append('account', wallet);
  }
  const response = await fetch(urlObj, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
    },
    signal: options.abortController?.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blink list: ${id}`);
  }
  return response.json();
}

import { useCallback, useEffect, useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';
import type { BlinkContext } from './types.ts';

export interface DataRow {
  key: string;
  title: string;
  value: string;
  icon?: string;
  url?: string;
}

export interface BlinkDataTable {
  rows: DataRow[];
  context: BlinkContext;
}

/**
 * This is a new version of the useMetadata hook, which uses Dialect's API to fetch updated models
 */
export const useBlinkDataTable = ({
  blinkApiUrl,
  wallet,
}: {
  blinkApiUrl?: string | null;
  wallet?: string;
}) => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<BlinkDataTable | null>(null);

  const loadBlinkDataTable = useCallback(
    async (options: { abortController?: AbortController } = {}) => {
      if (!blinkApiUrl) {
        return;
      }

      setLoading(true);

      try {
        const data = await fetchBlinkDataTable(blinkApiUrl, wallet, options);

        if (!options.abortController?.signal.aborted) {
          setData(data);
          setLoading(false);
        }
      } catch {
        if (!options.abortController?.signal.aborted) {
          console.error(
            '[@dialectlabs/blinks-core] Failed to fetch blink data table',
            blinkApiUrl,
          );
          setData(null);
          setLoading(false);
        }
      }
    },
    [blinkApiUrl, wallet],
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadBlinkDataTable({ abortController });
    return () => {
      abortController.abort();
    };
  }, [loadBlinkDataTable]);

  return {
    data,
    isLoading,
    refresh: loadBlinkDataTable,
  };
};

export async function fetchBlinkDataTable(
  blinkApiUrl: string,
  wallet?: string,
  options: { abortController?: AbortController } = {},
): Promise<BlinkDataTable> {
  const url = new URL('https://api.dial.to/v1/blink-data-table');
  url.searchParams.append('apiUrl', blinkApiUrl);
  if (wallet) {
    url.searchParams.append('account', wallet);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
    },
    signal: options.abortController?.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blink data table, url: ${blinkApiUrl}`);
  }

  return response.json();
}

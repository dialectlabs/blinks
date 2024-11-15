import { useCallback, useEffect, useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';

export interface BlinkList {
  entries: BlinkListEntry[];
}

export interface BlinkListEntry {
  id: string;
  title: string;
  description: string;
  blinkUrl: string;
  metadataUrl?: string;
  image: string;
  icon?: string;
}

export const useBlinkList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlinkList>();

  const refetch = useCallback(() => {
    const controller = new AbortController();

    setLoading(true);
    fetchBlinkList({ signal: controller.signal })
      .then(setData)
      .finally(() => setLoading(false));

    return controller;
  }, []);

  useEffect(() => {
    const controller = refetch();

    return () => {
      controller.abort();
    };
  }, [refetch]);

  return {
    loading,
    refetch,
    data: data?.entries ?? [],
  };
};

async function fetchBlinkList({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<BlinkList> {
  try {
    const response = await fetch(
      'https://registry.dial.to/v1/private/blinks/list',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
        },
        signal,
      },
    );
    if (response.status >= 400) {
      console.error(
        `[@dialectlabs/blinks] Failed to fetch blink list, response status: ${response.status}`,
      );
      return {
        entries: [],
      };
    }
    return (await response.json()) as BlinkList;
  } catch (e) {
    console.error(`[@dialectlabs/blinks] Failed to fetch blink list`, e);
    return {
      entries: [],
    };
  }
}

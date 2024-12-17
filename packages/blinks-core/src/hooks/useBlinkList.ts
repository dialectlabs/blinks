import { useCallback, useEffect, useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';

export interface UseBlinkListOptions {
  id: string;
  wallet?: string; // user wallet address
}

export interface BlinkList {
  entries: BlinkListEntry[];
}

export interface BlinkListEntry {
  id: string;
  title: string;
  description: string;
  blinkUrl: string;
  websiteUrl?: string;
  websiteText?: string;
  metadataUrl?: string;
  image: string;
  icon?: string;
  cta?: string;
  provider: {
    name?: string;
    category?: string;
  };
}

export const useBlinkList = ({ id, wallet }: UseBlinkListOptions) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlinkList>();

  const refetch = useCallback(() => {
    let ignore = false;

    setLoading(true);
    fetchBlinkList(id, wallet)
      .then((data) => {
        if (!ignore) {
          setData(data);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id, wallet]);

  useEffect(() => {
    const cancel = refetch();

    return () => {
      cancel();
    };
  }, [refetch]);

  return {
    loading,
    refetch,
    data: data?.entries ?? [],
  };
};

export async function fetchBlinkList(
  id: string,
  wallet: string | undefined,
): Promise<BlinkList> {
  try {
    const urlObj = new URL(
      `https://registry.dial.to/v1/private/blink-lists/${id}`,
    );
    if (wallet) {
      urlObj.searchParams.append('account', wallet);
    }
    const response = await fetch(urlObj, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
      },
    });
    if (!response.ok) {
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

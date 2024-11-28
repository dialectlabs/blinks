import { useCallback, useEffect, useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';

export interface UseBlinkListOptions {
  id: string;
}

export interface BlinkList {
  entries: BlinkListEntry[];
}

export interface BlinkListEntry {
  id: string;
  title: string;
  description: string;
  blinkUrl: string;
  metadataUrl?: string;
  websiteUrl?: string;
  websiteText?: string;
  image: string;
  icon?: string;
}

export const useBlinkList = ({ id }: UseBlinkListOptions) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlinkList>();

  const refetch = useCallback(() => {
    let ignore = false;

    setLoading(true);
    fetchBlinkList(id)
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
  }, [id]);

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

export async function fetchBlinkList(id: string): Promise<BlinkList> {
  try {
    const response = await fetch(
      `https://registry.dial.to/v1/private/blink-lists/${id}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
        },
      },
    );
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

import { useCallback, useEffect, useState } from 'react';
import { proxifyMetadata } from '../utils/proxify.ts';

interface UseMetadataArgs {
  wallet?: string; // user wallet address
  url: string; // metadata url
}

export interface BlinkMetadata {
  rows: MetadataRow[];
  extendedDescription?: string;
}

export interface MetadataRow {
  key: string;
  title: string;
  value: string;
  icon?: string;
  url?: string;
}

export const useMetadata = ({ url, wallet }: UseMetadataArgs) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlinkMetadata>();

  const refetch = useCallback(() => {
    let ignore = false;

    setLoading(true);
    fetchMetadata(url, wallet)
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
  }, [url, wallet]);

  useEffect(() => {
    const cancel = refetch();

    return () => {
      cancel();
    };
  }, [refetch]);

  return {
    loading,
    refetch,
    data,
  };
};

async function fetchMetadata(
  url: string,
  wallet?: string,
): Promise<BlinkMetadata> {
  try {
    const urlObj = new URL(url);
    if (wallet) {
      urlObj.searchParams.append('account', wallet);
    }
    const { url: proxyUrl, headers: proxyHeaders } = proxifyMetadata(
      urlObj.toString(),
    );
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...proxyHeaders,
      },
    });
    if (response.status >= 400) {
      console.error(
        `[@dialectlabs/blinks] Failed to fetch metadata, response status: ${response.status}`,
      );
      return {
        rows: [],
      };
    }
    return (await response.json()) as BlinkMetadata;
  } catch (e) {
    console.error(`[@dialectlabs/blinks] Failed to fetch metadata`, e);
    return {
      rows: [],
    };
  }
}

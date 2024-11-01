import { useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';

interface UseBlinksDiscoveryArgs {
  blinkUrl?: string; // filter by blinkUrl
}

export interface DiscoveredBlinks {
  entries: BlinkDiscoveryEntry[];
}

export interface BlinkDiscoveryEntry {
  id: string;
  blinkUrl: string;
  metadataUrl?: string;
  title: string;
  description: string;
  icon?: string;
  logo?: string;
}

// TODO: handle props, do we really need filter here?
export const useBlinksDiscovery = (props: UseBlinksDiscoveryArgs) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiscoveredBlinks>();

  const refetch = () => {
    setLoading(true);
    fetchDiscovery()
      .then(setData)
      .finally(() => setLoading(false));
  };

  return {
    loading,
    refetch,
    data,
  };
};

async function fetchDiscovery(): Promise<DiscoveredBlinks> {
  try {
    const response = await fetch(
      'https://registry.dial.to/v1/private/discovery/list',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
        },
      },
    );
    if (response.status >= 400) {
      console.error(
        `[@dialectlabs/blinks] Failed to fetch discovery, response status: ${response.status}`,
      );
      return {
        entries: [],
      };
    }
    return (await response.json()) as DiscoveredBlinks;
  } catch (e) {
    console.error(`[@dialectlabs/blinks] Failed to fetch discovery`, e);
    return {
      entries: [],
    };
  }
}

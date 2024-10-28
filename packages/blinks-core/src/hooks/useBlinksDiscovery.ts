import { useState } from 'react';

interface UseBlinksDiscoveryArgs {
  blinkUrl?: string; // filter by blinkUrl
}

export interface BlinkDiscoveryEntry {
  id: string;
  blinkUrl: string;
  metadataUrl?: string;
  title: string;
  description: string;
  icon?: string;
  logo: string;
}

export const useBlinksDiscovery = (props: UseBlinksDiscoveryArgs) => {
  const [loading, setLoading] = useState(false);
  const refetch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return {
    loading,
    refetch,
    data: [
      {
        id: 'id-1',
        blinkUrl: 'solana-action:https://dial.to/api/donate', // solana-action:https://... (direct) or https://... (needs actions.json mapping)
        metadataUrl: undefined, // todo: add metadataUrl
        title: 'Donate to Alice',
        description: 'Support Alice with a donation',
        icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
        logo: 'https://dial.to/icon.svg?1741476bec0bda5d',
      },
    ] as BlinkDiscoveryEntry[],
  };
};

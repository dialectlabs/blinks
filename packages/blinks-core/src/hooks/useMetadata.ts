import { useState } from 'react';

interface UseMetadataArgs {
  wallet?: string; // user wallet address
  url: string; // metadata url
}

export const useMetadata = (props: UseMetadataArgs) => {
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
      { key: 'apy', title: 'Apy', value: '7%' },
      { key: 'description', title: 'Description', value: 'Markdown *text*' },
    ],
  };
};

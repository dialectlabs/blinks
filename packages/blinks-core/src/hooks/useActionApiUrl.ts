import { useEffect, useState } from 'react';
import { unfurlUrlToActionApiUrl } from '../utils';

export function useActionApiUrl(url?: URL | string | null) {
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!url) {
      setApiUrl(null);
      return;
    }

    setIsLoading(true);
    unfurlUrlToActionApiUrl(new URL(url))
      .then((apiUrl) => {
        if (ignore) {
          return;
        }
        setIsLoading(false);
        setApiUrl(apiUrl);
      })
      .catch((e) => {
        console.error(
          '[@dialectlabs/blinks-core] Failed to unfurl action URL',
          e,
        );
        if (!ignore) {
          setApiUrl(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return { actionApiUrl: apiUrl, isUrlLoading: isLoading };
}

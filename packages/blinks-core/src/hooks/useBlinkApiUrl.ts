import { useEffect, useState } from 'react';
import { unfurlUrlToBlinkApiUrl } from '../utils';

export function useBlinkApiUrl(url?: URL | string | null) {
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!url) {
      setApiUrl(null);
      return;
    }

    setIsLoading(true);
    unfurlUrlToBlinkApiUrl(new URL(url))
      .then((apiUrl) => {
        if (ignore) {
          return;
        }
        setIsLoading(false);
        setApiUrl(apiUrl);
      })
      .catch((e) => {
        console.error(
          '[@dialectlabs/blinks-core] Failed to unfurl blink URL',
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

  // NOTE: `actionApiUrl` is deprecated and will be removed in the nearest future
  return { actionApiUrl: apiUrl, blinkApiUrl: apiUrl, isUrlLoading: isLoading };
}

// backwards compatibility
export { useBlinkApiUrl as useActionApiUrl };

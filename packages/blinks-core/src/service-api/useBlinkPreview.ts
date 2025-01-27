import { useCallback, useEffect, useState } from 'react';
import { BLINK_CLIENT_KEY_HEADER, clientKey } from '../utils/client-key.ts';
import type { BlinkPreview } from './types.ts';

export type BlinkPreviewResponse = BlinkPreview & {
  links?: {
    blink: string;
    dataTable?: string;
  };
};

export const useBlinkPreview = ({
  blinkApiUrl,
}: {
  blinkApiUrl?: string | null;
}) => {
  const [isLoading, setLoading] = useState(false);
  const [preview, setPreview] = useState<BlinkPreview | null>(null);

  const loadBlinkPreview = useCallback(
    async (options: { abortController?: AbortController } = {}) => {
      if (!blinkApiUrl) {
        return;
      }

      setLoading(true);

      try {
        const data = await fetchBlinkPreview(blinkApiUrl, options);

        if (!options.abortController?.signal.aborted) {
          setPreview(data);
          setLoading(false);
        }
      } catch {
        if (!options.abortController?.signal.aborted) {
          console.error(
            '[@dialectlabs/blinks-core] Failed to fetch blink preview',
            blinkApiUrl,
          );
          setPreview(null);
          setLoading(false);
        }
      }
    },
    [blinkApiUrl],
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadBlinkPreview({ abortController });
    return () => {
      abortController.abort();
    };
  }, [loadBlinkPreview]);

  return {
    preview,
    isLoading,
    refresh: loadBlinkPreview,
  };
};

export async function fetchBlinkPreview(
  blinkApiUrl: string,
  options: { abortController?: AbortController } = {},
): Promise<BlinkPreviewResponse> {
  const url = new URL('https://api.dial.to/v1/blink-preview');
  url.searchParams.append('apiUrl', blinkApiUrl);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
    },
    signal: options.abortController?.signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch blink preview, url: ${blinkApiUrl}`);
  }
  return response.json();
}

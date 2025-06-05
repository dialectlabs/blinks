import { BlinksRegistry, type LookupType } from '../api';

/**
 * Fetch a resource while validating any redirect URL using BlinksRegistry.
 * If a redirect response is returned, only follow it when the target URL
 * is marked as `trusted` in the registry. Throws otherwise.
 */
export async function secureFetch(
  url: string,
  init: RequestInit & { abortController?: AbortController } = {},
  lookupType: LookupType = 'blink',
): Promise<Response> {
  let currentUrl = url;
  let redirectCount = 0;
  const { abortController, ...rest } = init;

  while (redirectCount < 5) {
    const response = await fetch(currentUrl, {
      ...rest,
      redirect: 'manual',
      signal: abortController?.signal,
    });

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.has('location')
    ) {
      const locationHeader = response.headers.get('location')!;
      const nextUrl = new URL(locationHeader, currentUrl).toString();
      const { state } = BlinksRegistry.getInstance().lookup(nextUrl, lookupType);
      if (state !== 'trusted') {
        throw new Error(
          `Redirect target failed security validation: ${nextUrl}`,
        );
      }
      currentUrl = nextUrl;
      redirectCount++;
      continue;
    }

    return response;
  }

  throw new Error('Too many redirects');
}

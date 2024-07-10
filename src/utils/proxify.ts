let proxyUrl: string | null = 'https://proxy.dial.to';

export function setProxyUrl(url: string): void {
  if (!url) {
    console.warn(
      '[@dialectlabs/blinks] Proxy URL is not set, proxy will be disabled',
    );
    proxyUrl = null;
    return;
  }

  try {
    new URL(url);
  } catch (e) {
    console.warn('[@dialectlabs/blinks] Invalid proxy URL', e);
    return;
  }

  proxyUrl = url;
}

export function proxify(url: string): URL {
  const baseUrl = new URL(url);
  if (baseUrl.hostname === 'localhost' || baseUrl.hostname === '127.0.0.1') {
    return baseUrl;
  }
  if (!proxyUrl) {
    return baseUrl;
  }
  const proxifiedUrl = new URL(proxyUrl);
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl;
}

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
  if (shouldIgnoreProxy(baseUrl)) {
    return baseUrl;
  }
  const proxifiedUrl = new URL(proxyUrl!);
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl;
}

export function proxifyImage(url: string): URL {
  const baseUrl = new URL(url);
  if (shouldIgnoreProxy(baseUrl)) {
    return baseUrl;
  }
  const proxifiedUrl = new URL(`${proxyUrl!}/image`);
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl;
}

function shouldIgnoreProxy(url: URL): boolean {
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return true;
  }
  if (!proxyUrl) {
    return true;
  }
  return false;
}

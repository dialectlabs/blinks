import { BLINK_CLIENT_KEY_HEADER, clientKey } from './client-key.ts';

let proxyUrl: string | null = 'https://proxy.dial.to';

export type ProxifiedResult = {
  readonly url: URL;
  readonly headers: Record<string, string>;
};

export function setProxyUrl(url: string): void {
  if (!url) {
    console.warn(
      '[@dialectlabs/blinks-core] Proxy URL is not set, proxy will be disabled',
    );
    proxyUrl = null;
    return;
  }

  try {
    new URL(url);
  } catch (e) {
    console.warn('[@dialectlabs/blinks-core] Invalid proxy URL', e);
    return;
  }

  proxyUrl = url;
}

export function proxify(url: string): ProxifiedResult {
  return createProxifiedUrl(url);
}

export function proxifyImage(url: string): ProxifiedResult {
  return createProxifiedUrl(url, 'image');
}

export function proxifyMetadata(url: string): ProxifiedResult {
  return createProxifiedUrl(url, 'metadata');
}

export function isProxified(url: string): boolean {
  return proxyUrl ? url.startsWith(proxyUrl) : false;
}

function createProxifiedUrl(url: string, endpoint?: string): ProxifiedResult {
  const incomingUrl = new URL(url);
  if (!proxyUrl || shouldIgnoreProxy(incomingUrl)) {
    return {
      url: incomingUrl,
      headers: {},
    };
  }

  if (shouldPreserveOriginal(incomingUrl)) {
    return {
      url: incomingUrl,
      headers: getProxifiedHeaders(),
    };
  }

  const proxifiedUrl = endpoint
    ? new URL(endpoint, proxyUrl)
    : new URL(proxyUrl);
  proxifiedUrl.searchParams.set('url', url);

  return {
    url: proxifiedUrl,
    headers: getProxifiedHeaders(),
  };
}

function getProxifiedHeaders(): Record<string, string> {
  return {
    ...(clientKey && { [BLINK_CLIENT_KEY_HEADER]: clientKey }),
  };
}

// completely disable proxy
export function shouldIgnoreProxy(url: URL): boolean {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

// preserve headers but since the request is already going to a dial.to service, we don't need to wrap it with a proxy
export function shouldPreserveOriginal(url: URL): boolean {
  return url.hostname === 'api.dial.to';
}

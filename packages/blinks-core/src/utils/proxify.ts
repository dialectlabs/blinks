import { BLINK_CLIENT_KEY_HEADER, clientKey } from './client-key.ts';

let proxyUrl: string | null = 'https://proxy.dial.to';

export type ProxifiedResult = {
  readonly url: URL;
  readonly headers: Record<string, string>;
};

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

export function proxify(url: string): ProxifiedResult {
  return createProxifiedUrl(url);
}

export function proxifyImage(url: string): ProxifiedResult {
  return createProxifiedUrl(url, 'image');
}

export function proxifyMetadata(url: string): ProxifiedResult {
  return createProxifiedUrl(url, 'metadata');
}

function createProxifiedUrl(url: string, endpoint?: string): ProxifiedResult {
  const baseUrl = new URL(url);
  if (!proxyUrl || shouldIgnoreProxy(baseUrl)) {
    return {
      url: baseUrl,
      headers: {},
    };
  }

  const proxifiedUrl = new URL(proxyUrl);
  if (endpoint) {
    proxifiedUrl.pathname += `/${endpoint}`;
  }
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

function shouldIgnoreProxy(url: URL): boolean {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

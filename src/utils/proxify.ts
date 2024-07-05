let proxyUrl = 'https://proxy.dial.to';

export function setProxyUrl(url: string) {
  proxyUrl = url;
}

export function proxify(url: string) {
  const proxifiedUrl = new URL(proxyUrl);
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl;
}

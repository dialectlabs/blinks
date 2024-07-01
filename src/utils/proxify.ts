const proxyUrl = 'https://proxy.dial.to';

export function proxify(url: string) {
  const proxifiedUrl = new URL(proxyUrl);
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl;
}

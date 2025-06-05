import { describe, expect, test } from 'bun:test';
import { secureFetch, BlinksRegistry, type BlinksRegistryConfig } from '../../src';

function withMockedFetch(mock: typeof fetch, fn: () => Promise<void>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock as any;
  return fn().finally(() => {
    globalThis.fetch = originalFetch;
  });
}

describe('secureFetch', () => {
  test('follows redirect when target is trusted', async () => {
    const fetchMock = async (url: RequestInfo | URL): Promise<Response> => {
      const u = url.toString();
      if (u.endsWith('/redirect')) {
        return new Response(null, { status: 302, headers: { location: '/final' } });
      }
      if (u.endsWith('/final')) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(null, { status: 404 });
    };

    const config: BlinksRegistryConfig = {
      actions: [{ host: 'example.com', state: 'trusted' }],
      websites: [],
      interstitials: [],
    };
    BlinksRegistry.getInstance(config);

    await withMockedFetch(fetchMock, async () => {
      const response = await secureFetch('https://example.com/redirect');
      const data = await response.json();
      expect(data).toEqual({ ok: true });
    });
  });

  test('throws on redirect to malicious url', async () => {
    const fetchMock = async (url: RequestInfo | URL): Promise<Response> => {
      const u = url.toString();
      if (u.endsWith('/redirect')) {
        return new Response(null, {
          status: 302,
          headers: { location: 'https://evil.com/final' },
        });
      }
      return new Response(null, { status: 404 });
    };

    const config: BlinksRegistryConfig = {
      actions: [
        { host: 'example.com', state: 'trusted' },
        { host: 'evil.com', state: 'malicious' },
      ],
      websites: [],
      interstitials: [],
    };
    BlinksRegistry.getInstance(config);

    await withMockedFetch(fetchMock, async () => {
      await expect(secureFetch('https://example.com/redirect')).rejects.toThrow();
    });
  });
});

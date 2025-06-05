import { describe, expect, test, jest } from 'bun:test';
import { secureFetch, BlinksRegistry, type BlinksRegistryConfig } from '../../src';

describe('secureFetch', () => {
  test('follows redirect when target is trusted', async () => {
    const fetchMock = jest.fn(async (url: RequestInfo | URL): Promise<Response> => {
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
    });

    const config: BlinksRegistryConfig = {
      actions: [{ host: 'example.com', state: 'trusted' }],
      websites: [],
      interstitials: [],
    };
    BlinksRegistry.getInstance(config);

    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);

    try {
      const response = await secureFetch('https://example.com/redirect');
      const data = await response.json();
      expect(data).toEqual({ ok: true });
    } finally {
      spy.mockRestore();
    }
  });

  test('throws on redirect to malicious url', async () => {
    const fetchMock = jest.fn(async (url: RequestInfo | URL): Promise<Response> => {
      const u = url.toString();
      if (u.endsWith('/redirect')) {
        return new Response(null, {
          status: 302,
          headers: { location: 'https://evil.com/final' },
        });
      }
      return new Response(null, { status: 404 });
    });

    const config: BlinksRegistryConfig = {
      actions: [
        { host: 'example.com', state: 'trusted' },
        { host: 'evil.com', state: 'malicious' },
      ],
      websites: [],
      interstitials: [],
    };
    BlinksRegistry.getInstance(config);

    const spy = jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);

    try {
      await expect(secureFetch('https://example.com/redirect')).rejects.toThrow();
    } finally {
      spy.mockRestore();
    }
  });
});

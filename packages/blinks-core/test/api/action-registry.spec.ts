import { describe, expect, test } from 'bun:test';
import { BlinksRegistry, type BlinksRegistryConfig } from '../../src';

describe('BlinksRegistry', () => {
  describe('actions lookup', () => {
    test('should return the correct RegisteredAction for a known host', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };

      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'https://trusted.com/some-path';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toEqual({ host: 'trusted.com', state: 'trusted' });
    });

    test('should return null for an unknown host', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'https://unknown.com/some-path';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toBeNull();
    });

    test('should correctly handle URL objects', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = new URL('https://malicious.com/some-path');

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toEqual({ host: 'malicious.com', state: 'malicious' });
    });

    test('should return null for an invalid URL string', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'not-a-valid-url';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toBeNull();
    });
  });

  describe('websites lookup', () => {
    test('should return the correct RegisteredEntity for a known host', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'https://trusted.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'website');

      // assert
      expect(result).toEqual({ host: 'trusted.com', state: 'trusted' });
    });

    test('should return null for an unknown host', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'https://unknown.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'website');

      // assert
      expect(result).toBeNull();
    });

    test('should correctly handle URL objects', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = new URL('https://malicious.com/some-path');

      // act
      const result = actionsRegistry.lookup(input, 'website');

      // assert
      expect(result).toEqual({ host: 'malicious.com', state: 'malicious' });
    });

    test('should return null for an invalid URL string', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'not-a-valid-url';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toBeNull();
    });
    
    test('should validate underlying URL when apiUrl param is used', () => {
      const config: BlinksRegistryConfig = {
        actions: [{ host: 'example.com', state: 'trusted' }],
        websites: [],
        interstitials: [],
      };
      const registry = BlinksRegistry.getInstance(config);
      const proxied = 'https://api.dial.to/v1/blink?apiUrl=https://example.com/path';
      const result = registry.lookup(proxied);
      expect(result).toEqual({ host: 'example.com', state: 'trusted' });
    });
  });

  describe('interstitials lookup', () => {
    test('should return the correct RegisteredEntity for a known host', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'https://trusted.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toEqual({ host: 'trusted.com', state: 'trusted' });
    });

    test('should return null for an unknown host', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'https://unknown.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toBeNull();
    });

    test('should correctly handle URL objects', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = new URL('https://malicious.com/some-path');

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toEqual({ host: 'malicious.com', state: 'malicious' });
    });

    test('should return null for an invalid URL string', () => {
      // arrange
      const actionsConfig: BlinksRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = BlinksRegistry.getInstance(actionsConfig);
      const input = 'not-a-valid-url';

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toBeNull();
    });
  });
});

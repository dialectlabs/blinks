import { describe, expect, test } from 'bun:test';
import {
  ActionsRegistry,
  type ActionsRegistryConfig,
} from '../../src/api/ActionsRegistry.ts';

describe('ActionsRegistry', () => {
  describe('actions lookup', () => {
    test('should return the correct RegisteredAction for a known host', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };

      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'https://trusted.com/some-path';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toEqual({ host: 'trusted.com', state: 'trusted' });
    });

    test('should return null for an unknown host', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'https://unknown.com/some-path';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toBeNull();
    });

    test('should correctly handle URL objects', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = new URL('https://malicious.com/some-path');

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toEqual({ host: 'malicious.com', state: 'malicious' });
    });

    test('should return null for an invalid URL string', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        websites: [],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
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
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'https://trusted.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'website');

      // assert
      expect(result).toEqual({ host: 'trusted.com', state: 'trusted' });
    });

    test('should return null for an unknown host', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'https://unknown.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'website');

      // assert
      expect(result).toBeNull();
    });

    test('should correctly handle URL objects', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = new URL('https://malicious.com/some-path');

      // act
      const result = actionsRegistry.lookup(input, 'website');

      // assert
      expect(result).toEqual({ host: 'malicious.com', state: 'malicious' });
    });

    test('should return null for an invalid URL string', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
        interstitials: [],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'not-a-valid-url';

      // act
      const result = actionsRegistry.lookup(input);

      // assert
      expect(result).toBeNull();
    });
  });

  describe('interstitials lookup', () => {
    test('should return the correct RegisteredEntity for a known host', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'https://trusted.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toEqual({ host: 'trusted.com', state: 'trusted' });
    });

    test('should return null for an unknown host', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'https://unknown.com/some-path';

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toBeNull();
    });

    test('should correctly handle URL objects', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = new URL('https://malicious.com/some-path');

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toEqual({ host: 'malicious.com', state: 'malicious' });
    });

    test('should return null for an invalid URL string', () => {
      // arrange
      const actionsConfig: ActionsRegistryConfig = {
        actions: [],
        websites: [],
        interstitials: [
          { host: 'trusted.com', state: 'trusted' },
          { host: 'malicious.com', state: 'malicious' },
        ],
      };
      const actionsRegistry = ActionsRegistry.getInstance(actionsConfig);
      const input = 'not-a-valid-url';

      // act
      const result = actionsRegistry.lookup(input, 'interstitial');

      // assert
      expect(result).toBeNull();
    });
  });
});

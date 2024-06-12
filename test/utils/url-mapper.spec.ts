import { describe, expect, test } from 'bun:test';
import {
  ActionsURLMapper,
  type ActionsJsonConfig,
} from '../../src/utils/url-mapper.ts';

describe('ActionsURLMapper', () => {
  describe('Exact match rules', () => {
    test('should map exact match absolute URL correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: 'https://website.com/exact-path',
            apiPath: 'https://api.website.com/exact-path',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://website.com/exact-path';
      const expected = 'https://api.website.com/exact-path';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map exact match relative URL correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/exact-path',
            apiPath: '/api/exact-path',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://website.com/exact-path';
      const expected = 'https://website.com/api/exact-path';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should preserve query parameters in exact match', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: 'https://website.com/exact-path',
            apiPath: 'https://api.website.com/exact-path',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://website.com/exact-path?param=value';
      const expected = 'https://api.website.com/exact-path?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should not match and return null', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: 'https://website.com/another-path',
            apiPath: 'https://api.website.com/another-path',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://website.com/exact-path?param=value';
      const expected = null;

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });
  });

  describe('Wildcard match rules', () => {
    test('should map multiple url segments with wildcard correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/trade/**', apiPath: '/api/trade/**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/1/2/3/4?param=value';
      const expected = 'https://example.com/api/trade/1/2/3/4?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map relative path with wildcard correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/trade/**', apiPath: '/api/trade/**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input =
        'https://example.com/trade/solana_monkey_business?param=value';
      const expected =
        'https://example.com/api/trade/solana_monkey_business?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map mixed DNS rule with absolute api path correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/donate/**',
            apiPath: 'https://api.example.com/v1/donate/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.org/donate/artist?recipient=123';
      const expected = 'https://api.example.com/v1/donate/artist?recipient=123';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map idempotent rule correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/api/**', apiPath: '/api/**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://api.example.org/api/donate/aa?a=b';
      const expected = 'https://api.example.org/api/donate/aa?a=b';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map full URL with wildcard correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: 'https://website.com/special/**',
            apiPath: 'https://api.website.com/special/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = new URL('https://website.com/special/feature/2?tag=228');
      const expected = 'https://api.website.com/special/feature/2?tag=228';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map URL with multiple wildcards correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/category/**/item/**',
            apiPath: '/api/category/**/item/path/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/category/123/item/456?filter=true';
      const expected =
        'https://example.com/api/category/123/item/path/456?filter=true';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('can map URL with multiple wildcards correctly if starting with wildcard', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/**/category/**',
            apiPath: '/api/**/category/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input =
        'https://example.com/prefix/sub-path/category/123/item/456?filter=true';
      const expected =
        'https://example.com/api/prefix/sub-path/category/123/item/456?filter=true';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('can map URL with multiple wildcards correctly if no match', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/category/**/item/**',
            apiPath: '/api/category/**/item/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input =
        'https://example.com/category/123/not-expected/456?filter=true';
      const expected = null;

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map multiple url segments with ** wildcard correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/trade/**',
            apiPath: 'https://actions.dialect.to/api/sanctum/trade/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/1/2/3/4?param=value';
      const expected =
        'https://actions.dialect.to/api/sanctum/trade/1/2/3/4?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map path with * and ** wildcards correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/trade/a/*/c/**',
            apiPath: 'https://actions.dialect.to/api/sanctum/trade/a/*/c/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/a/b/c/d/e/f?param=value';
      const expected =
        'https://actions.dialect.to/api/sanctum/trade/a/b/c/d/e/f?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map path with multiple * and ** wildcards correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/trade/a/*/*/**',
            apiPath: 'https://actions.dialect.to/api/sanctum/trade/a/*/*/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/a/b/c/d/e/f?param=value';
      const expected =
        'https://actions.dialect.to/api/sanctum/trade/a/b/c/d/e/f?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map path with single segment wildcard correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/trade/a/*',
            apiPath: 'https://actions.dialect.to/api/sanctum/trade/a/*',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/a/b?param=value';
      const expected =
        'https://actions.dialect.to/api/sanctum/trade/a/b?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should not map path if * does not match a single segment', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/trade/a/*',
            apiPath: 'https://actions.dialect.to/api/sanctum/trade/a/*',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/a/b/c?param=value';
      const expected = null;

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map full URL with ** wildcard correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: 'https://example.com/trade/**',
            apiPath: 'https://actions.dialect.to/api/sanctum/trade/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/trade/path/segment?param=value';
      const expected =
        'https://actions.dialect.to/api/sanctum/trade/path/segment?param=value';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });
  });

  describe('Wildcard catch-all rules', () => {
    test('should map wildcard rule correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/**', apiPath: '/api/actions/interstitial**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input =
        'http://localhost:3000/?actionUrl=http://localhost:3000/api/actions/jupiter/swap/SOL-USDC';
      const expected =
        'http://localhost:3000/api/actions/interstitial?actionUrl=http://localhost:3000/api/actions/jupiter/swap/SOL-USDC';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map wildcard rule without slash correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/**', apiPath: '/api/actions/interstitial**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input =
        'http://localhost:3000?actionUrl=http://localhost:3000/api/actions/jupiter/swap/SOL-USDC';
      const expected =
        'http://localhost:3000/api/actions/interstitial?actionUrl=http://localhost:3000/api/actions/jupiter/swap/SOL-USDC';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map HTTPS wildcard rule correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/**', apiPath: '/api/actions/interstitial**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input =
        'https://actions.example.com?actionUrl=https://actions.example.com/api/actions/jupiter/swap/SOL-EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';
      const expected =
        'https://actions.example.com/api/actions/interstitial?actionUrl=https://actions.example.com/api/actions/jupiter/swap/SOL-EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });
  });

  describe('Edge cases', () => {
    test('should return null for non-mapped path', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [{ pathPattern: '/trade/**', apiPath: '/api/trade/**' }],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.org/non-mapped-path/aa?a=b';
      const expected = null;

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map URL with multiple rules and select correct one', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: '/first/**',
            apiPath: '/api/first/**',
          },
          {
            pathPattern: '/second/**',
            apiPath: '/api/second/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/second/path?data=test';
      const expected = 'https://example.com/api/second/path?data=test';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });

    test('should map full URL with query parameters correctly', () => {
      // arrange
      const actionsConfig: ActionsJsonConfig = {
        rules: [
          {
            pathPattern: 'https://example.com/full/**',
            apiPath: 'https://api.example.com/full/**',
          },
        ],
      };
      const actionsUrlMapper = new ActionsURLMapper(actionsConfig);
      const input = 'https://example.com/full/path?query=param';
      const expected = 'https://api.example.com/full/path?query=param';

      // act
      const result = actionsUrlMapper.mapUrl(input);

      // assert
      expect(result).toBe(expected);
    });
  });
});

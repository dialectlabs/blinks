import { describe, expect, test } from 'bun:test';
import { isInterstitial } from '../../src/utils/interstitial-url.ts';

describe('isInterstitialUrl', () => {
  test('should return true and decode the action URL for a valid interstitial URL with solana-action: prefix (URL-encoded)', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana-action%3Ahttps%3A%2F%2Factions.dialect.to%2Fapi%2Fjupiter%2Fswap%3Ftoken%3DSOL';
    const expectedResult = {
      isInterstitial: true,
      decodedActionUrl: 'https://actions.dialect.to/api/jupiter/swap?token=SOL',
    };

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual(expectedResult);
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana: prefix (URL-encoded)', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana%3Ahttps%3A%2F%2Factions.dialect.to%2Fapi%2Fjupiter%2Fswap%3Ftoken%3DSOL';
    const expectedResult = {
      isInterstitial: true,
      decodedActionUrl: 'https://actions.dialect.to/api/jupiter/swap?token=SOL',
    };

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual(expectedResult);
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana-action: prefix (non-URL-encoded)', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana-action:https://actions.dialect.to/api/jupiter/swap';
    const expectedResult = {
      isInterstitial: true,
      decodedActionUrl: 'https://actions.dialect.to/api/jupiter/swap',
    };

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual(expectedResult);
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana: prefix (non-URL-encoded)', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana:https://actions.dialect.to/api/jupiter/swap';
    const expectedResult = {
      isInterstitial: true,
      decodedActionUrl: 'https://actions.dialect.to/api/jupiter/swap',
    };

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual(expectedResult);
  });

  test('should return false for a URL without action parameter', () => {
    // arrange
    const input = 'https://actions.dialect.to/';

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual({ isInterstitial: false });
  });

  test('should return false for a URL with an invalid action parameter', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=invalid-action%3Ahttps%3A%2F%2Factions.dialect.to%2Fapi%2Fjupiter%2Fswap%3Ftoken%3DSOL';

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual({ isInterstitial: false });
  });

  test('should return false for a URL with an action parameter not prefixed with solana or solana-action', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=https%3A%2F%2Factions.dialect.to%2Fapi%2Fjupiter%2Fswap%3Ftoken%3DSOL';

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual({ isInterstitial: false });
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana-action: prefix and additional query parameters (URL-encoded)', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana-action%3Ahttps%3A%2F%2Factions.dialect.to%2Fapi%2Fjupiter%2Fswap%3Ftoken%3DSOL&extraParam=value';
    const expectedResult = {
      isInterstitial: true,
      decodedActionUrl: 'https://actions.dialect.to/api/jupiter/swap?token=SOL',
    };

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual(expectedResult);
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana: prefix and additional query parameters (URL-encoded)', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana%3Ahttps%3A%2F%2Factions.dialect.to%2Fapi%2Fjupiter%2Fswap%3Ftoken%3DSOL&extraParam=value';
    const expectedResult = {
      isInterstitial: true,
      decodedActionUrl: 'https://actions.dialect.to/api/jupiter/swap?token=SOL',
    };

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual(expectedResult);
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana: prefix and invalid URL', () => {
    // arrange
    const input = 'https://actions.dialect.to/?action=solana%3Ainvalid-url';

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual({
      isInterstitial: false,
    });
  });

  test('should return true and decode the action URL for a valid interstitial URL with solana-action: prefix and invalid URL', () => {
    // arrange
    const input =
      'https://actions.dialect.to/?action=solana-action%3Ainvalid-url';

    // act
    const result = isInterstitial(input);

    // assert
    expect(result).toEqual({
      isInterstitial: false,
    });
  });
});

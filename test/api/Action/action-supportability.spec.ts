import { describe, expect, test } from 'bun:test';
import {
  isBlockchainSupported,
  isVersionSupported,
} from '../../../src/api/Action/action-supportability.ts';

describe('isVersionSupported', () => {
  test('returns true when action version is less than client version', () => {
    expect(
      isVersionSupported({
        actionVersion: '2.1.0',
        acceptActionVersion: '2.2.0',
      }),
    ).toBe(true);
    expect(
      isVersionSupported({
        actionVersion: '2.2.0',
        acceptActionVersion: '2.3.0',
      }),
    ).toBe(true);
    expect(
      isVersionSupported({
        actionVersion: '1.0.0',
        acceptActionVersion: '2.2.0',
      }),
    ).toBe(true);
  });

  test('returns true when action version is equal to client version', () => {
    expect(
      isVersionSupported({
        actionVersion: '2.2.0',
        acceptActionVersion: '2.2.0',
      }),
    ).toBe(true);
  });

  test('returns false when action version is greater than client version', () => {
    expect(
      isVersionSupported({
        actionVersion: '2.3.0',
        acceptActionVersion: '2.2.0',
      }),
    ).toBe(false);
    expect(
      isVersionSupported({
        actionVersion: '3.0.0',
        acceptActionVersion: '2.2.0',
      }),
    ).toBe(false);
  });

  test('returns true when action version is not provided and uses baseline version', () => {
    expect(isVersionSupported({ acceptActionVersion: '2.2.0' })).toBe(true);
  });

  test('returns true when acceptActionVersion is not provided and uses default', () => {
    expect(isVersionSupported({ actionVersion: '2.1.0' })).toBe(true);
    expect(isVersionSupported({ actionVersion: '2.2.0' })).toBe(true);
    expect(isVersionSupported({ actionVersion: '2.3.0' })).toBe(false);
  });

  test('returns true when both versions are not provided and uses baseline version', () => {
    expect(isVersionSupported({})).toBe(true);
  });

  test('returns true when action version has patch version less than client version', () => {
    expect(
      isVersionSupported({
        actionVersion: '2.2.1',
        acceptActionVersion: '2.2.2',
      }),
    ).toBe(true);
  });

  test('returns false when action version is an incompatible string', () => {
    expect(
      isVersionSupported({
        actionVersion: 'invalidVersion',
        acceptActionVersion: '2.2.0',
      }),
    ).toBe(false);
  });

  test('returns false when acceptActionVersion is an incompatible string', () => {
    expect(
      isVersionSupported({
        actionVersion: '2.2.0',
        acceptActionVersion: 'invalid.version',
      }),
    ).toBe(false);
  });

  test('returns false when both versions are incompatible strings', () => {
    expect(
      isVersionSupported({
        actionVersion: 'invalid.version',
        acceptActionVersion: 'invalid.version',
      }),
    ).toBe(false);
  });
});

describe('isBlockchainSupported', () => {
  test('returns true when all actionBlockchainIds are supported', () => {
    expect(
      isBlockchainSupported({
        acceptBlockchainIds: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          'ethereum:1',
        ],
        actionBlockchainIds: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      }),
    ).toBe(true);
  });

  test('returns false when some actionBlockchainIds are not supported', () => {
    expect(
      isBlockchainSupported({
        acceptBlockchainIds: ['ethereum:1'],
        actionBlockchainIds: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      }),
    ).toBe(false);
  });

  test('returns true when actionBlockchainIds is not provided and uses baseline', () => {
    expect(
      isBlockchainSupported({
        acceptBlockchainIds: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          'ethereum:1',
        ],
      }),
    ).toBe(true);
  });

  test('returns false when actionBlockchainIds is not provided and baseline is not supported', () => {
    expect(
      isBlockchainSupported({
        acceptBlockchainIds: ['ethereum:1'],
      }),
    ).toBe(false);
  });

  test('returns true when both blockchainIds and actionBlockchainIds are empty', () => {
    expect(
      isBlockchainSupported({
        acceptBlockchainIds: [],
        actionBlockchainIds: [],
      }),
    ).toBe(true);
  });

  test('returns false when blockchainIds is empty and actionBlockchainIds is not', () => {
    expect(
      isBlockchainSupported({
        acceptBlockchainIds: [],
        actionBlockchainIds: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      }),
    ).toBe(false);
  });
});

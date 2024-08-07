import { ACTIONS_SPEC_VERSION } from '../../utils/dependency-versions.ts';
import type { ActionContext } from '../ActionConfig.ts';

/**
 * CAIP-2 Blockchain IDs.
 */
export const BlockchainIds = {
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3',
};

/**
 * Max spec version the Blink client supports.
 */
const MAX_SUPPORTED_ACTION_VERSION = ACTIONS_SPEC_VERSION;
/**
 * Baseline action version to be used when not set by action provider.
 * Defaults to latest release that doesn't support versioning.
 */
const BASELINE_ACTION_VERSION = '1.5.1';
/**
 * Baseline blockchain IDs to be used when not set by action provider.
 * Defaults to Solana mainnet.
 */
const BASELINE_ACTION_BLOCKCHAIN_IDS = [BlockchainIds.SOLANA_MAINNET];

type CheckSupportedParams = {
  supportedBlockchainIds: string[];
};

type IsVersionSupportedParams = {
  actionVersion?: string;
  supportedActionVersion?: string;
};

type IsBlockchainIdSupportedParams = {
  actionBlockchainIds?: string[];
  supportedBlockchainIds: string[];
};

/**
 * Default implementation for checking if an action is supported.
 * Checks if the action version and the action blockchain IDs are supported by blink.
 * @param context Action context.
 * @param supportedBlockchainIds List of CAIP-2 {@link BlockchainIds} the client supports.
 *
 * @see {isVersionSupported}
 * @see {isBlockchainSupported}
 */
export function defaultCheckSupported(
  context: Omit<ActionContext, 'triggeredLinkedAction'>,
  { supportedBlockchainIds }: CheckSupportedParams,
) {
  const { version: actionVersion, blockchainIds: actionBlockchainIds } =
    context.action.metadata;
  return (
    isVersionSupported({
      actionVersion,
    }) &&
    isBlockchainSupported({
      supportedBlockchainIds,
      actionBlockchainIds,
    })
  );
}

/**
 * Check if the action version is supported by blink.
 * @param supportedActionVersion The version the blink supports.
 * @param actionVersion The version of the action.
 *
 * @returns `true` if the action version is less than or equal to the supported ignoring patch version, `false` otherwise.
 */
export function isVersionSupported({
  supportedActionVersion = MAX_SUPPORTED_ACTION_VERSION,
  actionVersion = BASELINE_ACTION_VERSION,
}: IsVersionSupportedParams): boolean {
  return compareSemverIgnoringPatch(actionVersion, supportedActionVersion) <= 0;
}

function compareSemverIgnoringPatch(v1: string, v2: string): number {
  const [major1, minor1] = v1.split('.').map(Number);
  const [major2, minor2] = v2.split('.').map(Number);
  if (major1 !== major2) {
    return major1 - major2;
  } else if (minor1 !== minor2) {
    return minor1 - minor2;
  }
  return 0;
}

/**
 * Check if action blockchain IDs are supported by the blink.
 *
 * @param supportedBlockchainIds List of CAIP-2 blockchain IDs the client supports.
 * @param actionBlockchainIds List of CAIP-2 blockchain IDs the action supports.
 *
 * @returns `true` if all action blockchain IDs are supported by blink, `false` otherwise.
 *
 * @see BlockchainIds
 */
export function isBlockchainSupported({
  supportedBlockchainIds,
  actionBlockchainIds = BASELINE_ACTION_BLOCKCHAIN_IDS,
}: IsBlockchainIdSupportedParams): boolean {
  const sanitizedSupportedBlockchainIds = supportedBlockchainIds.map((it) =>
    it.trim(),
  );
  const sanitizedActionBlockchainIds = actionBlockchainIds.map((it) =>
    it.trim(),
  );
  return sanitizedActionBlockchainIds.every((chain) =>
    sanitizedSupportedBlockchainIds.includes(chain),
  );
}

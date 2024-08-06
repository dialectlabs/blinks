import { ACTIONS_SPEC_VERSION } from '../../utils/dependency-versions.ts';
import type { ActionContext } from '../ActionConfig.ts';

/**
 * CAIP-2 Blockchain IDs.
 */
export const BlockchainIds = {
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
};

/**
 * Max spec version the Blink client supports.
 */
const ACCEPT_ACTION_VERSION = ACTIONS_SPEC_VERSION;
/**
 * Baseline action version to be used when not set by action provider. Defaults to latest pre-versioning actions spec release.
 */
const BASELINE_ACTION_VERSION = '1.5.1';
/**
 * Baseline blockchain IDs to be used when not set by action provider. Defaults to Solana mainnet.
 */
const BASELINE_ACTION_BLOCKCHAIN_IDS = [
  BlockchainIds.SOLANA_MAINNET, // Solana mainnet CAIP-2 Blockchain ID
];

type CheckSupportedParams = {
  acceptBlockchainIds: string[];
};

type IsVersionCompatibleParams = {
  actionVersion?: string;
  acceptActionVersion?: string;
};

type IsBlockchainSupportedParams = {
  actionBlockchainIds?: string[];
  acceptBlockchainIds: string[];
};

export function defaultCheckSupported(
  context: Omit<ActionContext, 'triggeredLinkedAction'>,
  { acceptBlockchainIds }: CheckSupportedParams,
) {
  return (
    isVersionSupported({
      actionVersion: context.action.metadata.version,
    }) &&
    isBlockchainSupported({
      acceptBlockchainIds,
      actionBlockchainIds: context.action.metadata.blockchainIds,
    })
  );
}

export function isVersionSupported({
  acceptActionVersion = ACCEPT_ACTION_VERSION,
  actionVersion = BASELINE_ACTION_VERSION,
}: IsVersionCompatibleParams): boolean {
  return (
    compareSemverVersionsIgnoringPatch(actionVersion, acceptActionVersion) <= 0
  );
}

function compareSemverVersionsIgnoringPatch(v1: string, v2: string): number {
  const [major1, minor1] = v1.split('.').map(Number);
  const [major2, minor2] = v2.split('.').map(Number);
  if (major1 !== major2) {
    return major1 - major2;
  } else if (minor1 !== minor2) {
    return minor1 - minor2;
  }
  return 0;
}

export function isBlockchainSupported({
  acceptBlockchainIds,
  actionBlockchainIds = BASELINE_ACTION_BLOCKCHAIN_IDS,
}: IsBlockchainSupportedParams): boolean {
  const sanitizedAcceptBlockchainIds = acceptBlockchainIds.map((it) =>
    it.trim(),
  );
  return actionBlockchainIds.every((chain) =>
    sanitizedAcceptBlockchainIds.includes(chain),
  );
}

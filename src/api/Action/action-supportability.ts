import { BlockchainIds, BlockchainNames } from '../../utils/caip-2.ts';
import { ACTIONS_SPEC_VERSION } from '../../utils/dependency-versions.ts';
import type { Action } from './Action.ts';

/**
 * Max spec version the Blink client supports.
 */
export const MAX_SUPPORTED_ACTION_VERSION = ACTIONS_SPEC_VERSION;

export const DEFAULT_SUPPORTED_BLOCKCHAIN_IDS = [
  BlockchainIds.SOLANA_MAINNET,
  BlockchainIds.SOLANA_DEVNET,
];

/**
 * Baseline action version to be used when not set by action provider.
 * Defaults to latest release that doesn't support versioning.
 */
export const BASELINE_ACTION_VERSION = '2.0.0';
/**
 * Baseline blockchain IDs to be used when not set by action provider.
 * Defaults to Solana mainnet.
 */
export const BASELINE_ACTION_BLOCKCHAIN_IDS = [BlockchainIds.SOLANA_MAINNET];

type IsVersionSupportedParams = {
  actionVersion: string;
  supportedActionVersion: string;
};

type IsBlockchainIdSupportedParams = {
  actionBlockchainIds: string[];
  supportedBlockchainIds: string[];
};

export type ActionSupportability =
  | {
      isSupported: true;
    }
  | {
      isSupported: false;
      message: string;
    };

export type ActionSupportStrategy = (
  action: Action,
) => Promise<ActionSupportability>;

/**
 * Default implementation for checking if an action is supported.
 * Checks if the action version and the action blockchain IDs are supported by blink.
 * @param action Action.
 *
 * @see {isVersionSupported}
 * @see {isBlockchainSupported}
 */
export const defaultActionSupportStrategy: ActionSupportStrategy = async (
  action,
) => {
  const { version: actionVersion, blockchainIds: actionBlockchainIds } =
    action.metadata;
  const supportedActionVersion = MAX_SUPPORTED_ACTION_VERSION;
  const supportedBlockchainIds = !action.adapterUnsafe
    ? action.metadata.blockchainIds // Assuming action is supported if this happens for optimistic compatibility
    : action.adapterUnsafe.metadata.supportedBlockchainIds;

  const versionSupported = isVersionSupported({
    actionVersion,
    supportedActionVersion,
  });
  const blockchainSupported = isBlockchainSupported({
    actionBlockchainIds,
    supportedBlockchainIds,
  });

  const actionBlockchainNames = actionBlockchainIds.map(
    (id) => BlockchainNames[id] ?? id,
  );

  if (!versionSupported && !blockchainSupported) {
    const blockchainMessage =
      actionBlockchainIds.length === 1
        ? `blockchain ${actionBlockchainNames[0]}`
        : `blockchains ${actionBlockchainNames.join(', ')}`;
    return {
      isSupported: false,
      message: `Action version ${actionVersion} and ${blockchainMessage} are not supported by the Blink client.`,
    };
  }

  if (!versionSupported) {
    return {
      isSupported: false,
      message: `Action version is not supported by the Blink client.`,
    };
  }

  if (!blockchainSupported) {
    const blockchainMessage =
      actionBlockchainIds.length === 1
        ? `Action blockchain ${actionBlockchainNames[0]} is not supported by the Blink client.`
        : `Action blockchains ${actionBlockchainNames.join(', ')} are not supported by the Blink client.`;

    return {
      isSupported: false,
      message: blockchainMessage,
    };
  }
  return {
    isSupported: true,
  };
};

/**
 * Check if the action version is supported by blink.
 * @param supportedActionVersion The version the blink supports.
 * @param actionVersion The version of the action.
 *
 * @returns `true` if the action version is less than or equal to the supported ignoring patch version, `false` otherwise.
 */
export function isVersionSupported({
  supportedActionVersion,
  actionVersion,
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
  actionBlockchainIds,
}: IsBlockchainIdSupportedParams): boolean {
  if (actionBlockchainIds.length === 0 || supportedBlockchainIds.length === 0) {
    return false;
  }
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

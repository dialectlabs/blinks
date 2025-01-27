import { BlockchainIds, getShortBlockchainName } from '../../utils/caip-2.ts';
import { ACTIONS_SPEC_VERSION } from '../../utils/dependency-versions.ts';
import type { BlinkAdapter } from '../BlinkConfig.ts';
import type { BlinkInstance } from './BlinkInstance.ts';

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
export const BASELINE_ACTION_VERSION = '2.2';
/**
 * Baseline blockchain IDs to be used when not set by action provider.
 * Defaults to Solana mainnet.
 */
export const BASELINE_BLINK_BLOCKCHAIN_IDS = [BlockchainIds.SOLANA_MAINNET];

type IsVersionSupportedParams = {
  actionVersion: string;
  supportedActionVersion: string;
};

type IsBlockchainIdSupportedParams = {
  actionBlockchainIds: string[];
  supportedBlockchainIds: string[];
};

export type BlinkSupportability =
  | {
      isSupported: true;
    }
  | {
      isSupported: false;
      message: string;
    };

export type BlinkSupportStrategy = (
  action: BlinkInstance,
  adapter: BlinkAdapter,
) => Promise<BlinkSupportability>;

/**
 * Default implementation for checking if a blink is supported.
 * Checks if the action version and the action blockchain IDs are supported by blink.
 * @param blink BlinkInstance.
 * @param adapter BlinkAdapter.
 *
 * @see {isVersionSupported}
 * @see {isBlockchainSupported}
 */
export const defaultBlinkSupportStrategy: BlinkSupportStrategy = async (
  blink,
  adapter,
) => {
  const { version: actionSpecVersion, blockchainIds: blinkBlockchainIds } =
    blink.metadata;

  // Will be displayed in the future once we remove backward compatibility fallbacks for blockchains and version
  if (
    !actionSpecVersion ||
    !blinkBlockchainIds ||
    blinkBlockchainIds.length === 0
  ) {
    return {
      isSupported: false,
      message:
        'Action compatibility metadata is not set. Please contact the action provider.',
    };
  }

  const supportedActionVersion = MAX_SUPPORTED_ACTION_VERSION;
  const supportedBlockchainIds = adapter.metadata.supportedBlockchainIds;

  const versionSupported = isVersionSupported({
    actionVersion: actionSpecVersion,
    supportedActionVersion,
  });
  const blockchainSupported = isBlockchainSupported({
    actionBlockchainIds: blinkBlockchainIds,
    supportedBlockchainIds,
  });

  const notSupportedBlockchainIds = blinkBlockchainIds.filter(
    (id) => !supportedBlockchainIds.includes(id),
  );

  const notSupportedActionBlockchainNames = notSupportedBlockchainIds.map(
    getShortBlockchainName,
  );

  if (!versionSupported && !blockchainSupported) {
    const blockchainMessage =
      notSupportedActionBlockchainNames.length === 1
        ? `blockchain ${notSupportedActionBlockchainNames[0]}`
        : `blockchains ${notSupportedActionBlockchainNames.join(', ')}`;
    return {
      isSupported: false,
      message: `Action version ${actionSpecVersion} and ${blockchainMessage} are not supported by your Blink client.`,
    };
  }

  if (!versionSupported) {
    return {
      isSupported: false,
      message: `Action version ${actionSpecVersion} is not supported by your Blink client.`,
    };
  }

  if (!blockchainSupported) {
    const blockchainMessage =
      notSupportedActionBlockchainNames.length === 1
        ? `Action blockchain ${notSupportedActionBlockchainNames[0]} is not supported by your Blink client.`
        : `Action blockchains ${notSupportedActionBlockchainNames.join(', ')} are not supported by your Blink client.`;

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

export {
  BASELINE_BLINK_BLOCKCHAIN_IDS as BASELINE_ACTION_BLOCKCHAIN_IDS,
  defaultBlinkSupportStrategy as defaultActionSupportStrategy,
  type BlinkSupportability as ActionSupportability,
  type BlinkSupportStrategy as ActionSupportStrategy,
};

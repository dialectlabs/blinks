import { AbstractActionComponent, type BlinkInstance } from './BlinkInstance';
import type { SignMessageData } from './actions-spec.ts';

export interface BlinkExecutionContext {
  originalUrl: string;
  action: BlinkInstance;
  actionType: 'trusted' | 'malicious' | 'unknown';
  triggeredLinkedAction: AbstractActionComponent;
}

/**
 * Metadata for the blink adapter.
 *
 * @property supportedBlockchainIds List of CAIP-2 blockchain IDs the adapter supports.
 *
 * @see {BlockchainIds}
 */
export interface BlinkAdapterMetadata {
  /**
   * List of CAIP-2 blockchain IDs the adapter supports.
   */
  supportedBlockchainIds: string[];
}

export interface BlinkAdapter {
  metadata: BlinkAdapterMetadata;
  connect: (context: BlinkExecutionContext) => Promise<string | null>;
  signTransaction: (
    tx: string,
    context: BlinkExecutionContext,
  ) => Promise<{ signature: string } | { error: string }>;
  confirmTransaction: (
    signature: string,
    context: BlinkExecutionContext,
  ) => Promise<void>;
  signMessage: (
    data: string | SignMessageData,
    context: BlinkExecutionContext,
  ) => Promise<{ signature: string } | { error: string }>;
}

export type {
  BlinkAdapter as ActionAdapter,
  BlinkExecutionContext as ActionExecutionContext,
};

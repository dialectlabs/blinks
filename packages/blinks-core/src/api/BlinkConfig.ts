import { Connection } from '@solana/web3.js';
import {
  type BlinkInstance,
  AbstractActionComponent,
  DEFAULT_SUPPORTED_BLOCKCHAIN_IDS,
} from './Action';
import type { SignMessageData } from './actions-spec.ts';

export interface BlinkExecutionContext {
  originalUrl: string;
  action: BlinkInstance;
  actionType: 'trusted' | 'malicious' | 'unknown';
  triggeredLinkedAction: AbstractActionComponent;
}

export interface IncomingBlinkConfig {
  rpcUrl: string;
  adapter: Pick<BlinkAdapter, 'connect' | 'signTransaction' | 'signMessage'> &
    Partial<Pick<BlinkAdapter, 'metadata'>>;
}

/**
 * Metadata for an blink adapter.
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

export class BlinkConfig implements BlinkAdapter {
  private static readonly CONFIRM_TIMEOUT_MS = 60000 * 1.2; // 20% extra time
  private static readonly DEFAULT_METADATA: BlinkAdapterMetadata = {
    supportedBlockchainIds: DEFAULT_SUPPORTED_BLOCKCHAIN_IDS,
  };
  private connection: Connection;

  constructor(
    rpcUrlOrConnection: string | Connection,
    private adapter: IncomingBlinkConfig['adapter'],
  ) {
    if (!rpcUrlOrConnection) {
      throw new Error('rpcUrl or connection is required');
    }

    this.connection =
      typeof rpcUrlOrConnection === 'string'
        ? new Connection(rpcUrlOrConnection, 'confirmed')
        : rpcUrlOrConnection;
  }

  get metadata() {
    return this.adapter.metadata ?? BlinkConfig.DEFAULT_METADATA;
  }

  signTransaction(tx: string, context: BlinkExecutionContext) {
    return this.adapter.signTransaction(tx, context);
  }

  confirmTransaction(signature: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      const start = Date.now();

      const confirm = async () => {
        if (Date.now() - start >= BlinkConfig.CONFIRM_TIMEOUT_MS) {
          rej(new Error('Unable to confirm transaction: timeout reached'));
          return;
        }

        try {
          const status = await this.connection.getSignatureStatus(signature);

          // if error present, transaction failed
          if (status.value?.err) {
            rej(
              new Error(
                `Transaction execution failed, check wallet for details`,
              ),
            );
            return;
          }

          // if has confirmations, transaction is successful
          if (status.value && status.value.confirmations !== null) {
            res();
            return;
          }
        } catch (e) {
          console.error(
            '[@dialectlabs/blinks] Error confirming transaction',
            e,
          );
        }

        setTimeout(confirm, 3000);
      };

      confirm();
    });
  }

  async signMessage(
    data: string | SignMessageData,
    context: BlinkExecutionContext,
  ): Promise<{ signature: string } | { error: string }> {
    return this.adapter.signMessage(data, context);
  }

  async connect(context: BlinkExecutionContext) {
    try {
      return await this.adapter.connect(context);
    } catch {
      return null;
    }
  }
}

export { BlinkConfig as ActionConfig, type BlinkAdapter as ActionAdapter };

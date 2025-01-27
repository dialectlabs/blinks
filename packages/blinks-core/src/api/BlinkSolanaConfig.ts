import { Connection } from '@solana/web3.js';
import type { SignMessageData } from './actions-spec.ts';
import type {
  BlinkAdapter,
  BlinkAdapterMetadata,
  BlinkExecutionContext,
} from './BlinkAdapter.ts';
import { DEFAULT_SUPPORTED_BLOCKCHAIN_IDS } from './BlinkInstance';

export interface IncomingBlinkConfig {
  rpcUrl: string;
  adapter: Pick<BlinkAdapter, 'connect' | 'signTransaction' | 'signMessage'> &
    Partial<Pick<BlinkAdapter, 'metadata'>>;
}

export class BlinkSolanaConfig implements BlinkAdapter {
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
    return this.adapter.metadata ?? BlinkSolanaConfig.DEFAULT_METADATA;
  }

  signTransaction(tx: string, context: BlinkExecutionContext) {
    return this.adapter.signTransaction(tx, context);
  }

  confirmTransaction(signature: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      const start = Date.now();

      const confirm = async () => {
        if (Date.now() - start >= BlinkSolanaConfig.CONFIRM_TIMEOUT_MS) {
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
            '[@dialectlabs/blinks-core] Error confirming transaction',
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

export {
  BlinkSolanaConfig as ActionConfig,
  type IncomingBlinkConfig as IncomingActionConfig,
};

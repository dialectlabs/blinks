import { Connection } from '@solana/web3.js';
import { ActionComponent, type Action } from './Action.ts';

export interface ActionContext {
  originalUrl: string;
  action: Action;
  actionType: 'trusted' | 'malicious' | 'unknown';
  triggeredLinkedAction: ActionComponent;
}

export interface IncomingActionConfig {
  rpcUrl: string;
  adapter: {
    connect: (context: ActionContext) => Promise<string>;
    signTransaction: (
      tx: string,
      context: ActionContext,
    ) => Promise<{ signature: string } | { error: string }>;
  };
}

export interface ActionAdapter {
  connect: (context: ActionContext) => Promise<string | null>;
  signTransaction: (
    tx: string,
    context: ActionContext,
  ) => Promise<{ signature: string } | { error: string }>;
  confirmTransaction: (
    signature: string,
    context: ActionContext,
  ) => Promise<void>;
}

export class ActionConfig implements ActionAdapter {
  private static readonly CONFIRM_TIMEOUT_MS = 60000 * 1.2; // 20% extra time
  private connection: Connection;

  constructor(
    rpcUrl: string,
    private adapter: IncomingActionConfig['adapter'],
  ) {
    if (!rpcUrl) {
      throw new Error('rpcUrl is required');
    }

    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async connect(context: ActionContext) {
    try {
      return await this.adapter.connect(context);
    } catch {
      return null;
    }
  }

  signTransaction(tx: string, context: ActionContext) {
    return this.adapter.signTransaction(tx, context);
  }

  confirmTransaction(signature: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      const start = Date.now();

      const confirm = async () => {
        if (Date.now() - start >= ActionConfig.CONFIRM_TIMEOUT_MS) {
          rej(new Error('Unable to confirm transaction'));
          return;
        }

        try {
          const status = await this.connection.getSignatureStatus(signature);

          // if error present, transaction failed
          if (status.value?.err) {
            rej(new Error('Transaction execution failed'));
            return;
          }

          // if has confirmations, transaction is successful
          if (status.value && status.value.confirmations !== null) {
            res();
            return;
          }
        } catch (e) {
          console.error('Error confirming transaction', e);
        }

        setTimeout(confirm, 3000);
      };

      confirm();
    });
  }
}

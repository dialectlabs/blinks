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

  async confirmTransaction(signature: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Unable to confirm transaction');
    }

    try {
      const latestBlockhashData =
        await this.connection.getLatestBlockhash('confirmed');

      const res = await this.connection.confirmTransaction({
        signature,
        lastValidBlockHeight: latestBlockhashData.lastValidBlockHeight,
        blockhash: latestBlockhashData.blockhash,
      });

      if (res.value.err) {
        return Promise.reject(new Error('Transaction execution failed'));
      }
    } catch {
      throw new Error('Unable to confirm transaction');
    }
  }
}

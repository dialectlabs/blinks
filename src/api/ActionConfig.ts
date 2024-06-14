import { Connection } from '@solana/web3.js';

export interface IncomingActionConfig {
  rpcUrl: string;
  adapter: {
    connect: () => Promise<string>;
    signTransaction: (
      tx: string,
    ) => Promise<{ signature: string } | { error: string }>;
  };
}

export interface ActionAdapter {
  connect: () => Promise<string | null>;
  signTransaction: (
    tx: string,
  ) => Promise<{ signature: string } | { error: string }>;
  confirmTransaction: (signature: string) => Promise<void>;
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

  async connect() {
    try {
      return await this.adapter.connect();
    } catch {
      return null;
    }
  }

  signTransaction(tx: string) {
    return this.adapter.signTransaction(tx);
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

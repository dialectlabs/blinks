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

  confirmTransaction(signature: string): Promise<void> {
    let retry = 0;
    const RETRY_TIMEOUT = 5000;
    const MAX_RETRIES = 5;

    return new Promise((res, rej) => {
      const confirm = async () => {
        const latestBlockhash = await this.connection.getLatestBlockhash();
        if (retry > MAX_RETRIES) {
          rej(new Error('Unable to confirm transaction'));
          return;
        }

        retry += 1;

        try {
          const result = await this.connection.confirmTransaction({
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            blockhash: latestBlockhash.blockhash,
            signature,
          });

          if (result.value.err) {
            setTimeout(confirm, RETRY_TIMEOUT);
            return;
          }

          res();
        } catch (e) {
          setTimeout(confirm, RETRY_TIMEOUT);
          return;
        }
      };

      confirm();
    });
  }
}

import { type ActionAdapter } from '@dialectlabs/blinks-core';
import type { SignMessageData } from '@solana/actions-spec';
import { useMemo } from 'react';
import { deserialize, useAccount, useChains, useConnectorClient } from 'wagmi';

import type { ByteArray, Hex, SignableMessage } from 'viem';
import {
  sendTransaction,
  signMessage,
  waitForTransactionReceipt,
} from 'viem/actions';

interface EvmWagmiAdapterParams {
  onConnectWalletRequest: () => Promise<string | null>;
}

export function useEvmWagmiAdapter({
  onConnectWalletRequest,
}: EvmWagmiAdapterParams) {
  const chains = useChains();
  const { address } = useAccount();
  const { data: client } = useConnectorClient();

  const adapter = useMemo(
    () =>
      ({
        metadata: {
          supportedBlockchainIds: chains.map((chain) => `eip155:${chain.id}`),
        },
        connect: async () => {
          if (!address) {
            try {
              const potentialAddress = await onConnectWalletRequest();
              return potentialAddress || null;
            } catch (error) {
              console.error('Blink wagmi adapter connection failed:', error);
              return null;
            }
          }
          return address;
        },
        signTransaction: async (tx: string) => {
          if (!address || !client) {
            return { error: 'No wallet connected' };
          }
          try {
            // deserialize function relies on wagmi implementation to handle bigints and maps correctly
            // same way blink api should serialize using the same utility function
            const deserializedTx = deserialize<any>(tx);
            const hash = await sendTransaction(client, {
              ...deserializedTx,
              account: address,
            });

            return { signature: hash };
          } catch (e) {
            console.error('Blink wagmi adapter sign transaction failed:', e);
            return { error: 'Signing failed.' };
          }
        },
        signMessage: async (
          data: string | SignMessageData | { raw: Hex | ByteArray },
        ) => {
          if (!address || !client) {
            return { error: 'No wallet connected' };
          }
          let message: SignableMessage;
          // Basically the idea here is that if data is string then we sign it as is
          if (typeof data === 'string') {
            message = data;
            // if data is raw which seems to be evm specifics, then we need to support it
          } else if (typeof data === 'object' && 'raw' in data) {
            message = data;
            // aand in case if it's SIWS(which is highly unlikely for evm) or something else we can just stringify it
          } else {
            message = JSON.stringify(data);
          }

          try {
            const signature = await signMessage(client, {
              account: address,
              message,
            });
            return { signature };
          } catch (e) {
            console.error('Blink wagmi adapter message signing failed:', e);
            return { error: 'Message signing failed' };
          }
        },
        confirmTransaction: async (signature: string) => {
          if (!client) {
            throw new Error('No wallet connected');
          }
          const res = await waitForTransactionReceipt(client, {
            hash: signature as Hex,
          });
          if (res.status !== 'success') {
            throw new Error('Transaction confirmation failed');
          }
        },
      }) satisfies ActionAdapter,
    [address, chains, client],
  );

  return { adapter };
}

import { type BlinkAdapter } from '@dialectlabs/blinks-core';
import type { SignMessageData } from '@solana/actions-spec';
import { useMemo } from 'react';
import { deserialize, useAccount, useChains, useConnectorClient } from 'wagmi';

import {
  TransactionExecutionError,
  type ByteArray,
  type Hex,
  type SignableMessage,
} from 'viem';
import {
  sendTransaction,
  signMessage,
  waitForTransactionReceipt,
} from 'viem/actions';

/**
 * Parameters for the `useEvmWagmiAdapter` hook.
 */
interface EvmWagmiAdapterParams {
  /**
   * Callback function that is called when a request to connect a wallet is made. You should use it to initiate the connection to the wallet, e.g. by opening a modal or a wallet connect QR code.
   * This function should be a semi-pure function, since it doesn't cause adapter to be recreated. Meaning you SHOULDN'T use any value variables from this function.
   *
   * @returns A promise that resolves to a string representing the wallet address if the connection is successful, or null if the connection is successful but no address is provided. The promise should be rejected if the connection fails.
   */
  onConnectWalletRequest: () => Promise<string> | Promise<void>;
}

/**
 * Hook to create an EVM Wagmi adapter for interacting with blockchain wallets.
 *
 * @param {EvmWagmiAdapterParams} params - Parameters for the adapter.
 * @returns {Object} - Returns an object containing the adapter.
 * @returns {BlinkAdapter} adapter - The adapter object with methods for connecting, signing transactions, signing messages, and confirming transactions.
 *
 * The adapter object contains the following methods:
 * - `connect`: Connects to the wallet and returns the wallet address.
 * - `signTransaction`: Signs a transaction and returns the transaction hash.
 * - `signMessage`: Signs a message and returns the signature.
 * - `confirmTransaction`: Confirms a transaction using the transaction hash.
 *
 * The adapter also contains metadata about supported blockchain IDs.
 */
export function useEvmWagmiAdapter({
  onConnectWalletRequest,
}: EvmWagmiAdapterParams): { adapter: BlinkAdapter } {
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
            if (e instanceof TransactionExecutionError) {
              return { error: `Unable to sign: ${e.shortMessage}` };
            }
            return { error: 'Signing failed' };
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
      }) satisfies BlinkAdapter,
    [address, chains, client],
  );

  return { adapter };
}

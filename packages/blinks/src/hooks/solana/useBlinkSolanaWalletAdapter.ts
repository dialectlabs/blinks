'use client';
import {
  BlinkSolanaConfig,
  createSignMessageText,
  type SignMessageVerificationOptions,
  verifySignMessageData,
} from '@dialectlabs/blinks-core';

import type { SignMessageData } from '@solana/actions-spec';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { useMemo } from 'react';
import { decodeBase64 } from '../../utils/base64';
/**
 * Hook to create a blink adapter using solana's wallet adapter.
 *
 * Be sure to call `blink.setAdapter` with the to update the adapter, every time the instance updates.
 *
 * @param rpcUrlOrConnection
 * @see {BlinkInstance}
 */
export function useBlinkSolanaWalletAdapter(
  rpcUrlOrConnection: string | Connection,
) {
  const wallet = useWallet();
  const walletModal = useWalletModal();

  const finalConnection = useMemo(() => {
    return typeof rpcUrlOrConnection === 'string'
      ? new Connection(rpcUrlOrConnection, 'confirmed')
      : rpcUrlOrConnection;
  }, [rpcUrlOrConnection]);

  const adapter = useMemo(() => {
    function verifySignDataValidity(
      data: string | SignMessageData,
      opts: SignMessageVerificationOptions,
    ) {
      if (typeof data === 'string') {
        // skip validation for string
        return true;
      }
      const errors = verifySignMessageData(data, opts);
      if (errors.length > 0) {
        console.warn(
          `[@dialectlabs/blinks] Sign message data verification error: ${errors.join(', ')}`,
        );
      }
      return errors.length === 0;
    }

    return new BlinkSolanaConfig(finalConnection, {
      connect: async () => {
        try {
          await wallet.connect();
        } catch {
          walletModal.setVisible(true);
          return null;
        }

        return wallet.publicKey?.toBase58() ?? null;
      },
      signTransaction: async (txData: string) => {
        try {
          const tx = await wallet.sendTransaction(
            VersionedTransaction.deserialize(decodeBase64(txData)),
            finalConnection,
          );
          return { signature: tx };
        } catch {
          return { error: 'Signing failed.' };
        }
      },
      signMessage: async (
        data: string | SignMessageData,
      ): Promise<
        | { signature: string }
        | {
            error: string;
          }
      > => {
        if (!wallet.signMessage || !wallet.publicKey) {
          return { error: 'Signing failed.' };
        }
        try {
          // Optional data verification before signing
          const isSignDataValid = verifySignDataValidity(data, {
            expectedAddress: wallet.publicKey.toString(),
          });
          if (!isSignDataValid) {
            return { error: 'Signing failed.' };
          }
          const text =
            typeof data === 'string' ? data : createSignMessageText(data);
          const encoded = new TextEncoder().encode(text);
          const signed = await wallet.signMessage(encoded);
          const encodedSignature = bs58.encode(signed);
          return { signature: encodedSignature };
        } catch (e) {
          return { error: 'Signing failed.' };
        }
      },
    });
  }, [finalConnection, wallet, walletModal]);

  return { adapter };
}

export { useBlinkSolanaWalletAdapter as useActionSolanaWalletAdapter };

'use client';
import {
  ActionConfig,
  type ActionContext,
  createSignMessageText,
  verifySignMessageData,
} from '@dialectlabs/blinks-core';

import type { SignMessageData } from '@solana/actions-spec';
import type { MessageSignerWalletAdapterProps } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { useMemo } from 'react';

/**
 * Hook to create an action adapter using solana's wallet adapter.
 *
 * Be sure to call `action.setAdapter` with the to update the adapter, every time the instance updates.
 *
 * @param rpcUrlOrConnection
 * @see {Action}
 */
export function useActionSolanaWalletAdapter(
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
    return new ActionConfig(finalConnection, {
      connect: async () => {
        try {
          await wallet.connect();
        } catch {
          walletModal.setVisible(true);
          return null;
        }

        return wallet.publicKey?.toBase58() ?? null;
      },
      signTransaction: async (txData: string, context: ActionContext) => {
        try {
          console.log(context.originalUrl, context.action.url);
          const tx = await wallet.sendTransaction(
            VersionedTransaction.deserialize(Buffer.from(txData, 'base64')),
            finalConnection,
          );
          return { signature: tx };
        } catch {
          return { error: 'Signing failed.' };
        }
      },
      signMessage: async (
        data: string | SignMessageData,
        context: ActionContext,
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
          if (typeof data === 'string') {
            return await signText(data, wallet.signMessage);
          }
          const verified = verifySignMessageData(
            data,
            context,
            wallet.publicKey.toString(),
          );
          console.error(
            `[@dialectlabs/blinks] Sign message data verification: ${verified}`,
          );
          if (!verified) {
            return { error: 'Invalid sign message data.' };
          }
          const messageText = createSignMessageText(data);
          return await signText(messageText, wallet.signMessage);
        } catch (e) {
          return { error: 'Signing failed.' };
        }
      },
    });
  }, [finalConnection, wallet, walletModal]);

  return { adapter };
}

async function signText(
  data: string,
  signMessage: MessageSignerWalletAdapterProps['signMessage'],
) {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(data);
  const signed = await signMessage(encoded);
  const encodedSignature = bs58.encode(signed);
  return { signature: encodedSignature };
}

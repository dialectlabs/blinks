'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { useMemo } from 'react';
import { ActionConfig } from '../api';

/**
 * Hook to create an action adapter using solana's wallet adapter.
 *
 * Be sure to call `action.setAdapter` with the to update the adapter, every time the instance updates.
 *
 * @param rpcUrlOrConnection
 * @see {Action}
 */
export function useActionAdapter(rpcUrlOrConnection: string | Connection) {
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
      signTransaction: async (txData: string) => {
        try {
          const tx = await wallet.sendTransaction(
            VersionedTransaction.deserialize(Buffer.from(txData, 'base64')),
            finalConnection,
          );
          return { signature: tx };
        } catch {
          return { error: 'Signing failed.' };
        }
      },
    });
  }, [finalConnection, wallet, walletModal]);

  return { adapter };
}

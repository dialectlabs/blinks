/**
 * CAIP-2 Blockchain IDs.
 */
export const BlockchainIds = {
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3',
};

export const BlockchainNames: Record<string, string> = {
  [BlockchainIds.SOLANA_MAINNET]: 'solana:mainnet',
  [BlockchainIds.SOLANA_DEVNET]: 'solana:devnet',
  [BlockchainIds.SOLANA_TESTNET]: 'solana:testnet',
};

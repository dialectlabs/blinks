/**
 * CAIP-2 Blockchain IDs.
 */
export const BlockchainIds = {
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3',
  ETHEREUM_MAINNET: 'eip155:1',
};

export const BlockchainNames: Record<string, string> = {
  [BlockchainIds.SOLANA_MAINNET]: 'Solana Mainnet',
  [BlockchainIds.SOLANA_DEVNET]: 'Solana Devnet',
  [BlockchainIds.SOLANA_TESTNET]: 'Solana Testnet',
  [BlockchainIds.ETHEREUM_MAINNET]: 'Ethereum Mainnet',
};

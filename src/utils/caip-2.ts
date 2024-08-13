/**
 * CAIP-2 Blockchain IDs.
 */
export const BlockchainIds = {
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3',
  ETHEREUM_MAINNET: 'eip155:1',
};
const BlockchainNames: Record<string, string> = {
  [BlockchainIds.SOLANA_MAINNET]: 'Solana Mainnet',
  [BlockchainIds.SOLANA_DEVNET]: 'Solana Devnet',
  [BlockchainIds.SOLANA_TESTNET]: 'Solana Testnet',
  [BlockchainIds.ETHEREUM_MAINNET]: 'Ethereum Mainnet',
};

export function getShortBlockchainName(id: string) {
  const blockchainName = BlockchainNames[id];
  if (!blockchainName) {
    // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md
    // chain_id:    namespace + ":" + reference
    const [chainId, reference] = id.split(':');
    if (chainId && reference) {
      // If the ID is in CAIP-2 format, truncate the reference to 3 characters
      const truncatedReference =
        reference.length > 3 ? reference.slice(0, 3) + '...' : reference;
      return `${chainId}:${truncatedReference}`;
    } else {
      // If the ID is not in CAIP-2 format, truncate the entire ID to 8 characters
      return id.length > 8 ? id.slice(0, 8) + '...' : id;
    }
  }
  return blockchainName;
}

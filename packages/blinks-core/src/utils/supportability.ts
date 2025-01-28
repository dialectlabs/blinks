export interface Supportability {
  blockchainIds?: string[];
  version?: string;
}

export const getBlinkSupportabilityMetadata = (
  response: Response,
): Supportability => {
  const blockchainIds = response.headers
    .get('x-blockchain-ids')
    ?.split(',')
    .map((id) => id.trim());
  const version = response.headers.get('x-action-version')?.trim();

  return {
    blockchainIds,
    version,
  };
};

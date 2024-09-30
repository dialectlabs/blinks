import type { SignMessageData } from '@solana/actions-spec';
import type { ActionContext } from '../ActionConfig';

export function verifySignMessageData(
  input: SignMessageData,
  context: ActionContext,
  connectedWallet: string,
): boolean {
  return (
    areMandatoryFieldsPresent(input) &&
    isDomainAllowed(input.domain, context) &&
    input.address === connectedWallet
  );
}

function areMandatoryFieldsPresent(input: SignMessageData): boolean {
  return !!input.address && !!input.domain && !!input.issuedAt && !!input.nonce;
}

function isDomainAllowed(domain: string, context: ActionContext): boolean {
  const actionUrl = context.action.url;
  const originalUrl = context.originalUrl;

  return (
    areDomainsEqual(domain, new URL(actionUrl).hostname) ||
    areDomainsEqual(domain, new URL(originalUrl).hostname)
  );
}

function areDomainsEqual(domain1: string, domain2: string): boolean {
  const normalizedDomain1: string = domain1.trim().replace(/^www\./, '');
  const normalizedDomain2: string = domain2.trim().replace(/^www\./, '');
  return normalizedDomain1 === normalizedDomain2;
}

export function createSignMessageText(input: SignMessageData): string {
  // ${domain} wants you to sign in with your Solana account:
  // ${address}
  //
  // ${statement}
  //
  // Chain ID: ${chain}
  // Nonce: ${nonce}
  // Issued At: ${issued-at}
  // Expiration Time: ${expiration-time}

  let message = `${input.domain} wants you to sign in with your Solana account:\n`;
  message += `${input.address}`;

  if (input.statement) {
    message += `\n\n${input.statement}`;
  }

  const fields: string[] = [];
  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`);
  }
  if (input.nonce) {
    fields.push(`Nonce: ${input.nonce}`);
  }
  if (input.issuedAt) {
    fields.push(`Issued At: ${input.issuedAt}`);
  }
  if (fields.length) {
    message += `\n\n${fields.join('\n')}`;
  }

  return message;
}

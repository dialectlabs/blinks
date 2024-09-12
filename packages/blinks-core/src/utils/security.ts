import type { ExtendedActionState } from '../api';

export type SecurityLevel = 'only-trusted' | 'non-malicious' | 'all';

export const checkSecurity = (
  state: ExtendedActionState,
  securityLevel: SecurityLevel,
): boolean => {
  switch (securityLevel) {
    case 'only-trusted':
      return state === 'trusted';
    case 'non-malicious':
      return state !== 'malicious';
    case 'all':
      return true;
  }
};

export const isUrlSameOrigin = (origin: string, url: string): boolean => {
  if (!url.startsWith('http')) {
    return true;
  }

  const urlObj = new URL(url);

  return urlObj.origin === origin;
};

import type { ActionGetResponse } from '@solana/actions-spec';

// Dialect's extensions to the Actions API
export interface DialectExperimentalFeatures {
  dialectExperimental?: {
    liveData?: {
      enabled: boolean;
      delayMs?: number; // default 1000 (1s)
    };
  };
}

export type ExtendedActionGetResponse = ActionGetResponse &
  DialectExperimentalFeatures;

export type * from '@solana/actions-spec';

import type { ActionsSpecPostResponse } from '../api';

export const isSignTransactionError = (
  data: { signature: string } | { error: string },
): data is { error: string } => !!(data as any).error;

export const isPostRequestError = (
  data: ActionsSpecPostResponse | { error: string },
): data is { error: string } => !!(data as any).error;

export const isSignTransactionError = (
  data: { signature: string } | { error: string },
): data is { error: string } => !!(data as any).error;

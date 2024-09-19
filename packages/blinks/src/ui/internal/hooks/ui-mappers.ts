import type { ExecutionStatus } from '@dialectlabs/blinks-core';

export const buttonVariantMap: Record<
  ExecutionStatus,
  'default' | 'error' | 'success'
> = {
  'checking-supportability': 'default',
  blocked: 'default',
  idle: 'default',
  executing: 'default',
  success: 'success',
  error: 'error',
};

export const buttonLabelMap: Record<ExecutionStatus, string | null> = {
  'checking-supportability': 'Loading',
  blocked: null,
  idle: null,
  executing: 'Executing',
  success: 'Completed',
  error: 'Failed',
};

import type { LinkedActionType } from '@solana/actions-spec';
import { AbstractActionComponent, BlinkInstance } from './Action';

/**
 * NOTE: methods for this interface WILL BE renamed to `onBlink*` in the nearest future.
 */
export interface BlinkCallbacksConfig {
  // Initial blink mount (called once)
  onActionMount: (
    action: BlinkInstance,
    originalUrl: string,
    type: 'trusted' | 'malicious' | 'unknown',
  ) => void;
  // Blink execution was cancelled (e.g. user interaction or blocked from execution)
  onActionCancel: (
    action: BlinkInstance,
    trigger: AbstractActionComponent,
    reason: string,
  ) => void;
  // Blink executed and chained to the next action
  onActionChain: (
    previousAction: BlinkInstance,
    chainedAction: BlinkInstance,
    chainTrigger: AbstractActionComponent,
    chainType: LinkedActionType,
    signature?: string,
  ) => void;
  // Blink execution completed fully (called once at the end of the chain or single blink)
  onActionComplete: (
    action: BlinkInstance,
    trigger: AbstractActionComponent,
    signature?: string,
  ) => void;
  // Blink execution failed (e.g. network error, invalid response, timeout). Does not include blink cancellation.
  onActionError: (
    action: BlinkInstance,
    trigger: AbstractActionComponent,
    reason: string,
    signature?: string,
  ) => void;
}

export type { BlinkCallbacksConfig as ActionCallbacksConfig };

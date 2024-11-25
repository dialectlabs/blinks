import type { LinkedActionType } from '@solana/actions-spec';
import { AbstractActionComponent, Action } from './Action';

export interface ActionCallbacksConfig {
  // Initial action mount (called once)
  onActionMount: (
    action: Action,
    originalUrl: string,
    type: 'trusted' | 'malicious' | 'unknown',
  ) => void;
  // Action execution was cancelled (e.g. user interaction or blocked from execution)
  onActionCancel: (
    action: Action,
    trigger: AbstractActionComponent,
    reason: string,
  ) => void;
  // Action executed and chained to the next action
  onActionChain: (
    previousAction: Action,
    chainedAction: Action,
    chainTrigger: AbstractActionComponent,
    chainType: LinkedActionType,
    signature?: string,
  ) => void;
  // Action execution completed fully (called once at the end of the chain or single action)
  onActionComplete: (
    action: Action,
    trigger: AbstractActionComponent,
    signature?: string,
  ) => void;
  // Action execution failed (e.g. network error, invalid response, timeout). Does not include action cancellation.
  onActionError: (
    action: Action,
    trigger: AbstractActionComponent,
    reason: string,
    signature?: string,
  ) => void;
}

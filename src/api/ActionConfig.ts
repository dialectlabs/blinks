import { ActionComponent, type Action } from './Action.ts';

export interface ActionContext {
  originalUrl: string;
  action: Action;
  actionType: 'trusted' | 'malicious' | 'unknown';
  triggeredLinkedAction: ActionComponent;
}

export interface IncomingActionConfig {
  rpcUrl: string;
  adapter: {
    connect: (context: ActionContext) => Promise<string>;
    signTransaction: (
      tx: string,
      context: ActionContext,
    ) => Promise<{ signature: string } | { error: string }>;
  };
}

export interface ActionAdapter {
  connect: (context: ActionContext) => Promise<string | null>;
  signTransaction: (
    tx: string,
    context: ActionContext,
  ) => Promise<{ signature: string } | { error: string }>;
  confirmTransaction: (
    signature: string,
    context: ActionContext,
  ) => Promise<void>;
}

import { Action } from './Action';

export interface ActionCallbacksConfig {
  onActionMount: (
    action: Action,
    originalUrl: string,
    type: 'trusted' | 'malicious' | 'unknown',
  ) => void;
}

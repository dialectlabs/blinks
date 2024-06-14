import { Action } from './Action.ts';

export interface ActionCallbacksConfig {
  onActionMount: (action: Action, originalUrl: string) => void;
}

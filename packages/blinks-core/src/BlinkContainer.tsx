import type {
  MessageNextActionPostRequest,
  NextActionPostRequest,
} from '@solana/actions-spec';
import {
  type ComponentType,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {
  AbstractActionComponent,
  Action,
  type ActionAdapter,
  type ActionCallbacksConfig,
  type ActionContext,
  type ActionSupportability,
  FormActionComponent,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  type LinkedActionType,
  mergeActionStates,
  MultiValueActionComponent,
  type SecurityActionState,
  SingleValueActionComponent,
} from './api';
import { checkSecurity, isInterstitial, type SecurityLevel } from './utils';
import { EMPTY_OBJECT } from './utils/constants.ts';
import {
  isPostRequestError,
  isSignMessageError,
  isSignTransactionError,
} from './utils/type-guards.ts';
import { isURL } from './utils/validators.ts';

export type BlinkSecurityState = SecurityActionState;

export enum DisclaimerType {
  BLOCKED = 'blocked',
  UNKNOWN = 'unknown',
}

export type Disclaimer =
  | {
      type: DisclaimerType.BLOCKED;
      ignorable: boolean;
      hidden: boolean;
      onSkip: () => void;
    }
  | {
      type: DisclaimerType.UNKNOWN;
      ignorable: boolean;
    };

export interface BlinkCaption {
  type: 'success' | 'error' | 'default';
  text: string;
}

export type ExtraExecutionData = {
  type: Extract<LinkedActionType, 'external-link'>;
  data: {
    externalLink: string;
  };
  onNext: () => void;
  onCancel?: () => void;
};

export interface BaseBlinkLayoutProps {
  id?: string;
  securityState: BlinkSecurityState;
  action: Action;
  component?: AbstractActionComponent | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: Disclaimer | null;
  caption?: BlinkCaption | null;
  executeFn: (
    component: AbstractActionComponent,
    params?: Record<string, string | string[]>,
  ) => Promise<ExtraExecutionData | void>;
  executionStatus: ExecutionStatus;
  executingAction?: AbstractActionComponent | null;
  supportability: ActionSupportability;
}

export type ExecutionStatus =
  | 'blocked'
  | 'checking-supportability'
  | 'idle'
  | 'executing'
  | 'success'
  | 'error';

export interface ExecutionState {
  status: ExecutionStatus;
  checkingSupportability?: boolean;
  executingAction?: AbstractActionComponent | null;
  // these messages are added to this state for values during execution
  errorMessage?: string | null;
  successMessage?: string | null;
  generalMessage?: string | null;
}

export enum ExecutionType {
  CHECK_SUPPORTABILITY = 'CHECK_SUPPORTABILITY',
  INITIATE = 'INITIATE',
  FINISH = 'FINISH',
  FAIL = 'FAIL',
  RESET = 'RESET',
  SOFT_RESET = 'SOFT_RESET',
  UNBLOCK = 'UNBLOCK',
  BLOCK = 'BLOCK',
  PARTIAL_UPDATE = 'PARTIAL_UPDATE',
}

type ActionValue =
  | {
      type: ExecutionType.CHECK_SUPPORTABILITY;
    }
  | {
      type: ExecutionType.INITIATE;
      executingAction: AbstractActionComponent;
      errorMessage?: string;
    }
  | {
      type: ExecutionType.FINISH;
      successMessage?: string | null;
    }
  | {
      type: ExecutionType.FAIL;
      errorMessage: string;
    }
  | {
      type: ExecutionType.RESET;
    }
  | {
      type: ExecutionType.UNBLOCK;
    }
  | {
      type: ExecutionType.BLOCK;
    }
  | {
      type: ExecutionType.SOFT_RESET;
      errorMessage?: string;
    }
  | {
      type: ExecutionType.PARTIAL_UPDATE;
      message?: string;
    };

const executionReducer = (
  state: ExecutionState,
  action: ActionValue,
): ExecutionState => {
  switch (action.type) {
    case ExecutionType.CHECK_SUPPORTABILITY:
      return {
        status: 'checking-supportability',
        checkingSupportability: true,
      };
    case ExecutionType.INITIATE:
      return { status: 'executing', executingAction: action.executingAction };
    case ExecutionType.FINISH:
      return {
        ...state,
        status: 'success',
        successMessage: action.successMessage,
        errorMessage: null,
      };
    case ExecutionType.FAIL:
      return {
        ...state,
        status: 'error',
        errorMessage: action.errorMessage,
        successMessage: null,
      };
    case ExecutionType.RESET:
      return {
        status: 'idle',
      };
    case ExecutionType.SOFT_RESET:
      return {
        ...state,
        executingAction: null,
        status: 'idle',
        errorMessage: action.errorMessage,
        successMessage: null,
      };
    case ExecutionType.BLOCK:
      return {
        status: 'blocked',
      };
    case ExecutionType.UNBLOCK:
      return {
        status: 'idle',
      };
    case ExecutionType.PARTIAL_UPDATE:
      return {
        ...state,
        generalMessage: action.message,
      };
  }
};

type ActionStateWithOrigin =
  | {
      action: SecurityActionState;
      origin?: never;
    }
  | {
      action: SecurityActionState;
      origin: SecurityActionState;
      originType: Source;
    };

const getOverallActionState = (
  action: Action,
  websiteUrl?: string | null,
): ActionStateWithOrigin => {
  const actionState = getExtendedActionState(action);
  const originalUrlData = websiteUrl ? isInterstitial(websiteUrl) : null;

  if (!originalUrlData) {
    return {
      action: actionState,
    };
  }

  if (originalUrlData.isInterstitial) {
    return {
      action: actionState,
      origin: getExtendedInterstitialState(websiteUrl!),
      originType: 'interstitials' as Source,
    };
  }

  return {
    action: actionState,
    origin: getExtendedWebsiteState(websiteUrl!),
    originType: 'websites' as Source,
  };
};

const checkSecurityFromActionState = (
  state: ActionStateWithOrigin,
  normalizedSecurityLevel: NormalizedSecurityLevel,
): boolean => {
  const checkAction = checkSecurity(
    state.action,
    normalizedSecurityLevel.actions,
  );

  if (!state.origin) {
    return checkAction;
  }

  return (
    checkAction &&
    checkSecurity(state.origin, normalizedSecurityLevel[state.originType])
  );
};

const DEFAULT_SECURITY_LEVEL: SecurityLevel = 'only-trusted';

type Source = 'websites' | 'interstitials' | 'actions';
type NormalizedSecurityLevel = Record<Source, SecurityLevel>;

export interface BlinkContainerProps {
  action: Action;
  adapter: ActionAdapter;
  selector?: (currentAction: Action) => AbstractActionComponent | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  callbacks?: Partial<ActionCallbacksConfig>;
  securityLevel?: SecurityLevel | NormalizedSecurityLevel;
  Layout: ComponentType<BaseBlinkLayoutProps>;
}

// overall flow: check-supportability -> idle/block -> executing -> success/error or chain
export const BlinkContainer = ({
  action: initialAction,
  adapter,
  websiteUrl,
  websiteText,
  callbacks = EMPTY_OBJECT,
  securityLevel = DEFAULT_SECURITY_LEVEL,
  Layout,
  selector,
}: BlinkContainerProps) => {
  const [action, setAction] = useState(initialAction);
  const singleComponent = useMemo(() => selector?.(action), [action, selector]);
  const isPartialAction = typeof selector === 'function';

  const normalizedSecurityLevel: NormalizedSecurityLevel = useMemo(() => {
    if (typeof securityLevel === 'string') {
      return {
        websites: securityLevel,
        interstitials: securityLevel,
        actions: securityLevel,
      };
    }

    return securityLevel;
  }, [securityLevel]);

  const [actionState, setActionState] = useState(
    getOverallActionState(action, websiteUrl),
  );

  const [supportability, setSupportability] = useState<ActionSupportability>({
    isSupported: true,
  });

  const overallState = useMemo(
    () =>
      mergeActionStates(
        ...([actionState.action, actionState.origin].filter(
          Boolean,
        ) as SecurityActionState[]),
      ),
    [actionState],
  );

  // adding ui check as well, to make sure, that on runtime registry lookups, we are not allowing the action to be executed
  // if partial action - we skip the security check, since we assume the user want's to control the flow
  const isPassingSecurityCheck = isPartialAction
    ? true
    : checkSecurityFromActionState(actionState, normalizedSecurityLevel);

  const [executionState, dispatch] = useReducer(executionReducer, {
    status: isPartialAction ? 'idle' : 'checking-supportability',
  });

  // in case, where initialAction or websiteUrl changes, we need to reset the action state
  useEffect(() => {
    // just in case, to not reset initial action
    if (action === initialAction) {
      return;
    }

    setAction(initialAction);
    setActionState(getOverallActionState(initialAction, websiteUrl));
    dispatch({
      type: isPartialAction
        ? ExecutionType.RESET
        : ExecutionType.CHECK_SUPPORTABILITY,
    });
    // we want to run this one when initialAction or websiteUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, websiteUrl]);

  useEffect(() => {
    callbacks.onActionMount?.(
      initialAction,
      websiteUrl ?? initialAction.url,
      actionState.action,
    );
    // we run this effect ONLY once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const liveDataConfig = action.liveData_experimental;
    if (
      !liveDataConfig ||
      !liveDataConfig.enabled ||
      executionState.status !== 'idle' ||
      action.isChained
    ) {
      return;
    }

    let timeout: any; // NodeJS.Timeout
    const fetcher = async () => {
      try {
        const newAction = await action.refresh();

        // if after refresh user clicked started execution, we should not update the action
        if (executionState.status === 'idle') {
          setAction(newAction);
        }
      } catch (e) {
        console.error(
          `[@dialectlabs/blinks] Failed to fetch live data for action ${action.url}`,
        );
        // if fetch failed, we retry after the same delay
        timeout = setTimeout(fetcher, liveDataConfig.delayMs);
      }
    };

    // since either way we're rebuilding the whole action, we'll update and restart this effect
    timeout = setTimeout(fetcher, liveDataConfig.delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [action, executionState.status, isPartialAction]);

  useEffect(() => {
    const checkSupportability = async (action: Action) => {
      if (
        action.isChained ||
        executionState.status !== 'checking-supportability'
      ) {
        return;
      }
      try {
        const supportability = await action.isSupported(adapter);
        setSupportability(supportability);
      } finally {
        dispatch({
          type:
            overallState !== 'malicious' && isPassingSecurityCheck
              ? ExecutionType.RESET
              : ExecutionType.BLOCK,
        });
      }
    };

    checkSupportability(action);
  }, [
    action,
    adapter,
    executionState.status,
    overallState,
    isPassingSecurityCheck,
  ]);

  const execute = async (
    component: AbstractActionComponent,
    params?: Record<string, string | string[]>,
  ): Promise<ExtraExecutionData | void> => {
    if (params) {
      if (component instanceof FormActionComponent) {
        Object.entries(params).forEach(([name, value]) =>
          component.setValue(value, name),
        );
      }

      if (component instanceof MultiValueActionComponent) {
        component.setValue(params[component.parameter.name]);
      }

      if (component instanceof SingleValueActionComponent) {
        const incomingValues = params[component.parameter.name];
        const value =
          typeof incomingValues === 'string'
            ? incomingValues
            : incomingValues[0];
        component.setValue(value);
      }
    }

    const newActionState = getOverallActionState(action, websiteUrl);
    const newIsPassingSecurityCheck = checkSecurityFromActionState(
      newActionState,
      normalizedSecurityLevel,
    );

    // if action state has changed or origin's state has changed, and it doesn't pass the security check or became malicious, block the action
    if (
      (newActionState.action !== actionState.action ||
        newActionState.origin !== actionState.origin) &&
      !newIsPassingSecurityCheck
    ) {
      setActionState(newActionState);
      dispatch({ type: ExecutionType.BLOCK });
      callbacks.onActionCancel?.(action, component, 'security-state-changed');
      return;
    }

    // before making any state changes, we handle an inline link and complete the action if clicked
    if (component.type === 'inline-link') {
      if (isURL(component.href)) {
        return {
          type: 'external-link',
          data: {
            externalLink: component.href,
          },
          onNext: () =>
            dispatch({
              type: ExecutionType.FINISH,
            }),
          onCancel: () => {},
        };
      }

      return;
    }

    dispatch({ type: ExecutionType.INITIATE, executingAction: component });

    const context: ActionContext = {
      action: component.parent,
      actionType: actionState.action,
      originalUrl: websiteUrl ?? component.parent.url,
      triggeredLinkedAction: component,
    };

    try {
      const account = await adapter.connect(context);
      if (!account) {
        dispatch({ type: ExecutionType.RESET });
        callbacks?.onActionCancel?.(action, component, 'wallet-not-connected');
        return;
      }

      const response = await component
        .post(account)
        .catch((e: Error) => ({ error: e.message }));

      if (isPostRequestError(response)) {
        dispatch({
          type: ExecutionType.SOFT_RESET,
          errorMessage: isPostRequestError(response)
            ? response.error
            : 'Transaction data missing',
        });
        callbacks.onActionError?.(action, component, 'post-request-error');
        return;
      }

      if (response.lifecycle?.executing) {
        dispatch({
          type: ExecutionType.PARTIAL_UPDATE,
          message: response.lifecycle.executing.message,
        });
      }

      const chain = async (signature?: string) => {
        if (!response.links?.next && !response.lifecycle?.success) {
          dispatch({
            type: ExecutionType.FINISH,
            successMessage: response.message,
          });
          callbacks.onActionComplete?.(action, component, signature);
          return;
        }

        if (response.type === 'message' && !signature) {
          dispatch({
            type: ExecutionType.SOFT_RESET,
            errorMessage:
              response.lifecycle?.error?.message ??
              'Missing signature for message',
          });
          callbacks.onActionError?.(
            action,
            component,
            'message-signature-missing',
          );
          return;
        }

        // chain
        const chainData: MessageNextActionPostRequest | NextActionPostRequest =
          response.type === 'message'
            ? {
                signature: signature!,
                account: account,
                state: response.state,
                data: response.data,
              }
            : {
                signature: signature,
                account: account,
              };
        const nextAction = response.links?.next
          ? await action.chain(
              response.links.next,
              chainData,
              response.lifecycle?.success,
            )
          : action.safeInlineChain(response.lifecycle?.success);

        // if this is running in partial action mode, then we end the chain, if passed fn returns a null value for the next action
        // this also ignores the lifecycle.success for now, since still in development
        if (!nextAction || (isPartialAction && !selector?.(nextAction))) {
          dispatch({
            type: ExecutionType.FINISH,
            successMessage: response.message,
          });
          callbacks.onActionComplete?.(action, component, signature);
          return;
        }

        setAction(nextAction);
        dispatch({ type: ExecutionType.RESET });
        callbacks.onActionChain?.(
          action,
          nextAction,
          component,
          response.type,
          signature,
        );
      };

      if (response.type === 'transaction' || !response.type) {
        const signResult = await adapter.signTransaction(
          response.transaction,
          context,
        );

        if (!signResult || isSignTransactionError(signResult)) {
          dispatch({ type: ExecutionType.RESET });
          callbacks.onActionCancel?.(
            action,
            component,
            'transaction-sign-cancel',
          );
          return;
        }

        const confirmationResult = await adapter
          .confirmTransaction(signResult.signature, context)
          .then(() => ({ success: true as const }))
          .catch((e) => ({ success: false as const, message: e.message }));

        if (!confirmationResult.success) {
          dispatch({
            type: ExecutionType.SOFT_RESET,
            errorMessage:
              response.lifecycle?.error?.message ??
              confirmationResult.message ??
              'Unknown error, please try again',
          });
          callbacks.onActionError?.(
            action,
            component,
            'transaction-confirmation-failed',
            signResult.signature,
          );
          return;
        }

        await chain(signResult.signature);
        return;
      }

      if (response.type === 'message') {
        const signResult = await adapter.signMessage(response.data, context);

        if (!signResult || isSignMessageError(signResult)) {
          dispatch({ type: ExecutionType.RESET });
          callbacks.onActionCancel?.(action, component, 'message-sign-cancel');
          return;
        }

        await chain(signResult.signature);
        return;
      }

      if (response.type === 'post') {
        await chain();
        return;
      }

      if (response.type === 'external-link') {
        if (isURL(response.externalLink)) {
          return {
            type: 'external-link',
            data: {
              externalLink: response.externalLink,
            },
            onNext: () => chain(),
            onCancel: () => chain(),
          };
        }

        await chain();
        return;
      }
    } catch (e) {
      dispatch({
        type: ExecutionType.SOFT_RESET,
        errorMessage: (e as Error).message ?? 'Unknown error, please try again',
      });
      callbacks.onActionError?.(action, component, 'unknown-error');
    }
  };

  const disclaimer: Disclaimer | null = useMemo(() => {
    if (overallState === 'malicious') {
      return {
        type: DisclaimerType.BLOCKED,
        ignorable: isPassingSecurityCheck,
        hidden:
          executionState.status !== 'blocked' &&
          executionState.status !== 'checking-supportability',
        onSkip: () => dispatch({ type: ExecutionType.UNBLOCK }),
      };
    }

    if (overallState === 'unknown') {
      return {
        type: DisclaimerType.UNKNOWN,
        ignorable: isPassingSecurityCheck,
      };
    }

    return null;
  }, [executionState.status, isPassingSecurityCheck, overallState]);

  const blinkCaption: BlinkCaption | null = useMemo(() => {
    const error = executionState.errorMessage ?? action.error;
    const generalMessage = executionState.generalMessage ?? action.message;

    if (error) {
      return { type: 'error', text: error };
    }

    if (executionState.successMessage) {
      return { type: 'success', text: executionState.successMessage };
    }

    if (generalMessage) {
      return { type: 'default', text: generalMessage };
    }

    return null;
  }, [
    executionState.errorMessage,
    executionState.successMessage,
    executionState.generalMessage,
    action.error,
    action.message,
  ]);

  return (
    <Layout
      securityState={overallState}
      websiteUrl={websiteUrl}
      websiteText={websiteText}
      action={action}
      component={singleComponent}
      caption={blinkCaption}
      executionStatus={executionState.status}
      executingAction={executionState.executingAction}
      executeFn={execute}
      disclaimer={disclaimer}
      supportability={supportability}
      id={action.id}
    />
  );
};

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
  type ActionCallbacksConfig,
  type ActionContext,
  type ActionPostResponse,
  type ActionSupportability,
  FormActionComponent,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  mergeActionStates,
  MultiValueActionComponent,
  type SecurityActionState,
  SingleValueActionComponent,
} from './api';
import { checkSecurity, isInterstitial, type SecurityLevel } from './utils';
import {
  isPostRequestError,
  isSignTransactionError,
} from './utils/type-guards.ts';

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
  type: 'success' | 'error';
  text: string;
}

export interface BaseBlinkLayoutProps {
  id?: string;
  securityState: BlinkSecurityState;
  action: Action;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: Disclaimer | null;
  caption?: BlinkCaption | null;
  executeFn: (
    component: AbstractActionComponent,
    params?: Record<string, string | string[]>,
  ) => Promise<void>;
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
  errorMessage?: string | null;
  successMessage?: string | null;
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
  return checkSecurity(state.action, normalizedSecurityLevel.actions) &&
    state.origin
    ? checkSecurity(state.origin, normalizedSecurityLevel[state.originType])
    : true;
};

const DEFAULT_SECURITY_LEVEL: SecurityLevel = 'only-trusted';

type Source = 'websites' | 'interstitials' | 'actions';
type NormalizedSecurityLevel = Record<Source, SecurityLevel>;

export interface BlinkContainerProps {
  action: Action;
  websiteUrl?: string | null;
  websiteText?: string | null;
  callbacks?: Partial<ActionCallbacksConfig>;
  securityLevel?: SecurityLevel | NormalizedSecurityLevel;
  Layout: ComponentType<BaseBlinkLayoutProps>;
}

// overall flow: check-supportability -> idle/block -> executing -> success/error or chain
export const BlinkContainer = ({
  action: initialAction,
  websiteUrl,
  websiteText,
  callbacks,
  securityLevel = DEFAULT_SECURITY_LEVEL,
  Layout,
}: BlinkContainerProps) => {
  const [action, setAction] = useState(initialAction);
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
  const isPassingSecurityCheck = checkSecurityFromActionState(
    actionState,
    normalizedSecurityLevel,
  );

  const [executionState, dispatch] = useReducer(executionReducer, {
    status: 'checking-supportability',
  });

  // in case, where initialAction or websiteUrl changes, we need to reset the action state
  useEffect(() => {
    if (action === initialAction || action.isChained) {
      return;
    }

    setAction(initialAction);
    setActionState(getOverallActionState(initialAction, websiteUrl));
    dispatch({ type: ExecutionType.CHECK_SUPPORTABILITY });
    // we want to run this one when initialAction or websiteUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, websiteUrl]);

  useEffect(() => {
    callbacks?.onActionMount?.(
      action,
      websiteUrl ?? action.url,
      actionState.action,
    );
    // we ignore changes to `actionState.action` or callbacks explicitly, since we want this to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, websiteUrl]);

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
  }, [action, executionState.status]);

  useEffect(() => {
    const checkSupportability = async (action: Action) => {
      if (
        action.isChained ||
        executionState.status !== 'checking-supportability'
      ) {
        return;
      }
      try {
        const supportability = await action.isSupported();
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
  }, [action, executionState.status, overallState, isPassingSecurityCheck]);

  const execute = async (
    component: AbstractActionComponent,
    params?: Record<string, string | string[]>,
  ) => {
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
      const account = await action.adapter.connect(context);
      if (!account) {
        dispatch({ type: ExecutionType.RESET });
        return;
      }

      const tx = await component
        .post(account)
        .catch((e: Error) => ({ error: e.message }));

      if (!(tx as ActionPostResponse).transaction || isPostRequestError(tx)) {
        dispatch({
          type: ExecutionType.SOFT_RESET,
          errorMessage: isPostRequestError(tx)
            ? tx.error
            : 'Transaction data missing',
        });
        return;
      }

      const signResult = await action.adapter.signTransaction(
        tx.transaction,
        context,
      );

      if (!signResult || isSignTransactionError(signResult)) {
        dispatch({ type: ExecutionType.RESET });
      } else {
        await action.adapter.confirmTransaction(signResult.signature, context);

        if (!tx.links?.next) {
          dispatch({
            type: ExecutionType.FINISH,
            successMessage: tx.message,
          });
          return;
        }

        // chain
        const nextAction = await action.chain(tx.links.next, {
          signature: signResult.signature,
          account: account,
        });

        if (!nextAction) {
          dispatch({
            type: ExecutionType.FINISH,
            successMessage: tx.message,
          });
          return;
        }

        setAction(nextAction);
        dispatch({ type: ExecutionType.RESET });
      }
    } catch (e) {
      dispatch({
        type: ExecutionType.SOFT_RESET,
        errorMessage: (e as Error).message ?? 'Unknown error, please try again',
      });
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
    if (executionState.status === 'error') {
      return { type: 'error', text: executionState.errorMessage ?? '' };
    }

    if (executionState.status === 'success') {
      return { type: 'success', text: executionState.successMessage ?? '' };
    }

    return null;
  }, [
    executionState.status,
    executionState.errorMessage,
    executionState.successMessage,
  ]);

  return (
    <Layout
      securityState={overallState}
      websiteUrl={websiteUrl}
      websiteText={websiteText}
      action={action}
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

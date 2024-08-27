import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  AbstractActionComponent,
  Action,
  type ActionCallbacksConfig,
  type ActionContext,
  type ActionPostResponse,
  type ActionSupportability,
  ButtonActionComponent,
  type ExtendedActionState,
  FormActionComponent,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  isParameterSelectable,
  isPatternAllowed,
  mergeActionStates,
  MultiValueActionComponent,
  SingleValueActionComponent,
} from '../api';
import { checkSecurity, type SecurityLevel } from '../shared';
import { isInterstitial } from '../utils/interstitial-url.ts';
import {
  isPostRequestError,
  isSignTransactionError,
} from '../utils/type-guards.ts';
import {
  ActionLayout,
  type Disclaimer,
  DisclaimerType,
  type StylePreset,
} from './ActionLayout';

type ExecutionStatus =
  | 'blocked'
  | 'checking-supportability'
  | 'idle'
  | 'executing'
  | 'success'
  | 'error';

interface ExecutionState {
  status: ExecutionStatus;
  checkingSupportability?: boolean;
  executingAction?: AbstractActionComponent | null;
  errorMessage?: string | null;
  successMessage?: string | null;
}

enum ExecutionType {
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

const buttonVariantMap: Record<
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

const buttonLabelMap: Record<ExecutionStatus, string | null> = {
  'checking-supportability': 'Loading',
  blocked: null,
  idle: null,
  executing: 'Executing',
  success: 'Completed',
  error: 'Failed',
};

type ActionStateWithOrigin =
  | {
      action: ExtendedActionState;
      origin?: never;
    }
  | {
      action: ExtendedActionState;
      origin: ExtendedActionState;
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

const SOFT_LIMIT_BUTTONS = 10;
const SOFT_LIMIT_INPUTS = 3;
const SOFT_LIMIT_FORM_INPUTS = 10;

const DEFAULT_SECURITY_LEVEL: SecurityLevel = 'only-trusted';

type Source = 'websites' | 'interstitials' | 'actions';
type NormalizedSecurityLevel = Record<Source, SecurityLevel>;

// overall flow: check-supportability -> idle/block -> executing -> success/error or chain
export const ActionContainer = ({
  action: initialAction,
  websiteUrl,
  websiteText,
  callbacks,
  securityLevel = DEFAULT_SECURITY_LEVEL,
  stylePreset = 'default',
  Experimental__ActionLayout = ActionLayout,
}: {
  action: Action;
  websiteUrl?: string | null;
  websiteText?: string | null;
  callbacks?: Partial<ActionCallbacksConfig>;
  securityLevel?: SecurityLevel | NormalizedSecurityLevel;
  stylePreset?: StylePreset;
  // please do not use it yet, better api is coming..
  Experimental__ActionLayout?: typeof ActionLayout;
}) => {
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
        ) as ExtendedActionState[]),
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

  const buttons = useMemo(
    () =>
      action?.actions
        .filter((it) => it instanceof ButtonActionComponent)
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true,
        )
        .toSpliced(SOFT_LIMIT_BUTTONS) ?? [],
    [action, executionState.executingAction],
  );
  const inputs = useMemo(
    () =>
      action?.actions
        .filter(
          (it) =>
            it instanceof SingleValueActionComponent ||
            it instanceof MultiValueActionComponent,
        )
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true,
        )
        .toSpliced(SOFT_LIMIT_INPUTS) ?? [],
    [action, executionState.executingAction],
  );
  const form = useMemo(() => {
    const [formComponent] =
      action?.actions
        .filter((it) => it instanceof FormActionComponent)
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true,
        ) ?? [];

    return formComponent;
  }, [action, executionState.executingAction]);

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

  const asButtonProps = (it: ButtonActionComponent) => {
    return {
      text: buttonLabelMap[executionState.status] ?? it.label,
      loading:
        executionState.status === 'executing' &&
        it === executionState.executingAction,
      disabled:
        action.disabled ||
        action.type === 'completed' ||
        executionState.status !== 'idle',
      variant:
        buttonVariantMap[
          action.type === 'completed' ? 'success' : executionState.status
        ],
      onClick: (params?: Record<string, string | string[]>) =>
        execute(it.parentComponent ?? it, params),
    };
  };

  const asInputProps = (
    it: SingleValueActionComponent | MultiValueActionComponent,
    { placement }: { placement: 'form' | 'standalone' } = {
      placement: 'standalone',
    },
  ) => {
    return {
      type: it.parameter.type ?? 'text',
      placeholder: it.parameter.label,
      disabled:
        action.disabled ||
        action.type === 'completed' ||
        executionState.status !== 'idle',
      name: it.parameter.name,
      required: it.parameter.required,
      min: it.parameter.min,
      max: it.parameter.max,
      pattern:
        it instanceof SingleValueActionComponent &&
        isPatternAllowed(it.parameter)
          ? it.parameter.pattern
          : undefined,
      options: isParameterSelectable(it.parameter)
        ? it.parameter.options
        : undefined,
      description: it.parameter.patternDescription,
      button:
        placement === 'standalone'
          ? asButtonProps(it.toButtonActionComponent())
          : undefined,
    };
  };

  const asFormProps = (it: FormActionComponent) => {
    return {
      button: asButtonProps(it.toButtonActionComponent()),
      inputs: it.parameters.toSpliced(SOFT_LIMIT_FORM_INPUTS).map((parameter) =>
        asInputProps(it.toInputActionComponent(parameter.name), {
          placement: 'form',
        }),
      ),
    };
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

  return (
    <Experimental__ActionLayout
      stylePreset={stylePreset}
      type={overallState}
      title={action.title}
      description={action.description}
      websiteUrl={websiteUrl}
      websiteText={websiteText}
      image={action.icon}
      error={
        executionState.status !== 'success'
          ? (executionState.errorMessage ?? action.error)
          : null
      }
      success={executionState.successMessage}
      buttons={buttons.map((button) => asButtonProps(button))}
      inputs={inputs.map((input) => asInputProps(input))}
      form={form ? asFormProps(form) : undefined}
      disclaimer={disclaimer}
      supportability={supportability}
    />
  );
};

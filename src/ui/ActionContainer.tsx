import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  Action,
  ActionComponent,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  mergeActionStates,
  type ActionCallbacksConfig,
  type ActionCompatibility,
  type ActionContext,
  type ExtendedActionState,
  type Parameter,
} from '../api';
import { checkSecurity, type SecurityLevel } from '../shared';
import { isInterstitial } from '../utils/interstitial-url.ts';
import {
  isPostRequestError,
  isSignTransactionError,
} from '../utils/type-guards.ts';
import {
  ActionLayout,
  DisclaimerType,
  type ButtonProps,
  type Disclaimer,
  type StylePreset,
} from './ActionLayout';

type ExecutionStatus = 'blocked' | 'idle' | 'executing' | 'success' | 'error';

interface ExecutionState {
  status: ExecutionStatus;
  executingAction?: ActionComponent | null;
  errorMessage?: string | null;
  successMessage?: string | null;
}

enum ExecutionType {
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
      type: ExecutionType.INITIATE;
      executingAction: ActionComponent;
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
  blocked: 'default',
  idle: 'default',
  executing: 'default',
  success: 'success',
  error: 'error',
};

const buttonLabelMap: Record<ExecutionStatus, string | null> = {
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

export const ActionContainer = ({
  action,
  actionCompatibility,
  websiteUrl,
  websiteText,
  callbacks,
  securityLevel = DEFAULT_SECURITY_LEVEL,
  stylePreset = 'default',
  Experimental__ActionLayout = ActionLayout,
}: {
  action: Action;
  actionCompatibility: ActionCompatibility;
  websiteUrl?: string | null;
  websiteText?: string | null;
  callbacks?: Partial<ActionCallbacksConfig>;
  securityLevel?: SecurityLevel | NormalizedSecurityLevel;
  stylePreset?: StylePreset;

  // please do not use it yet, better api is coming..
  Experimental__ActionLayout?: typeof ActionLayout;
}) => {
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
    status:
      overallState !== 'malicious' && isPassingSecurityCheck
        ? 'idle'
        : 'blocked',
  });

  useEffect(() => {
    callbacks?.onActionMount?.(
      action,
      websiteUrl ?? action.url,
      actionState.action,
    );
    // we ignore changes to `actionState.action` explicitly, since we want this to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbacks, action, websiteUrl]);

  const buttons = useMemo(
    () =>
      action?.actions
        .filter((it) => !it.parameter)
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
        .filter((it) => it.parameters.length === 1)
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
        .filter((it) => it.parameters.length > 1)
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true,
        ) ?? [];

    return formComponent;
  }, [action, executionState.executingAction]);

  const execute = async (
    component: ActionComponent,
    params?: Record<string, string>,
  ) => {
    if (component.parameters && params) {
      Object.entries(params).forEach(([name, value]) =>
        component.setValue(value, name),
      );
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
      actionCompatibility,
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

      if (isPostRequestError(tx)) {
        dispatch({
          type: ExecutionType.SOFT_RESET,
          errorMessage: tx.error,
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
        dispatch({
          type: ExecutionType.FINISH,
          successMessage: tx.message,
        });
      }
    } catch (e) {
      dispatch({
        type: ExecutionType.FAIL,
        errorMessage: (e as Error).message ?? 'Unknown error',
      });
    }
  };

  const asButtonProps = (it: ActionComponent): ButtonProps => ({
    text: buttonLabelMap[executionState.status] ?? it.label,
    loading:
      executionState.status === 'executing' &&
      it === executionState.executingAction,
    disabled: action.disabled || executionState.status !== 'idle',
    variant: buttonVariantMap[executionState.status],
    onClick: (params?: Record<string, string>) => execute(it, params),
  });

  const asInputProps = (it: ActionComponent, parameter?: Parameter) => {
    const placeholder = !parameter ? it.parameter!.label : parameter.label;
    const name = !parameter ? it.parameter!.name : parameter.name;
    const required = !parameter ? it.parameter!.required : parameter.required;

    return {
      // since we already filter this, we can safely assume that parameter is not null
      placeholder,
      disabled: action.disabled || executionState.status !== 'idle',
      name,
      required,
      button: !parameter ? asButtonProps(it) : undefined,
    };
  };

  const asFormProps = (it: ActionComponent) => {
    return {
      button: asButtonProps(it),
      inputs: it.parameters
        .toSpliced(SOFT_LIMIT_FORM_INPUTS)
        .map((parameter) => asInputProps(it, parameter)),
    };
  };

  const disclaimer: Disclaimer | null = useMemo(() => {
    if (overallState === 'malicious') {
      return {
        type: DisclaimerType.BLOCKED,
        ignorable: isPassingSecurityCheck,
        hidden: executionState.status !== 'blocked',
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
          ? executionState.errorMessage ?? action.error
          : null
      }
      success={executionState.successMessage}
      buttons={buttons.map(asButtonProps)}
      inputs={inputs.map((input) => asInputProps(input))}
      form={form ? asFormProps(form) : undefined}
      disclaimer={disclaimer}
    />
  );
};

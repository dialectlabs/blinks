import { useEffect, useMemo, useReducer } from 'react';
import {
  Action,
  ActionComponent,
  ActionsRegistry,
  type ActionCallbacksConfig,
  type ActionContext,
} from '../api';
import { isSignTransactionError } from '../utils/type-guards.ts';
import type { ButtonProps } from './ActionLayout';
import { ActionLayout } from './ActionLayout';
import { Snackbar } from './Snackbar.tsx';

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
  UNBLOCK = 'UNBLOCK',
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

const SOFT_LIMIT_BUTTONS = 10;
const SOFT_LIMIT_INPUTS = 3;

export const ActionContainer = ({
  action,
  websiteUrl,
  callbacks,
}: {
  action: Action;
  websiteUrl?: string;
  callbacks?: Partial<ActionCallbacksConfig>;
}) => {
  const type = useMemo(
    () => ActionsRegistry.getInstance().lookup(action.url)?.state ?? 'unknown',
    [action.url],
  );
  const websiteText = useMemo(
    () => (websiteUrl ? new URL(websiteUrl).hostname : null),
    [websiteUrl],
  );
  const [executionState, dispatch] = useReducer(executionReducer, {
    status: type !== 'malicious' ? 'idle' : 'blocked',
  });

  useEffect(() => {
    callbacks?.onActionMount?.(action, websiteUrl ?? action.url, type);
  }, [callbacks, action, websiteUrl, type]);

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
        .filter((it) => it.parameter)
        .filter((it) =>
          executionState.executingAction
            ? executionState.executingAction === it
            : true,
        )
        .toSpliced(SOFT_LIMIT_INPUTS) ?? [],
    [action, executionState.executingAction],
  );

  const execute = async (
    component: ActionComponent,
    params?: Record<string, string>,
  ) => {
    if (component.parameter && params) {
      component.setValue(params[component.parameter.name]);
    }

    dispatch({ type: ExecutionType.INITIATE, executingAction: component });

    const context: ActionContext = {
      action: component.parent,
      actionType: type,
      originalUrl: websiteUrl ?? component.parent.url,
      triggeredLinkedAction: component,
    };

    try {
      const account = await action.adapter.connect(context);
      if (!account) {
        dispatch({ type: ExecutionType.RESET });
        return;
      }

      const tx = await component.post(account);
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

  const asInputProps = (it: ActionComponent) => {
    return {
      // since we already filter this, we can safely assume that parameter is not null
      placeholder: it.parameter!.label,
      disabled: action.disabled || executionState.status !== 'idle',
      name: it.parameter!.name,
      button: asButtonProps(it),
    };
  };

  const disclaimer = useMemo(() => {
    if (type === 'malicious' && executionState.status === 'blocked') {
      return (
        <Snackbar variant="error">
          <div className="text-caption mb-3">
            This Action has been flagged as an unsafe action, & has been
            blocked. If you believe this action has been blocked in error,
            please{' '}
            <a href="#" className="cursor-pointer underline">
              submit an issue
            </a>
            .
          </div>
          <button
            className="text-caption font-semibold"
            onClick={() => dispatch({ type: ExecutionType.UNBLOCK })}
          >
            Ignore warning & proceed
          </button>
        </Snackbar>
      );
    }

    if (type === 'unknown') {
      return (
        <Snackbar variant="warning">
          This Action has not yet been registered. Only use it if you trust the
          source
        </Snackbar>
      );
    }

    return null;
  }, [type, executionState.status]);

  return (
    <ActionLayout
      type={type}
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
      inputs={inputs.map(asInputProps)}
      disclaimer={disclaimer}
    />
  );
};

import {
  type BaseBlinkLayoutProps,
  ButtonActionComponent,
  FormActionComponent,
  isParameterSelectable,
  isPatternAllowed,
  MultiValueActionComponent,
  SingleValueActionComponent,
} from '@dialectlabs/blinks-core';
import { useCallback, useMemo } from 'react';
import type { BaseIsolatedLayoutProps } from '../../layouts/IsolatedBlinkLayout.tsx';
import { buttonLabelMap, buttonVariantMap } from './ui-mappers.ts';

const SOFT_LIMIT_FORM_INPUTS = 10;

export const useIsolatedLayoutPropNormalizer = ({
  executeFn,
  executionStatus,
  executingAction,
  action,
  component,
  ...props
}: BaseBlinkLayoutProps): BaseIsolatedLayoutProps | null => {
  const asButtonProps = useCallback(
    (it: ButtonActionComponent) => {
      return {
        text: buttonLabelMap[executionStatus] ?? it.label,
        loading: executionStatus === 'executing' && it === executingAction,
        disabled:
          action.disabled ||
          action.type === 'completed' ||
          executionStatus !== 'idle',
        variant:
          buttonVariantMap[
            action.type === 'completed' ? 'success' : executionStatus
          ],
        onClick: (params?: Record<string, string | string[]>) =>
          executeFn(it.parentComponent ?? it, params),
      };
    },
    [action.disabled, action.type, executeFn, executingAction, executionStatus],
  );

  const asInputProps = useCallback(
    (
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
          executionStatus !== 'idle',
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
    },
    [action.disabled, action.type, asButtonProps, executionStatus],
  );

  const asFormProps = useCallback(
    (it: FormActionComponent) => {
      return {
        button: asButtonProps(it.toButtonActionComponent()),
        inputs: it.parameters
          .toSpliced(SOFT_LIMIT_FORM_INPUTS)
          .map((parameter) =>
            asInputProps(it.toInputActionComponent(parameter.name), {
              placement: 'form',
            }),
          ),
      };
    },
    [asButtonProps, asInputProps],
  );

  const elementProps = useMemo(() => {
    if (!component) {
      return null;
    }

    if (
      component instanceof SingleValueActionComponent ||
      component instanceof MultiValueActionComponent
    ) {
      return {
        elementType: 'input' as const,
        element: asInputProps(component),
      };
    }

    if (component instanceof FormActionComponent) {
      return { elementType: 'form' as const, element: asFormProps(component) };
    }

    if (component instanceof ButtonActionComponent) {
      return {
        elementType: 'button' as const,
        element: asButtonProps(component as ButtonActionComponent),
      };
    }

    return null;
  }, [asButtonProps, asFormProps, asInputProps, component]);

  if (!elementProps) {
    return null;
  }

  return {
    ...props,
    ...elementProps,
  };
};

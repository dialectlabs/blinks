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
  caption,
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
        ctaType:
          it.type === 'external-link' &&
          (executionStatus === 'idle' || executionStatus === 'blocked')
            ? ('link' as const)
            : ('button' as const),
        onClick: async (params?: Record<string, string | string[]>) => {
          const extra = await executeFn(it.parentComponent ?? it, params);

          if (!extra) {
            return;
          }

          if (extra.type === 'external-link') {
            const result = window.confirm(
              `This action redirects to another website: ${extra.data.externalLink}, the link will open in a new tab of your browser`,
            );

            if (result) {
              window.open(
                extra.data.externalLink,
                '_blank',
                'norefferer,noopener',
              );
              return extra.onNext();
            }

            return extra.onCancel?.();
          }
        },
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

  const normalizedCaption = useMemo(() => {
    if (!caption) {
      return {};
    }

    if (caption.type === 'success') {
      return {
        success: caption.text,
      };
    }

    if (caption.type === 'error') {
      return {
        error: caption.text,
      };
    }

    return {};
  }, [caption]);

  if (!elementProps) {
    return null;
  }

  return {
    ...props,
    websiteText: props.websiteText ?? action.url,
    ...elementProps,
    ...normalizedCaption,
  };
};

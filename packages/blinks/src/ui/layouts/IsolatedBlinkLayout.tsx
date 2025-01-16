import clsx from 'clsx';
import { useMemo } from 'react';
import type {
  BaseButtonProps,
  BaseInputProps,
} from '../internal/inputs/types.ts';
import type { StylePreset } from '../types.ts';
import { ActionContent, type FormProps } from './BaseBlinkLayout.tsx';
import { themeClassMap } from './presets.ts';

type ButtonProps = BaseButtonProps;
type InputProps = BaseInputProps;

interface CommonIsolatedLayoutProps {
  stylePreset?: StylePreset;
  error?: string | null;
  success?: string | null;
  message?: string | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  id?: string;
}

export type BaseIsolatedLayoutProps = CommonIsolatedLayoutProps &
  (
    | {
        elementType: 'form';
        element: FormProps;
      }
    | {
        elementType: 'button';
        element: ButtonProps;
      }
    | {
        elementType: 'input';
        element: InputProps;
      }
  );

export const IsolatedBlinkLayout = ({
  stylePreset = 'default',
  id,
  success,
  error,
  message,
  ...props
}: BaseIsolatedLayoutProps) => {
  const element = useMemo(() => {
    if (props.elementType === 'form') {
      return { form: props.element };
    }

    if (props.elementType === 'button') {
      return { buttons: [props.element] };
    }

    if (props.elementType === 'input') {
      return { inputs: [props.element] };
    }

    return {};
  }, [props.element, props.elementType]);

  return (
    <div className={clsx('blink w-full', themeClassMap[stylePreset])}>
      <ActionContent key={id} {...element} />
      {success && (
        <span className="text-subtext text-text-success mt-1.5 break-words text-center">
          {success}
        </span>
      )}
      {error && !success && (
        <span className="text-subtext text-text-error mt-1.5 break-words text-center">
          {error}
        </span>
      )}
      {message && !success && !error && (
        <span className="text-subtext text-text-secondary mt-1.5 break-words text-center">
          {message}
        </span>
      )}
    </div>
  );
};

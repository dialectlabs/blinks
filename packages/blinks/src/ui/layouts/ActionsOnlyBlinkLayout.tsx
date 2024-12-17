import clsx from 'clsx';
import type {
  BaseButtonProps,
  BaseInputProps,
} from '../internal/inputs/types.ts';
import type { StylePreset } from '../types.ts';
import {
  ActionContent,
  type FormProps,
  type InnerLayoutProps,
} from './BaseBlinkLayout.tsx';
import { themeClassMap } from './presets.ts';

type ButtonProps = BaseButtonProps;
type InputProps = BaseInputProps;

interface CommonIsolatedLayoutProps {
  stylePreset?: StylePreset;
  error?: string | null;
  success?: string | null;
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

export const ActionsOnlyBlinkLayout = ({
  stylePreset = 'default',
  id,
  success,
  error,
  inputs,
  buttons,
  form,
}: InnerLayoutProps) => {
  return (
    <div className={clsx('blink w-full', themeClassMap[stylePreset])}>
      <ActionContent key={id} form={form} inputs={inputs} buttons={buttons} />
      {success && (
        <span className="text-subtext text-text-success mt-1.5 flex justify-center">
          {success}
        </span>
      )}
      {error && !success && (
        <span className="text-subtext text-text-error mt-1.5 flex justify-center">
          {error}
        </span>
      )}
    </div>
  );
};

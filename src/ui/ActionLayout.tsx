import clsx from 'clsx';
import { type ReactNode, useState } from 'react';
import type { ActionSupportability, ExtendedActionState } from '../api';
import { Badge } from './Badge.tsx';
import { Snackbar } from './Snackbar.tsx';
import { ExclamationShieldIcon, InfoShieldIcon, LinkIcon } from './icons';
import ConfigIcon from './icons/ConfigIcon.tsx';
import {
  ActionButton,
  ActionDateInput,
  ActionEmailInput,
  ActionNumberInput,
  ActionRadioGroup,
  ActionSelect,
  ActionTextInput,
  ActionUrlInput,
} from './inputs';
import { ActionCheckboxGroup } from './inputs/ActionCheckboxGroup.tsx';
import { ActionTextArea } from './inputs/ActionTextArea.tsx';
import type { BaseButtonProps, BaseInputProps } from './inputs/types.ts';

type ActionType = ExtendedActionState;
type ButtonProps = BaseButtonProps;
type InputProps = BaseInputProps;

export type StylePreset = 'default' | 'x-dark' | 'x-light' | 'custom';

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

const stylePresetClassMap: Record<StylePreset, string> = {
  default: 'dial-light',
  'x-dark': 'x-dark',
  'x-light': 'x-light',
  custom: 'custom',
};

interface LayoutProps {
  stylePreset?: StylePreset;
  image?: string;
  error?: string | null;
  success?: string | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: Disclaimer | null;
  type: ActionType;
  title: string;
  description: string;
  buttons?: ButtonProps[];
  inputs?: InputProps[];
  form?: FormProps;
  supportability: ActionSupportability;
}

export interface FormProps {
  inputs: Array<Omit<InputProps, 'button'>>;
  button: ButtonProps;
}

const Linkable = ({
  url,
  className,
  children,
}: {
  url?: string | null;
  className?: string;
  children: ReactNode | ReactNode[];
}) =>
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );

const NotSupportedBlock = ({
  message,
  className,
}: {
  message: string;
  className?: string;
}) => {
  return (
    <div className={className}>
      <div
        className={clsx(
          'rounded-xl border border-none bg-bg-secondary p-3 text-subtext text-text-secondary',
        )}
      >
        <div className="flex flex-row gap-2">
          <div>
            <ConfigIcon className="text-icon-primary" />
          </div>
          <div className="flex flex-col justify-center gap-[3px]">
            <a className="font-semibold">This action is not supported</a>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DisclaimerBlock = ({
  type,
  hidden,
  ignorable,
  onSkip,
  className,
}: {
  type: DisclaimerType;
  ignorable: boolean;
  onSkip?: () => void;
  hidden: boolean;
  className?: string;
}) => {
  if (type === DisclaimerType.BLOCKED && !hidden) {
    return (
      <div className={className}>
        <Snackbar variant="error">
          <p>
            This Action or it&apos;s origin has been flagged as an unsafe
            action, & has been blocked. If you believe this action has been
            blocked in error, please{' '}
            <a
              href="https://discord.gg/saydialect"
              className="cursor-pointer underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              submit an issue
            </a>
            .
            {!ignorable &&
              ' Your action provider blocks execution of this action.'}
          </p>
          {ignorable && onSkip && (
            <button
              className="mt-3 font-semibold transition-colors hover:text-text-error-hover motion-reduce:transition-none"
              onClick={onSkip}
            >
              Ignore warning & proceed
            </button>
          )}
        </Snackbar>
      </div>
    );
  }

  if (type === DisclaimerType.UNKNOWN) {
    return (
      <div className={className}>
        <Snackbar variant="warning">
          <p>
            This Action has not yet been registered. Only use it if you trust
            the source. This Action will not unfurl on X until it is registered.
            {!ignorable &&
              ' Your action provider blocks execution of this action.'}
          </p>
          <a
            className="mt-3 inline-block font-semibold transition-colors hover:text-text-warning-hover motion-reduce:transition-none"
            href="https://discord.gg/saydialect"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report
          </a>
        </Snackbar>
      </div>
    );
  }

  return null;
};

export const ActionLayout = ({
  stylePreset = 'default',
  title,
  description,
  image,
  websiteUrl,
  websiteText,
  type,
  disclaimer,
  buttons,
  inputs,
  form,
  error,
  success,
  supportability,
}: LayoutProps) => {
  return (
    <div className={clsx('blink', stylePresetClassMap[stylePreset])}>
      <div className="w-full cursor-default overflow-hidden rounded-2xl border border-stroke-primary bg-bg-primary shadow-action">
        {image && (
          <Linkable
            url={websiteUrl}
            className="block max-h-[100cqw] overflow-y-hidden px-5 pt-5"
          >
            <img
              className={clsx(
                'aspect-auto w-full rounded-xl object-cover object-center',
              )}
              src={image}
              alt="action-image"
            />
          </Linkable>
        )}
        <div className="flex flex-col p-5">
          <div className="mb-2 flex items-center gap-2">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                className="group inline-flex items-center truncate text-subtext hover:cursor-pointer"
                rel="noopener noreferrer"
              >
                <LinkIcon className="mr-2 text-icon-primary transition-colors group-hover:text-icon-primary-hover motion-reduce:transition-none" />
                <span className="text-text-link transition-colors group-hover:text-text-link-hover group-hover:underline motion-reduce:transition-none">
                  {websiteText ?? websiteUrl}
                </span>
              </a>
            )}
            {websiteText && !websiteUrl && (
              <span className="inline-flex items-center truncate text-subtext text-text-link">
                {websiteText}
              </span>
            )}
            <a
              href="https://docs.dialect.to/documentation/actions/security"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              {type === 'malicious' && (
                <Badge
                  variant="error"
                  icon={<ExclamationShieldIcon width={13} height={13} />}
                >
                  Blocked
                </Badge>
              )}
              {type === 'trusted' && (
                <Badge
                  variant="default"
                  icon={<InfoShieldIcon width={13} height={13} />}
                />
              )}
              {type === 'unknown' && (
                <Badge
                  variant="warning"
                  icon={<InfoShieldIcon width={13} height={13} />}
                />
              )}
            </a>
          </div>
          <span className="mb-0.5 text-text font-semibold text-text-primary">
            {title}
          </span>
          <span className="mb-4 whitespace-pre-wrap text-subtext text-text-secondary">
            {description}
          </span>
          {!supportability.isSupported ? (
            <NotSupportedBlock message={supportability.message} />
          ) : (
            <>
              {disclaimer && (
                <DisclaimerBlock
                  className="mb-4"
                  type={disclaimer.type}
                  ignorable={disclaimer.ignorable}
                  hidden={
                    disclaimer.type === DisclaimerType.BLOCKED
                      ? disclaimer.hidden
                      : false
                  }
                  onSkip={
                    disclaimer.type === DisclaimerType.BLOCKED
                      ? disclaimer.onSkip
                      : undefined
                  }
                />
              )}
              <ActionContent form={form} inputs={inputs} buttons={buttons} />
              {success && (
                <span className="mt-4 flex justify-center text-subtext text-text-success">
                  {success}
                </span>
              )}
              {error && !success && (
                <span className="mt-4 flex justify-center text-subtext text-text-error">
                  {error}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionContent = ({
  form,
  inputs,
  buttons,
}: Pick<LayoutProps, 'form' | 'buttons' | 'inputs'>) => {
  if (form) {
    return <ActionForm form={form} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {buttons && buttons.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {buttons?.map((it, index) => (
            <div
              key={index}
              className="flex flex-grow basis-[calc(33.333%-2*4px)]"
            >
              <ActionButton {...it} />
            </div>
          ))}
        </div>
      )}
      {inputs?.map((input) => (
        <ActionInputFactory key={input.name} {...input} />
      ))}
    </div>
  );
};

const buildDefaultFormValues = (
  inputs: InputProps[],
): Record<string, string | string[]> => {
  return Object.fromEntries(
    inputs
      .map((i) => {
        if (i.type === 'checkbox') {
          return [
            i.name,
            i.options?.filter((o) => o.selected).map((o) => o.value),
          ];
        }

        return i.type === 'radio' || i.type === 'select'
          ? [i.name, i.options?.find((o) => o.selected)?.value]
          : null;
      })
      .filter((i) => !!i),
  );
};

const ActionForm = ({ form }: Required<Pick<LayoutProps, 'form'>>) => {
  const [values, setValues] = useState<Record<string, string | string[]>>(
    buildDefaultFormValues(form.inputs),
  );
  const [validity, setValidity] = useState<Record<string, boolean>>(
    Object.fromEntries(form.inputs.map((i) => [i.name, false])),
  );

  const onChange = (name: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onValidityChange = (name: string, state: boolean) => {
    setValidity((prev) => ({ ...prev, [name]: state }));
  };

  const disabled = Object.values(validity).some((v) => !v);

  return (
    <div className="flex flex-col gap-3">
      {form.inputs.map((input) => (
        <ActionInputFactory
          key={input.name}
          {...input}
          onChange={(v) => onChange(input.name, v)}
          onValidityChange={(v) => onValidityChange(input.name, v)}
        />
      ))}
      <ActionButton
        {...form.button}
        onClick={() => form.button.onClick(values)}
        disabled={form.button.disabled || disabled}
      />
    </div>
  );
};

const ActionInputFactory = (
  input: InputProps & {
    onChange?: (value: string | string[]) => void;
    onValidityChange?: (state: boolean) => void;
  },
) => {
  switch (input.type) {
    case 'checkbox':
      return <ActionCheckboxGroup {...input} />;
    case 'radio':
      return <ActionRadioGroup {...input} />;
    case 'date':
    case 'datetime-local':
      return <ActionDateInput {...input} type={input.type} />;
    case 'select':
      return <ActionSelect {...input} />;
    case 'email':
      return <ActionEmailInput {...input} />;
    case 'number':
      return <ActionNumberInput {...input} />;
    case 'url':
      return <ActionUrlInput {...input} />;
    case 'textarea':
      return <ActionTextArea {...input} />;
    default:
      return <ActionTextInput {...input} />;
  }
};

import {
  type ActionSupportability,
  type Disclaimer,
  DisclaimerType,
  type SecurityActionState,
} from '@dialectlabs/blinks-core';
import clsx from 'clsx';
import { type ReactNode, useState } from 'react';
import { Badge } from '../internal/Badge.tsx';
import { SimpleMarkdown } from '../internal/SimpleMarkdown.tsx';
import { Snackbar } from '../internal/Snackbar.tsx';
import {
  ConfigIcon,
  ExclamationShieldIcon,
  InfoShieldIcon,
  LinkIcon,
} from '../internal/icons';
import {
  ActionButton,
  ActionCheckboxGroup,
  ActionDateInput,
  ActionEmailInput,
  ActionNumberInput,
  ActionRadioGroup,
  ActionSelect,
  ActionTextArea,
  ActionTextInput,
  ActionUrlInput,
} from '../internal/inputs';
import type {
  BaseButtonProps,
  BaseInputProps,
} from '../internal/inputs/types.ts';
import type { StylePreset } from '../types.ts';
import { themeClassMap } from './presets.ts';

type ButtonProps = BaseButtonProps;
type InputProps = BaseInputProps;

export interface InnerLayoutProps {
  stylePreset?: StylePreset;
  image?: string;
  error?: string | null;
  success?: string | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: Disclaimer | null;
  securityState: SecurityActionState;
  title: string;
  description: string;
  buttons?: ButtonProps[];
  inputs?: InputProps[];
  form?: FormProps;
  supportability: ActionSupportability;
  id?: string;
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
          'bg-bg-secondary text-subtext text-text-secondary rounded-xl border border-none p-3',
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
              className="hover:text-text-error-hover mt-3 font-semibold transition-colors motion-reduce:transition-none"
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
            className="hover:text-text-warning-hover mt-3 inline-block font-semibold transition-colors motion-reduce:transition-none"
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

export const BaseBlinkLayout = ({
  stylePreset = 'default',
  title,
  description,
  image,
  websiteUrl,
  websiteText,
  securityState,
  disclaimer,
  buttons,
  inputs,
  form,
  error,
  success,
  supportability,
  id,
}: InnerLayoutProps) => {
  return (
    <div className={clsx('blink', themeClassMap[stylePreset])}>
      <div className="border-stroke-primary bg-bg-primary shadow-action w-full cursor-default overflow-hidden rounded-2xl border">
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
          <div className="mb-1 flex items-center gap-2">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                className="text-subtext group flex min-w-0 items-center gap-2 hover:cursor-pointer"
                rel="noopener noreferrer"
              >
                <LinkIcon className="text-icon-primary group-hover:text-icon-primary-hover h-4 min-w-4 transition-colors motion-reduce:transition-none" />
                <span className="text-text-link group-hover:text-text-link-hover mt-[1px] block min-w-0 truncate transition-colors group-hover:underline motion-reduce:transition-none">
                  {websiteText ?? websiteUrl}
                </span>
              </a>
            )}
            {websiteText && !websiteUrl && (
              <span className="text-subtext text-text-link min-w-0 truncate">
                {websiteText}
              </span>
            )}
            <a
              href="https://docs.dialect.to/documentation/actions/security"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-0.5 flex items-center"
            >
              {securityState === 'malicious' && (
                <Badge
                  variant="error"
                  icon={<ExclamationShieldIcon width={13} height={13} />}
                >
                  Blocked
                </Badge>
              )}
              {securityState === 'trusted' && (
                <Badge
                  variant="default"
                  icon={<InfoShieldIcon width={13} height={13} />}
                />
              )}
              {securityState === 'unknown' && (
                <Badge
                  variant="warning"
                  icon={<InfoShieldIcon width={13} height={13} />}
                />
              )}
            </a>
          </div>
          <span className="text-text text-text-primary mb-1.5 break-words font-semibold">
            {title}
          </span>
          <span className="text-subtext text-text-secondary mb-4 break-words">
            {description && <SimpleMarkdown text={description} />}
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
              <ActionContent
                key={id}
                form={form}
                inputs={inputs}
                buttons={buttons}
              />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActionContent = ({
  form,
  inputs,
  buttons,
}: Pick<InnerLayoutProps, 'form' | 'buttons' | 'inputs'>) => {
  if (form) {
    return <ActionForm form={form} />;
  }

  return (
    <div className="flex flex-col gap-4">
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

const ActionForm = ({ form }: Required<Pick<InnerLayoutProps, 'form'>>) => {
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

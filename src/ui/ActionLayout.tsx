import clsx from 'clsx';
import { useState, type ChangeEvent, type ReactNode } from 'react';
import type { ExtendedActionState } from '../api';
import { Badge } from './Badge.tsx';
import { Button } from './Button';
import { Snackbar } from './Snackbar.tsx';
import {
  CheckIcon,
  ExclamationShieldIcon,
  InfoShieldIcon,
  LinkIcon,
  SpinnerDots,
} from './icons';

type ActionType = ExtendedActionState;

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
}
export interface ButtonProps {
  text: string | null;
  loading?: boolean;
  variant?: 'default' | 'success' | 'error';
  disabled?: boolean;
  onClick: (params?: Record<string, string>) => void;
}

export interface InputProps {
  placeholder?: string;
  name: string;
  disabled: boolean;
  required?: boolean;
  button?: ButtonProps;
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

const DisclaimerBlock = ({
  type,
  hidden,
  ignorable,
  onSkip,
}: {
  type: DisclaimerType;
  ignorable: boolean;
  onSkip?: () => void;
  hidden: boolean;
}) => {
  if (type === DisclaimerType.BLOCKED && !hidden) {
    return (
      <Snackbar variant="error">
        <p>
          This Action or it&apos;s origin has been flagged as an unsafe action,
          & has been blocked. If you believe this action has been blocked in
          error, please{' '}
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
    );
  }

  if (type === DisclaimerType.UNKNOWN) {
    return (
      <Snackbar variant="warning">
        <p>
          This Action has not yet been registered. Only use it if you trust the
          source. This Action will not unfurl on X until it is registered.
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
}: LayoutProps) => {
  return (
    <div className={clsx('blink', stylePresetClassMap[stylePreset])}>
      <div className="w-full cursor-default overflow-hidden rounded-2xl border border-stroke-primary bg-bg-primary shadow-action">
        {image && (
          <Linkable url={websiteUrl} className="block px-5 pt-5">
            <img
              className={clsx('w-full rounded-xl object-cover object-left', {
                'aspect-square': !form,
                'aspect-[2/1]': form,
              })}
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
                <span className="text-text-link group-hover:text-text-link-hover transition-colors group-hover:underline motion-reduce:transition-none">
                  {websiteText ?? websiteUrl}
                </span>
              </a>
            )}
            {websiteText && !websiteUrl && (
              <span className="text-text-link inline-flex items-center truncate text-subtext">
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
          {disclaimer && (
            <div className="mb-4">
              <DisclaimerBlock
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
            </div>
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
      {inputs?.map((input) => <ActionInput key={input.name} {...input} />)}
    </div>
  );
};

const ActionForm = ({ form }: Required<Pick<LayoutProps, 'form'>>) => {
  const [values, setValues] = useState(
    Object.fromEntries(form.inputs.map((i) => [i.name, ''])),
  );

  const onChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const disabled = form.inputs.some((i) => i.required && values[i.name] === '');

  return (
    <div className="flex flex-col gap-3">
      {form.inputs.map((input) => (
        <ActionInput
          key={input.name}
          {...input}
          onChange={(v) => onChange(input.name, v)}
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

const ActionInput = ({
  placeholder,
  name,
  button,
  disabled,
  onChange: extOnChange,
  required,
}: InputProps & { onChange?: (value: string) => void }) => {
  const [value, onChange] = useState('');

  const extendedChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
    extOnChange?.(e.currentTarget.value);
  };

  const placeholderWithRequired =
    (placeholder || 'Type here...') + (required ? '*' : '');

  return (
    <div
      className={clsx(
        'border-input-stroke focus-within:border-input-stroke-selected flex items-center gap-2 rounded-input border transition-colors motion-reduce:transition-none',
        {
          'hover:border-input-stroke-hover hover:focus-within:border-input-stroke-selected':
            !disabled,
        },
      )}
    >
      <input
        placeholder={placeholderWithRequired}
        value={value}
        disabled={disabled}
        onChange={extendedChange}
        className="bg-input-bg text-text-input placeholder:text-text-input-placeholder disabled:text-text-input-disabled my-3 ml-4 flex-1 truncate outline-none"
      />
      {button && (
        <div className="my-2 mr-2">
          <ActionButton
            {...button}
            onClick={() => button.onClick({ [name]: value })}
            disabled={button.disabled || value === ''}
          />
        </div>
      )}
    </div>
  );
};

const ActionButton = ({
  text,
  loading,
  disabled,
  variant,
  onClick,
}: ButtonProps) => {
  const ButtonContent = () => {
    if (loading)
      return (
        <span className="flex flex-row items-center justify-center gap-2 text-nowrap">
          {text} <SpinnerDots />
        </span>
      );
    if (variant === 'success')
      return (
        <span className="flex flex-row items-center justify-center gap-2 text-nowrap">
          {text}
          <CheckIcon />
        </span>
      );
    return text;
  };

  return (
    <Button onClick={() => onClick()} disabled={disabled} variant={variant}>
      <ButtonContent />
    </Button>
  );
};

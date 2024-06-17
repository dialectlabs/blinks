import { useState, type ReactNode } from 'react';
import type { ExtendedActionState } from '../api';
import { Badge } from './Badge.tsx';
import { Button } from './Button';
import {
  CheckIcon,
  CheckShieldIcon,
  ExclamationShieldIcon,
  InfoShieldIcon,
  LinkIcon,
  SpinnerDots,
} from './icons';

type ActionType = ExtendedActionState;

interface LayoutProps {
  image?: string;
  error?: string | null;
  success?: string | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: ReactNode;
  type: ActionType;
  title: string;
  description: string;
  buttons?: ButtonProps[];
  inputs?: InputProps[];
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
  button: ButtonProps;
}

export const ActionLayout = ({
  title,
  description,
  image,
  websiteUrl,
  websiteText,
  type,
  disclaimer,
  buttons,
  inputs,
  error,
  success,
}: LayoutProps) => {
  return (
    <div className="mt-3 w-full overflow-hidden rounded-2xl border border-twitter-accent bg-twitter-neutral-80 shadow-action">
      {image && (
        <img
          className="aspect-square w-full object-cover object-left"
          src={image}
          alt="action-image"
        />
      )}
      <div className="flex flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              className="inline-flex items-center truncate text-subtext text-twitter-neutral-50 hover:cursor-pointer hover:underline"
              rel="noreferrer"
            >
              <LinkIcon className="mr-2" />
              {websiteText ?? websiteUrl}
            </a>
          )}
          {type === 'malicious' && (
            <Badge variant="error" icon={<ExclamationShieldIcon />}>
              Blocked
            </Badge>
          )}
          {type === 'trusted' && (
            <Badge variant="success" icon={<CheckShieldIcon />}>
              Trusted
            </Badge>
          )}
          {type === 'unknown' && (
            <Badge variant="warning" icon={<InfoShieldIcon />} />
          )}
        </div>
        <span className="mb-0.5 text-text font-semibold text-white">
          {title}
        </span>
        <span className="mb-4 whitespace-pre-wrap text-subtext text-twitter-neutral-40">
          {description}
        </span>
        {disclaimer && <div className="mb-4">{disclaimer}</div>}
        <div className="flex flex-col gap-3">
          {buttons && buttons.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {buttons?.map((it, index) => (
                <div key={index} className="flex-auto">
                  <ActionButton {...it} />
                </div>
              ))}
            </div>
          )}
          {inputs?.map((input) => <ActionInput key={input.name} {...input} />)}
        </div>
        {success && (
          <span className="mt-4 flex justify-center text-subtext text-twitter-success">
            {success}
          </span>
        )}
        {error && !success && (
          <span className="mt-4 flex justify-center text-subtext text-twitter-error">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

const ActionInput = ({ placeholder, name, button, disabled }: InputProps) => {
  const [value, onChange] = useState('');

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#3D4144]">
      <input
        placeholder={placeholder || 'Type here...'}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="ml-4 flex-1 truncate bg-transparent outline-none placeholder:text-twitter-neutral-50 disabled:text-twitter-neutral-50"
      />
      <div className="my-2 mr-2">
        <ActionButton
          {...button}
          onClick={() => button.onClick({ [name]: value })}
          disabled={button.disabled || value === ''}
        />
      </div>
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
        <span className="flex flex-row items-center justify-center gap-2">
          {text} <SpinnerDots />
        </span>
      );
    if (variant === 'success')
      return (
        <span className="flex flex-row items-center justify-center gap-2 text-twitter-success">
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

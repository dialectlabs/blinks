import clsx from 'clsx';
import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

interface Props {
  children: ReactElement<
    | InputHTMLAttributes<HTMLInputElement>
    | TextareaHTMLAttributes<HTMLTextAreaElement>
    | SelectHTMLAttributes<HTMLSelectElement>
  >;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  footer?: ReactNode;
  description?: string | null;
  standalone?: boolean;
}

export const BaseInputContainer = ({
  children,
  leftAdornment,
  rightAdornment,
  footer,
  description,
  standalone = true,
}: Props) => {
  return (
    <div>
      <div
        className={clsx(
          'peer relative flex min-h-10 items-center gap-1.5 border border-input-stroke py-1.5 pl-4 pr-1.5 transition-colors motion-reduce:transition-none',
          // focus, invalid, required
          'focus-within:has-[:invalid]:border-input-stroke-error focus-within:has-[:valid]:border-input-stroke-selected focus-within:hover:has-[:invalid]:border-input-stroke-error focus-within:hover:has-[:valid]:border-input-stroke-selected',
          // enabled,
          'hover:has-[:enabled]:border-input-stroke-hover',
          standalone ? 'rounded-input-standalone' : 'rounded-input',
        )}
      >
        {leftAdornment && <div>{leftAdornment}</div>}
        {cloneElement(children, {
          className:
            'flex-1 truncate bg-input-bg text-text-input outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled',
        })}
        {rightAdornment && <div className="min-w-0">{rightAdornment}</div>}
      </div>
      {footer && <div className="mt-2">{footer}</div>}
      {description && (
        <span className="mt-2 text-caption font-medium text-text-secondary peer-[:focus-within:has(:invalid)]:text-text-error">
          {description}
        </span>
      )}
    </div>
  );
};

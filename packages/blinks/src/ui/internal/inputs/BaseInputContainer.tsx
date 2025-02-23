import clsx from 'clsx';
import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { SimpleMarkdown } from '../SimpleMarkdown.tsx';

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
  className?: string;
}

export const BaseInputContainer = ({
  children,
  leftAdornment,
  rightAdornment,
  footer,
  description,
  standalone = true,
  className,
}: Props) => {
  return (
    <div>
      <div
        className={clsx(
          'blink-input border-input-stroke min-h-input-height peer relative box-border flex flex-wrap items-center gap-1.5 gap-y-2 border px-1.5 transition-colors motion-reduce:transition-none',
          // focus, invalid, required
          'focus-within:has-[:invalid]:border-input-stroke-error focus-within:has-[:valid]:border-input-stroke-selected focus-within:hover:has-[:invalid]:border-input-stroke-error focus-within:hover:has-[:valid]:border-input-stroke-selected',
          // enabled,
          'hover:has-[:enabled]:border-input-stroke-hover',
          { 'py-1.5': !!rightAdornment },
          standalone ? 'rounded-input-standalone' : 'rounded-input',
          className,
        )}
      >
        <div className="flex min-w-0 flex-[10] basis-1/2 items-center gap-1.5 pl-2.5">
          {leftAdornment && (
            <div className="blink-input-left-adornment">{leftAdornment}</div>
          )}
          {cloneElement(children, {
            className: clsx(
              'blink-input-inner bg-input-bg text-text-input placeholder:text-text-input-placeholder disabled:text-text-input-disabled min-h-7 min-w-0 flex-1 truncate outline-none',
              children.props.className,
            ),
          })}
        </div>
        {rightAdornment && (
          <div className="blink-input-right-adornment max-w-full flex-1 whitespace-nowrap">
            {rightAdornment}
          </div>
        )}
      </div>
      {footer && <div className="blink-input-footer mt-2">{footer}</div>}
      {description && (
        <div className="blink-input-description text-caption text-text-secondary peer-[:focus-within:has(:invalid)]:text-text-error mt-1.5 font-medium">
          <SimpleMarkdown text={description} />
        </div>
      )}
    </div>
  );
};

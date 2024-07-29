import clsx from 'clsx';
import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

interface Props {
  children: ReactElement<
    | InputHTMLAttributes<HTMLInputElement>
    | TextareaHTMLAttributes<HTMLTextAreaElement>
  >;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  description?: string;
}

export const BaseInputContainer = ({
  children,
  leftAdornment,
  rightAdornment,
  description,
}: Props) => {
  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-2 rounded-input border border-input-stroke py-1.5 pl-4 pr-1.5 transition-colors motion-reduce:transition-none',
          // focus, invalid, required
          'focus-within:has-[:invalid]:border-input-stroke-error focus-within:has-[:valid]:border-input-stroke-selected focus-within:hover:has-[:invalid]:border-input-stroke-error focus-within:hover:has-[:valid]:border-input-stroke-selected',
          // enabled,
          'hover:has-[:enabled]:border-input-stroke-hover',
        )}
      >
        {leftAdornment && <span className="mr-2">{leftAdornment}</span>}
        {cloneElement(children, {
          className:
            'flex-1 truncate bg-input-bg text-text-input outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled',
        })}
        {rightAdornment && <span className="ml-2">{rightAdornment}</span>}
      </div>
      {description && <span className="mt-2">{description}</span>}
    </div>
  );
};

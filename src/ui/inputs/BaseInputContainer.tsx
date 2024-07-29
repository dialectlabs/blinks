import clsx from 'clsx';
import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

interface Props {
  disabled?: boolean;
  children: ReactElement<
    | InputHTMLAttributes<HTMLInputElement>
    | TextareaHTMLAttributes<HTMLTextAreaElement>
  >;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  description?: string;
  valid?: boolean;
}

export const BaseInputContainer = ({
  disabled,
  children,
  leftAdornment,
  rightAdornment,
  description,
  valid,
}: Props) => {
  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-2 rounded-input border border-input-stroke py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-input-stroke-selected focus-within:has-[:invalid]:border-input-stroke-error motion-reduce:transition-none',
          {
            'hover:border-input-stroke-hover hover:focus-within:border-input-stroke-selected':
              !disabled,
          },
        )}
      >
        {leftAdornment && <span className="mr-2">{leftAdornment}</span>}
        {cloneElement(children, {
          disabled,
          className:
            'flex-1 truncate bg-input-bg text-text-input outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled',
        })}
        {rightAdornment && <span className="ml-2">{rightAdornment}</span>}
      </div>
      {description && <span className="mt-2">{description}</span>}
    </div>
  );
};

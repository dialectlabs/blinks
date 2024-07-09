import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

export const Button = ({
  onClick,
  disabled,
  variant = 'default',
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'error' | 'default';
} & PropsWithChildren) => {
  return (
    <button
      className={clsx(
        'flex w-full items-center justify-center text-nowrap rounded-button px-6 py-3 text-text font-semibold transition-colors motion-reduce:transition-none',
        {
          'bg-button-disabled text-text-button-disabled':
            disabled && variant !== 'success',
          'bg-button text-text-button hover:bg-button-hover':
            !disabled && variant !== 'success',
          'bg-button-success text-text-button-success': variant === 'success', // success is likely to be always disabled
        },
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

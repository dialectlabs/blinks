import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { DeepLinkIcon } from './icons';

export const Button = ({
  onClick,
  disabled,
  variant = 'default',
  children,
  ctaType = 'button',
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'error' | 'default';
  ctaType?: 'button' | 'link';
} & PropsWithChildren) => {
  return (
    <button
      className={clsx(
        'rounded-button text-text relative flex w-full items-center justify-center text-nowrap px-5 py-3 font-semibold transition-colors motion-reduce:transition-none',
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
      {ctaType === 'link' && (
        <span className="absolute right-2 top-2">
          <DeepLinkIcon
            className={clsx('h-2.5 w-2.5', {
              'text-text-button-disabled': disabled && variant !== 'success',
              'text-text-button': !disabled && variant !== 'success',
              'text-text-button-success': variant === 'success', // success is likely to be always disabled
            })}
          />
        </span>
      )}
    </button>
  );
};

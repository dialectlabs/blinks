import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { DeepLinkIcon } from './icons';

export const Button = ({
  onClick,
  disabled,
  variant = 'default',
  children,
  ctaType = 'button',
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'error' | 'default';
  ctaType?: 'button' | 'link';
  className?: string;
} & PropsWithChildren) => {
  const isLink = ctaType === 'link';
  return (
    <button
      className={clsx(
        'rounded-button text-text h-input-height relative flex w-full items-center justify-center text-nowrap px-4 py-3 font-semibold transition-colors motion-reduce:transition-none',
        {
          'px-5': isLink,
          'bg-button-disabled text-text-button-disabled':
            disabled && variant !== 'success',
          'bg-button text-text-button hover:bg-button-hover':
            !disabled && variant !== 'success',
          'bg-button-success text-text-button-success': variant === 'success', // success is likely to be always disabled
        },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {isLink && (
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

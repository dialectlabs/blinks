import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

export const Button = ({
  onClick,
  disabled,
  variant,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'error' | 'default';
} & PropsWithChildren) => {
  const buttonStyle = disabled
    ? 'bg-twitter-neutral-70 text-twitter-neutral-50'
    : 'bg-twitter-accent hover:bg-twitter-accent-darker text-white';
  return (
    <button
      className={clsx(
        'flex w-full items-center justify-center rounded-full px-6 py-3 text-text font-semibold transition-colors motion-reduce:transition-none',
        buttonStyle,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

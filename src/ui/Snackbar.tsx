import clsx from 'clsx';
import type { ReactNode } from 'react';

type SnackbarVariant = 'warning' | 'error' | 'info';

interface Props {
  variant?: SnackbarVariant;
  children: ReactNode | ReactNode[];
}

const variantClasses: Record<SnackbarVariant, string> = {
  error: 'bg-transparent-error text-text-error border-stroke-error',
  warning: 'bg-transparent-warning text-text-warning border-stroke-warning',
  info: 'bg-bg-secondary text-text-secondary border-none',
};

export const Snackbar = ({ variant = 'warning', children }: Props) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        'rounded-lg border p-3 text-subtext',
      )}
    >
      {children}
    </div>
  );
};

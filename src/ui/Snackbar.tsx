import clsx from 'clsx';
import type { ReactNode } from 'react';

type SnackbarVariant = 'warning' | 'error';

interface Props {
  variant?: SnackbarVariant;
  children: ReactNode | ReactNode[];
}

const variantClasses: Record<SnackbarVariant, string> = {
  error: 'bg-twitter-error/10 text-twitter-error border-twitter-error',
  warning: 'bg-twitter-warning/10 text-twitter-warning border-twitter-warning',
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

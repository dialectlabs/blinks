import clsx from 'clsx';
import type { ReactNode } from 'react';

type SnackbarVariant = 'warning' | 'error';

interface Props {
  variant?: SnackbarVariant;
  children: ReactNode | ReactNode[];
}

const variantClasses: Record<SnackbarVariant, string> = {
  error: 'bg-blink-error/10 text-blink-error border-blink-error',
  warning: 'bg-blink-warning/10 text-blink-warning border-blink-warning',
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

import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'warning' | 'error' | 'success';

interface Props {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children?: string;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  error: 'bg-twitter-error/10 text-twitter-error',
  warning: 'bg-twitter-warning/10 text-twitter-warning',
  success: 'bg-twitter-success/10 text-twitter-success',
};

export const Badge = ({
  variant = 'warning',
  children,
  className,
  icon,
}: Props) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        'text-caption inline-flex h-5 items-center justify-center gap-1 rounded-full font-semibold leading-none',
        className,
        {
          'aspect-square w-5': !children && icon,
          'px-2.5': children,
        },
      )}
    >
      {children && <span>{children}</span>}
      {icon && <span>{icon}</span>}
    </div>
  );
};

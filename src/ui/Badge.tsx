import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'warning' | 'error' | 'default';

interface Props {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children?: string;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  error: 'bg-twitter-error/10 text-twitter-error',
  warning: 'bg-twitter-warning/10 text-twitter-warning',
  default: 'bg-[#B3B3B31A] text-[#888989]',
};

export const Badge = ({
  variant = 'default',
  children,
  className,
  icon,
}: Props) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        'inline-flex items-center justify-center gap-1 rounded-full text-subtext font-semibold leading-none',
        className,
        {
          'aspect-square p-1': !children && icon,
          'px-1.5 py-1': children,
        },
      )}
    >
      {children && <span>{children}</span>}
      {icon && <div>{icon}</div>}
    </div>
  );
};

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
  error:
    'bg-blink-error/10 text-blink-error hover:text-blink-error-lighter hover:bg-[#F62D2D1A] transition-colors motion-reduce:transition-none',
  warning:
    'bg-blink-warning/10 text-blink-warning hover:text-blink-warning-lighter transition-colors motion-reduce:transition-none',
  default:
    'bg-[#B3B3B31A] text-[#888989] hover:text-[#949CA4] transition-colors motion-reduce:transition-none',
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

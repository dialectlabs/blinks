import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'warning' | 'error' | 'default';

interface Props {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children?: string;
  className?: string;
}

interface VariantClassNames {
  container: string;
  text: string;
  icon: string;
}

const variantClasses: Record<BadgeVariant, VariantClassNames> = {
  error: {
    container: 'group bg-transparent-error',
    text: 'text-text-error group-hover:text-text-error-hover',
    icon: 'text-icon-error group-hover:text-icon-error-hover',
  },
  warning: {
    container: 'group bg-transparent-warning',
    text: 'text-text-warning group-hover:text-text-warning-hover',
    icon: 'text-icon-warning group-hover:text-icon-warning-hover',
  },
  default: {
    container: 'group bg-transparent-grey',
    text: 'text-text-primary group-hover:text-text-primary-hover',
    icon: 'text-icon-primary group-hover:text-icon-primary-hover',
  },
};

export const Badge = ({
  variant = 'default',
  children,
  className,
  icon,
}: Props) => {
  const { container, icon: iconClassNames, text } = variantClasses[variant];
  return (
    <div
      className={clsx(
        container,
        'text-subtext inline-flex items-center justify-center gap-1 rounded-full font-semibold leading-none',
        className,
        {
          'aspect-square p-1': !children && icon,
          'px-1.5 py-1': children,
        },
      )}
    >
      {children && (
        <span
          className={clsx(
            text,
            'mt-0.5 transition-colors motion-reduce:transition-none',
          )}
        >
          {children}
        </span>
      )}
      {icon && (
        <div
          className={clsx(
            iconClassNames,
            'transition-colors motion-reduce:transition-none',
          )}
        >
          {icon}
        </div>
      )}
    </div>
  );
};

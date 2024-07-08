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
    text: 'text-text-error group-hover:text-text-error-hover transition-colors motion-reduce:transition-none',
    icon: 'text-icon-error group-hover:text-icon-error-hover transition-colors motion-reduce:transition-none',
  },
  warning: {
    container: 'group bg-transparent-warning',
    text: 'text-text-warning group-hover:text-text-warning-hover transition-colors motion-reduce:transition-none',
    icon: 'text-icon-warning group-hover:text-icon-warning-hover transition-colors motion-reduce:transition-none',
  },
  default: {
    container: 'group bg-transparent-grey',
    text: 'text-text-primary group-hover:text-text-primary-hover transition-colors motion-reduce:transition-none',
    icon: 'text-icon-primary group-hover:text-icon-primary-hover transition-colors motion-reduce:transition-none',
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
        'inline-flex items-center justify-center gap-1 rounded-full text-subtext font-semibold leading-none',
        className,
        {
          'aspect-square p-1': !children && icon,
          'px-1.5 py-1': children,
        },
      )}
    >
      {children && <span className={text}>{children}</span>}
      {icon && <div className={iconClassNames}>{icon}</div>}
    </div>
  );
};

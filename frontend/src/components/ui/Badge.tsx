import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'default' | 'violet' | 'pink' | 'blue' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  violet:
    'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  pink:
    'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  blue:
    'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  success:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  danger:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-muted)]',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
  blue: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 tracking-wide',
  md: 'text-xs px-2.5 py-1 tracking-normal',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

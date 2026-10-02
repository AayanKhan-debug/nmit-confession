import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  variant?: 'default' | 'elevated' | 'glass' | 'interactive' | 'highlight';
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      as = 'div',
      variant = 'default',
      glow = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const Component = as as any;

    const baseStyles =
      'rounded-2xl p-6 sm:p-7 transition-all duration-200 border relative overflow-hidden';

    const variantStyles = {
      default:
        'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-white/10 shadow-xs dark:shadow-md dark:shadow-black/40 text-slate-900 dark:text-slate-100',
      elevated:
        'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg dark:shadow-black/50 text-slate-900 dark:text-slate-100',
      glass:
        'bg-white/80 dark:bg-slate-900/75 backdrop-blur-md border-white/60 dark:border-white/10 shadow-md text-slate-900 dark:text-slate-100',
      interactive:
        'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-white/10 shadow-xs dark:shadow-md hover:border-violet-300 dark:hover:border-violet-500/50 hover:shadow-md dark:hover:shadow-violet-500/10 text-slate-900 dark:text-slate-100',
      highlight:
        'bg-gradient-to-b from-white via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/20 border-violet-200/80 dark:border-violet-500/30 shadow-md dark:shadow-violet-950/20 text-slate-900 dark:text-slate-100',
    }[variant];

    const glowStyles = glow
      ? 'shadow-lg shadow-violet-500/10 dark:shadow-violet-500/15 border-violet-300/80 dark:border-violet-500/40'
      : '';

    return (
      <Component
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${glowStyles} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

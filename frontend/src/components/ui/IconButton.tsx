import React, { forwardRef } from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      'aria-label': ariaLabel,
      variant = 'default',
      size = 'md',
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-95 shrink-0';

    const sizeStyles = {
      sm: 'w-9 h-9 min-h-[36px] min-w-[36px] text-xs',
      md: 'w-11 h-11 min-h-[44px] min-w-[44px] text-sm',
      lg: 'w-12 h-12 min-h-[48px] min-w-[48px] text-base rounded-2xl',
    }[size];

    const variantStyles = {
      default:
        'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-2xs',
      primary:
        'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:brightness-110',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40',
    }[variant];

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;

import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-[0.98] shrink-0';

    const sizeStyles = {
      sm: 'text-xs px-3 py-2 min-h-[36px] sm:min-h-[40px] gap-1.5',
      md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
      lg: 'text-base px-5 py-3 min-h-[48px] gap-2.5 rounded-2xl',
    }[size];

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:from-violet-500 hover:via-indigo-500 hover:to-pink-500 text-white shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 hover:brightness-105 border border-white/10',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 shadow-xs',
      outline:
        'bg-transparent hover:bg-violet-50/50 dark:hover:bg-violet-950/20 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500/80',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 border border-rose-500/30',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

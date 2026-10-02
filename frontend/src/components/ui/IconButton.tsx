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
      'inline-flex items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] active:scale-95 shrink-0 min-h-[44px] min-w-[44px]';

    const sizeStyles = {
      sm: 'w-11 h-11 min-h-[44px] min-w-[44px] text-xs',
      md: 'w-11 h-11 min-h-[44px] min-w-[44px] text-sm',
      lg: 'w-12 h-12 min-h-[48px] min-w-[48px] text-base rounded-2xl',
    }[size];

    const variantStyles = {
      default:
        'bg-[#1a2234] hover:bg-[#232d45] text-slate-200 border border-white/10 shadow-2xs',
      primary:
        'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 hover:brightness-110 border border-white/10',
      ghost:
        'bg-transparent hover:bg-white/10 text-slate-400 hover:text-white',
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20',
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

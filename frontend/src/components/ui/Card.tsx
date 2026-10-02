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
      'rounded-[24px] p-6 sm:p-7 transition-all duration-200 border relative overflow-hidden';

    const variantStyles = {
      default:
        'bg-[#111827]/85 backdrop-blur-md border-white/10 shadow-xl shadow-black/40 text-slate-100',
      elevated:
        'bg-[#1a2234]/90 backdrop-blur-md border-white/10 shadow-2xl shadow-black/50 text-slate-100',
      glass:
        'bg-[#111827]/75 backdrop-blur-lg border-white/15 shadow-xl shadow-black/50 text-slate-100',
      interactive:
        'bg-[#111827]/85 backdrop-blur-md border-white/10 shadow-xl shadow-black/40 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-violet-500/10 text-slate-100',
      highlight:
        'bg-gradient-to-b from-[#111827] via-[#111827] to-violet-950/25 border-violet-500/30 shadow-xl shadow-violet-950/20 text-slate-100',
    }[variant];

    const glowStyles = glow
      ? 'shadow-lg shadow-violet-500/15 border-violet-500/40'
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

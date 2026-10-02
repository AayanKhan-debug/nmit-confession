import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MessageSquareOff } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={twMerge(
        clsx(
          'p-8 sm:p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center max-w-md mx-auto shadow-sm',
          className
        )
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-4 shrink-0 shadow-inner">
        {icon || <MessageSquareOff className="w-7 h-7" aria-hidden="true" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

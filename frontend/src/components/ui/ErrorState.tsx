import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something hit a snag',
  message = 'We could not load the campus confessions right now. Check your connection or try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'p-8 sm:p-10 text-center rounded-3xl bg-[var(--bg-surface)] border border-rose-500/30 flex flex-col items-center justify-center max-w-md mx-auto shadow-sm',
          className
        )
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 shrink-0">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}

    </div>
  );
};

export default ErrorState;

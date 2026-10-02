import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Brewing campus confessions...',
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={twMerge(
        clsx(
          'p-8 sm:p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center max-w-md mx-auto shadow-sm',
          className
        )
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-violet-500/20">
        <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {message}
      </p>
      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
};

export default LoadingState;

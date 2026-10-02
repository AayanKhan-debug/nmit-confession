import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  className,
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  return (
    <div
      aria-hidden="true"
      className={twMerge(
        clsx(
          'animate-shimmer bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={twMerge('space-y-2.5', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx(
            'h-3.5',
            i === lines - 1 ? 'w-3/5' : i === 0 ? 'w-full' : 'w-4/5'
          )}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      aria-hidden="true"
      className={twMerge(
        'p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={3} />
      <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};

export default Skeleton;

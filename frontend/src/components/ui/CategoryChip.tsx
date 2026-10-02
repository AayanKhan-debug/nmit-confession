import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CategoryInfo {
  key: string;
  label: string;
  emoji: string;
  colorClass?: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  ALL: { key: 'ALL', label: 'All', emoji: '✨' },
  CAMPUS_LIFE: { key: 'CAMPUS_LIFE', label: 'Campus Life', emoji: '🏫' },
  ADVICE: { key: 'ADVICE', label: 'Advice', emoji: '💡' },
  RANT: { key: 'RANT', label: 'Rant', emoji: '🗣️' },
  FUNNY: { key: 'FUNNY', label: 'Funny', emoji: '😂' },
  CRUSH: { key: 'CRUSH', label: 'Crushes', emoji: '💖' },
  OTHER: { key: 'OTHER', label: 'Other', emoji: '🔮' },
};

export interface CategoryChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  categoryKey: string;
  selected?: boolean;
  count?: number;
  onSelectCategory?: (key: string) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  categoryKey,
  selected = false,
  count,
  onSelectCategory,
  onClick,
  className,
  ...props
}) => {
  const info = CATEGORIES[categoryKey] || {
    key: categoryKey,
    label: categoryKey,
    emoji: '📌',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onSelectCategory?.(categoryKey);
  };

  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      onClick={handleClick}
      className={twMerge(
        clsx(
          'min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none whitespace-nowrap cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          selected
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 border border-violet-400/30 font-bold'
            : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)] shadow-xs'
        ),
        className
      )}
      {...props}
    >
      <span className="text-base leading-none" role="img" aria-hidden="true">
        {info.emoji}
      </span>
      <span>{info.label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
            selected
              ? 'bg-white/20 text-white'
              : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default CategoryChip;

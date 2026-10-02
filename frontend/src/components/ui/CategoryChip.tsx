import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCategoryTheme, CATEGORY_THEMES, type CategoryTheme } from '../../utils/categoryTheme';

export { CATEGORY_THEMES };
export type { CategoryTheme };

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
  const theme = getCategoryTheme(categoryKey);

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
          'min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 select-none whitespace-nowrap cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
          selected
            ? theme.selectedClass
            : 'bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-white/20 shadow-xs'
        ),
        className
      )}
      {...props}
    >
      <span className="text-base leading-none" role="img" aria-hidden="true">
        {theme.emoji}
      </span>
      <span>{theme.label}</span>
      {typeof count === 'number' && (
        <span
          className={clsx(
            'text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
            selected
              ? 'bg-white/20 text-white'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default CategoryChip;

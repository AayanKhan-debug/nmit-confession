import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, type Theme } from '../../context/ThemeContext';

export interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className,
}) => {
  const { theme, setTheme } = useTheme();

  // If compact, clicking cycles: dark -> light -> system -> dark
  const handleCycle = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const themeIcon = {
    dark: <Moon className="w-4 h-4 text-violet-400" aria-hidden="true" />,
    light: <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />,
    system: <Laptop className="w-4 h-4 text-sky-400" aria-hidden="true" />,
  }[theme];

  const themeLabel = {
    dark: 'Dark mode',
    light: 'Light mode',
    system: 'System theme',
  }[theme];

  if (variant === 'segmented') {
    const options: { mode: Theme; label: string; icon: React.ReactNode }[] = [
      { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
      { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
      { mode: 'system', label: 'System', icon: <Laptop className="w-3.5 h-3.5" /> },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Theme mode"
        className={twMerge(
          'inline-flex items-center p-1 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]',
          className
        )}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.mode)}
              className={clsx(
                'min-h-[36px] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                isSelected
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCycle}
      aria-label={`Current theme: ${themeLabel}. Click to switch theme`}
      title={`Theme: ${themeLabel} (click to change)`}
      className={twMerge(
        clsx(
          'min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-2xl p-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          className
        )
      )}
    >
      {themeIcon}
    </button>
  );
};

export default ThemeToggle;

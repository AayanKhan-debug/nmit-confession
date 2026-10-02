import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  charCount?: number;
  maxCharCount?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      charCount,
      maxCharCount,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              {label}
            </label>
          )}
          {typeof charCount === 'number' && typeof maxCharCount === 'number' && (
            <span
              className={`text-xs font-mono ${
                charCount > maxCharCount
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {charCount} / {maxCharCount}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-2xl p-4 text-sm leading-relaxed transition-all duration-150 resize-y min-h-[120px]
            bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
            border ${
              error
                ? 'border-rose-400 dark:border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-violet-500 dark:focus:border-violet-400'
            }
            focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

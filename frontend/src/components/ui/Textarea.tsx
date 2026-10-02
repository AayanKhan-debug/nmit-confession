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
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              {label}
            </label>
          )}
          {typeof charCount === 'number' && typeof maxCharCount === 'number' && (
            <span
              className={`text-xs font-mono ${
                charCount > maxCharCount
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-500'
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
          className={`w-full rounded-[20px] p-4 text-sm leading-relaxed transition-all duration-150 resize-y min-h-[140px]
            bg-[#111827]/90 text-slate-100 placeholder-slate-500
            border ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-white/10 hover:border-white/20 focus:border-violet-500'
            }
            focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:ring-offset-2 focus:ring-offset-[#0B0F19]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-semibold text-rose-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const icons: Record<ToastType, React.ReactNode> = {
  info: <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" aria-hidden="true" />,
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />,
};

const styles: Record<ToastType, string> = {
  info: 'bg-[var(--bg-surface-elevated)] border-sky-500/30 text-[var(--text-primary)]',
  success: 'bg-[var(--bg-surface-elevated)] border-emerald-500/30 text-[var(--text-primary)]',
  warning: 'bg-[var(--bg-surface-elevated)] border-amber-500/30 text-[var(--text-primary)]',
  error: 'bg-[var(--bg-surface-elevated)] border-rose-500/30 text-[var(--text-primary)]',
};

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={twMerge(
        clsx(
          'w-full max-w-sm p-4 rounded-2xl border shadow-lg backdrop-blur-md flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2',
          styles[type],
          className
        )
      )}
    >
      {icons[type]}
      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className="text-sm font-semibold tracking-tight leading-snug mb-0.5">
            {title}
          </h4>
        )}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
          {message}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;

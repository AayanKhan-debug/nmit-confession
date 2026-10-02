import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import IconButton from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // Focus trap, Escape key, initial focus, and focus restoration
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableElements = Array.from(focusable).filter(
          (el) => !el.hasAttribute('disabled')
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === dialog) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    // Initial focus inside modal
    const focusTimer = setTimeout(() => {
      const dialog = dialogRef.current;
      if (dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'input, select, textarea, button:not([aria-label="Close modal"]), [href]'
        );
        const target = Array.from(focusable).find((el) => !el.hasAttribute('disabled'));
        if (target) {
          target.focus();
        } else {
          dialog.focus();
        }
      }
    }, 40);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={twMerge(
          clsx(
            'relative w-full rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200',
            maxWidthMap[maxWidth],
            className
          )
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1 pr-6">
            {title && (
              <h2 id={titleId} className="text-lg font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <IconButton
            aria-label="Close modal"
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="shrink-0 -mr-2 -mt-2"
          >
            <X className="w-4 h-4" />
          </IconButton>

        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] text-sm text-[var(--text-secondary)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 sm:px-6 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

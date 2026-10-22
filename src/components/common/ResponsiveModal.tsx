'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  preventBackdropClose?: boolean;
  isSubmitting?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  headerExtras?: React.ReactNode;
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg',
  preventBackdropClose = false,
  isSubmitting = false,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  headerExtras,
}: ResponsiveModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Keep latest callbacks in stable refs so re-renders in child forms don't trigger effect re-runs
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isSubmittingRef = useRef(isSubmitting);
  isSubmittingRef.current = isSubmitting;

  // Width mapping
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  }[maxWidth] || 'max-w-lg';

  // Keyboard navigation & accessibility (Escape key)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isSubmittingRef.current) {
          e.preventDefault();
          onCloseRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Body scroll lock and initial focus (ONLY runs when isOpen changes, NEVER on keystrokes/re-renders)
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scrolling
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // Set initial focus ONLY once upon opening:
    // If the user hasn't already focused an element, focus the first input or modal container
    const focusTimer = setTimeout(() => {
      if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        try {
          previousActiveElement.current.focus();
        } catch {
          // Safe ignore
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !preventBackdropClose && !isSubmitting) {
      onClose();
    }
  };

  const titleId = 'responsive-modal-title';
  const descId = description ? 'responsive-modal-description' : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overscroll-contain animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Dialog Frame */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidthClasses} max-h-[92vh] max-h-[92dvh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden outline-hidden animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Fixed / Pinned Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0 z-10 ${headerClassName}`}
        >
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base sm:text-lg font-bold text-[#082B50] truncate">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs text-[#667085] mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerExtras}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 ${bodyClassName}`}
        >
          {children}
        </div>

        {/* Fixed / Pinned Footer (if provided) */}
        {footer && (
          <div
            className={`px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs shrink-0 z-10 ${footerClassName}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponsiveModal;

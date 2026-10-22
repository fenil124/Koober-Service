'use client';

import React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  itemName?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = 'Delete this item?',
  description,
  itemName,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 sm:p-6 shadow-2xl transition-all duration-200 border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] max-h-[90dvh] overflow-y-auto overscroll-contain">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <AlertDialogPrimitive.Title className="text-base font-bold text-[#082B50]">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {itemName ? (
                  <>
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-slate-900">&ldquo;{itemName}&rdquo;</span>?{' '}
                  </>
                ) : null}
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <AlertDialogPrimitive.Cancel asChild>
              <button
                type="button"
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <button
                type="button"
                disabled={isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  await onConfirm();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isLoading ? 'Deleting...' : 'Delete'}</span>
              </button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

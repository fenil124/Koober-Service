'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { InquiryStatus } from '@/types';

interface InquiryStatusBadgeSelectProps {
  status: InquiryStatus;
  inquiryId: string;
  onStatusChange: (newStatus: InquiryStatus) => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<
  InquiryStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  New: {
    label: 'New',
    bgClass: 'bg-blue-50 hover:bg-blue-100/80',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    dotClass: 'bg-blue-500',
  },
  Contacted: {
    label: 'Contacted',
    bgClass: 'bg-amber-50 hover:bg-amber-100/80',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500',
  },
  'Quotation Given': {
    label: 'Quotation Given',
    bgClass: 'bg-purple-50 hover:bg-purple-100/80',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    dotClass: 'bg-purple-500',
  },
  Confirmed: {
    label: 'Confirmed',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100/80',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  Completed: {
    label: 'Completed',
    bgClass: 'bg-teal-50 hover:bg-teal-100/80',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
    dotClass: 'bg-teal-500',
  },
  Cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-red-50 hover:bg-red-100/80',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    dotClass: 'bg-red-500',
  },
};

const ALL_STATUSES: InquiryStatus[] = [
  'New',
  'Contacted',
  'Quotation Given',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export function InquiryStatusBadgeSelect({
  status,
  inquiryId,
  onStatusChange,
  isLoading = false,
  disabled = false,
}: InquiryStatusBadgeSelectProps) {
  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG['New'];

  return (
    <SelectPrimitive.Root
      value={status}
      onValueChange={(val) => onStatusChange(val as InquiryStatus)}
      disabled={disabled || isLoading}
    >
      <SelectPrimitive.Trigger
        aria-label={`Change status for inquiry ${inquiryId}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all select-none shadow-2xs outline-none focus:ring-2 focus:ring-[#0B2C50]/20 disabled:opacity-60 cursor-pointer ${currentConfig.bgClass} ${currentConfig.textClass} ${currentConfig.borderClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentConfig.dotClass}`} />
        <SelectPrimitive.Value>
          <span>{currentConfig.label}</span>
        </SelectPrimitive.Value>
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin shrink-0 text-slate-500 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0 ml-0.5" />
        )}
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          align="start"
          className="z-50 min-w-[160px] bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-1.5 animate-in fade-in zoom-in-95"
        >
          <SelectPrimitive.Viewport className="space-y-0.5">
            {ALL_STATUSES.map((st) => {
              const cfg = STATUS_CONFIG[st];
              return (
                <SelectPrimitive.Item
                  key={st}
                  value={st}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#14243A] hover:bg-slate-100/80 focus:bg-slate-100 focus:outline-none cursor-pointer transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`} />
                    <SelectPrimitive.ItemText>{cfg.label}</SelectPrimitive.ItemText>
                  </div>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="w-3.5 h-3.5 text-[#0B2C50] stroke-[2.5]" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

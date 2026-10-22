'use client';

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, MessageCircle, HelpCircle, X } from 'lucide-react';
import { SiteSettings } from '@/types';
import { getWhatsAppUrl, getTelUrl } from '@/lib/utils';

interface FloatingContactWidgetProps {
  settings?: SiteSettings;
}

export function FloatingContactWidget({ settings }: FloatingContactWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { pathname } = useLocation();

  // Hide on admin routes and admin login
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const phone = settings?.phone || '+91 98765 43210';
  const whatsapp = settings?.whatsapp || '+91 98765 43210';

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none"
      role="region"
      aria-label="Contact options"
    >
      {/* Expanded Actions Menu */}
      {isExpanded && (
        <div className="mb-3 flex flex-col gap-2.5 items-end animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* WhatsApp Action */}
          <a
            href={getWhatsAppUrl(whatsapp, 'Hello Koober Services, I need assistance with booking a ride.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#00A859] text-white text-xs font-bold shadow-lg hover:bg-[#00924c] hover:scale-105 active:scale-95 transition-all duration-150 group"
            aria-label="Chat on WhatsApp"
          >
            <span className="font-semibold">Chat on WhatsApp</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </div>
          </a>

          {/* Phone Call Action */}
          <a
            href={getTelUrl(phone)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white text-[#071A35] border border-slate-200 text-xs font-bold shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-150 group"
            aria-label={`Call ${phone}`}
          >
            <span className="font-semibold">{phone}</span>
            <div className="w-6 h-6 rounded-full bg-[#071A35] text-white flex items-center justify-center">
              <Phone className="w-3.5 h-3.5 fill-current" />
            </div>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      {isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#071A35] text-white hover:bg-[#0E3A68] border border-[#F5B936]/40 shadow-xl transition-all duration-200 cursor-pointer"
          aria-label="Close contact options"
        >
          <X className="w-5 h-5 text-[#F5B936]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#071A35] text-white hover:bg-[#0E3A68] border border-[#F5B936]/50 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          aria-label="Need Help? Open contact options"
          aria-expanded={isExpanded}
        >
          <div className="w-2 h-2 rounded-full bg-[#F5B936] animate-pulse" />
          <HelpCircle className="w-4 h-4 text-[#F5B936] group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide text-white">Need Help?</span>
        </button>
      )}
    </div>
  );
}

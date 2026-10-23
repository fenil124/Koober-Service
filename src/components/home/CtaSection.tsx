'use client';

import { motion } from 'framer-motion';
import { ArrowRight, PhoneCall } from 'lucide-react';
import { HomepageSection, SiteSettings } from '@/types';
import { getTelUrl } from '@/lib/utils';

interface CtaSectionProps {
  onBookClick: () => void;
  phone?: string;
  content?: HomepageSection;
  settings?: SiteSettings;
}

export function CtaSection({
  onBookClick,
  phone = '+91 98765 43210',
  content,
  settings,
}: CtaSectionProps) {
  const displayPhone = settings?.phone || phone;

  return (
    <section className="relative py-14 sm:py-20 bg-[#081A33] overflow-hidden text-white select-none">
      {/* Ambient subtle navy & gold radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#F5B936]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.22em]">
            <span className="w-5 h-[1.5px] bg-[#F5B936]" />
            <span>{content?.badge || 'START YOUR JOURNEY'}</span>
            <span className="w-5 h-[1.5px] bg-[#F5B936]" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {content?.title || 'Ready for Your Next Journey?'}
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
            {content?.body ||
              content?.subtitle ||
              'Tell us where you want to go, and our team will help you choose the right ride.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onBookClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#081A33] text-xs sm:text-sm font-extrabold shadow-lg shadow-[#F5B936]/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>{settings?.cta_text || 'Book Your Ride'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <a
              href={getTelUrl(displayPhone)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all duration-200 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#F5B936]" />
              <span>Contact Us</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

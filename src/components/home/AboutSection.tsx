'use client';

import Image from '@/components/common/Image';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, CalendarCheck, ArrowRight } from 'lucide-react';
import { HomepageSection, SiteSettings } from '@/types';

interface AboutSectionProps {
  content?: HomepageSection;
  featuresContent?: HomepageSection;
  settings?: SiteSettings;
}

export function AboutSection({ content, featuresContent }: AboutSectionProps) {
  const benefitHighlights = [
    {
      title: 'Comfortable Vehicles',
      description: 'Clean, sanitized, and air-conditioned cars for relaxing trips.',
      icon: ShieldCheck,
    },
    {
      title: 'Professional Chauffeurs',
      description: 'Punctual, courteous, and seasoned highway and city drivers.',
      icon: UserCheck,
    },
    {
      title: 'Simple Booking Process',
      description: 'Effortless enquiry submission with prompt, personalized confirmation.',
      icon: CalendarCheck,
    },
  ];

  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#F5F8FC] border-b border-[#E2E8F0] scroll-mt-20 sm:scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: High-Quality Imagery with Premium Accents */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-white aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src={content?.image_url || '/images/airport-transfer.jpg'}
                alt="Koober Services Chauffeur-Driven Travel Comfort"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081A33]/70 via-transparent to-transparent pointer-events-none" />

              {/* Decorative Brand Accent Tag */}
              <div className="absolute bottom-5 left-5 right-5 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#F5B936] uppercase tracking-wider block">
                    TRUSTED EXCELLENCE
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#081A33]">
                    Your Reliable Road Travel Partner
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#081A33] text-[#F5B936] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  KS
                </div>
              </div>
            </div>

            {/* Subtle background golden glow blur */}
            <div className="absolute -z-10 -bottom-6 -left-6 w-56 h-56 bg-[#F5B936]/15 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Right Column: Two-Paragraph Copy & 3 Compact Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.2em] mb-2">
              <span className="w-5 h-[1.5px] bg-[#F5B936]" />
              <span>{content?.badge || 'ABOUT KOOBER SERVICES'}</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#081A33] tracking-tight leading-tight">
              {content?.title || 'Every Journey Deserves a Better Ride'}
            </h2>

            {/* Paragraph 1 */}
            <p className="mt-4 text-sm sm:text-base text-[#64748B] leading-relaxed">
              {content?.body ||
                'At Koober Services, we make every journey more comfortable with dependable chauffeur-driven transportation. Whether you need an airport transfer, a city ride, or an outstation trip, our focus is on comfort, convenience, and professional service.'}
            </p>

            {/* Paragraph 2 */}
            <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
              {content?.subtitle ||
                'We help customers choose the right vehicle for their journey, with clear pricing where available and a simple enquiry process. Our team contacts customers to discuss their requirements and confirm travel arrangements.'}
            </p>

            {/* Features & Promise Highlights Banner (Dynamic from Admin) */}
            {featuresContent?.body && (
              <div className="mt-4 p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5B936] uppercase tracking-wider mb-1">
                  <span>{featuresContent.badge || 'OUR PROMISE'}</span>
                  <span>&bull;</span>
                  <span className="text-[#081A33] font-extrabold">{featuresContent.title || 'Why Choose Koober Services'}</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {featuresContent.body}
                </p>
              </div>
            )}

            {/* 3 Compact Benefit Highlights */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {benefitHighlights.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.2 + idx * 0.08 }}
                    className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#F5B936]/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#081A33] text-[#F5B936] flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#081A33]">
                      {benefit.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Gold 'Explore Our Fleet' Button */}
            <div className="mt-7 sm:mt-8">
              <a
                href="#fleet"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#081A33] text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>Explore Our Fleet</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

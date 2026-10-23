'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Pause, Play, MessageSquarePlus } from 'lucide-react';
import { Review } from '@/types';
import { WriteReviewModal } from '@/components/common/WriteReviewModal';

interface ReviewsSectionProps {
  reviews: Review[];
  onReviewSubmitted?: () => void;
}

const TARGET_SPEED_PX_PER_SEC = 50; // Constant scrolling speed in pixels per second

export function ReviewsSection({ reviews, onReviewSubmitted }: ReviewsSectionProps) {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Canonical initial reviews matching reference
  const canonicalReviews: Review[] = [
    {
      id: 'rev-1',
      customer_name: 'Rohit Patel',
      rating: 5,
      review_text: 'Excellent service! On-time pickup and very professional driver. Highly recommended for airport transfers and outstation journeys!',
      is_published: true,
      is_demo: true,
      display_order: 1,
    },
    {
      id: 'rev-2',
      customer_name: 'Priya Shah',
      rating: 5,
      review_text: 'Very comfortable journey to Mumbai Airport. Clean car, pleasant fragrance, and exceptionally courteous chauffeur.',
      is_published: true,
      is_demo: true,
      display_order: 2,
    },
    {
      id: 'rev-3',
      customer_name: 'Amit Desai',
      rating: 5,
      review_text: 'Booked Innova for family trip to Udaipur. Smooth highway ride, safe overtaking, and great experience. Will book again!',
      is_published: true,
      is_demo: true,
      display_order: 3,
    },
    {
      id: 'rev-4',
      customer_name: 'Neha Modi',
      rating: 5,
      review_text: 'Traveled from Surat to Pune with senior parents. Driver drove very gently, stopped at clean eateries, and was polite throughout.',
      is_published: true,
      is_demo: true,
      display_order: 4,
    },
  ];

  // ONLY show approved reviews
  const approvedReviews = reviews.filter((r) => r.is_published);
  const baseList = approvedReviews.length > 0 ? approvedReviews : canonicalReviews;

  // Build seamless loop list: ensure track is wide enough on all screens
  // We repeat base items if few reviews exist, then duplicate once for 0% -> -50% infinite loop
  const repeatedCount = Math.max(1, Math.ceil(6 / baseList.length));
  const fullSequence: Review[] = [];
  for (let i = 0; i < repeatedCount; i++) {
    fullSequence.push(...baseList);
  }

  // Exactly duplicate fullSequence to achieve seamless 0% -> -50% loop
  const loopList = [...fullSequence, ...fullSequence];

  // Duration in seconds: trackWidth / 2 / speed
  const [animationDuration, setAnimationDuration] = useState<number>(() => {
    // Card width (~360px on sm+) + 20px gap = 380px per item
    const estimatedDistancePx = (loopList.length / 2) * 380;
    return Math.max(20, Math.round(estimatedDistancePx / TARGET_SPEED_PX_PER_SEC));
  });

  // Dynamically calculate and maintain constant speed based on rendered track dimensions
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measureAndSetDuration = () => {
      // scrollWidth is the total width of the entire duplicated track
      const totalWidth = el.scrollWidth;
      // Distance traveled in one full cycle (0% to -50%) is totalWidth / 2
      const halfTrackDistancePx = totalWidth / 2;

      if (halfTrackDistancePx > 0) {
        const calculatedSeconds = halfTrackDistancePx / TARGET_SPEED_PX_PER_SEC;
        setAnimationDuration((prev) => {
          if (Math.abs(prev - calculatedSeconds) < 0.2) return prev;
          return Math.round(calculatedSeconds * 10) / 10;
        });
      }
    };

    measureAndSetDuration();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measureAndSetDuration();
      });
      ro.observe(el);
    }

    window.addEventListener('resize', measureAndSetDuration);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measureAndSetDuration);
    };
  }, [loopList.length]);

  return (
    <section
      id="reviews"
      className="py-16 sm:py-24 bg-[#F5F8FC] border-b border-[#E2E8F0] scroll-mt-20 sm:scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.2em] mb-1.5">
              <span className="w-5 h-[1.5px] bg-[#F5B936]" />
              <span>WHAT OUR CUSTOMERS SAY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#081A33] tracking-tight">
              Trusted by Happy Travellers
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Real stories. Real experiences.
            </p>
          </div>

          {/* Action buttons: Pause/Play Ticker & Write a Review */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Ticker Play / Pause accessibility toggle */}
            {!prefersReducedMotion && (
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-[#081A33] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
                aria-label={isPaused ? 'Resume scrolling reviews' : 'Pause scrolling reviews'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-[#F5B936]" /> : <Pause className="w-3.5 h-3.5 text-[#081A33]" />}
                <span className="hidden md:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#081A33] hover:bg-[#102846] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#F5B936]" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continuous Marquee Ticker Track (Right to Left) */}
      <div
        className="relative w-full overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right gradient fade edges for cinematic polish */}
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F5F8FC] to-transparent z-10 pointer-events-none" />
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F5F8FC] to-transparent z-10 pointer-events-none" />

        {prefersReducedMotion ? (
          // Reduced motion: horizontal scrollable row
          <div className="flex overflow-x-auto gap-5 px-4 sm:px-8 pb-4">
            {baseList.map((rev) => (
              <div
                key={rev.id}
                className="w-80 shrink-0 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#081A33] text-[#F5B936] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {rev.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#081A33]">{rev.customer_name}</h3>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#F5B936] text-[#F5B936]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed italic">
                    &ldquo;{rev.review_text}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Continuous seamless marquee animation (CSS Hardware Accelerated with Constant Velocity)
          <div
            ref={trackRef}
            style={{
              animationDuration: `${animationDuration}s`,
              ['--marquee-duration' as any]: `${animationDuration}s`,
            }}
            className={`animate-marquee gap-5 px-3 ${isPaused ? 'marquee-paused' : ''}`}
          >
            {loopList.map((rev, index) => {
              const isFirstHalf = index < loopList.length / 2;
              return (
                <div
                  key={`${rev.id}-${index}`}
                  aria-hidden={!isFirstHalf}
                  className="w-[320px] sm:w-[360px] shrink-0 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] hover:border-[#F5B936]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Customer Header */}
                    <div className="flex items-center gap-3.5 mb-3.5">
                      <div className="w-11 h-11 rounded-full bg-[#081A33] text-[#F5B936] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {rev.customer_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#081A33]">{rev.customer_name}</h3>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#F5B936] text-[#F5B936]" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed line-clamp-4">
                      &ldquo;{rev.review_text}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified Trip
                    </span>
                    <span>Koober Services</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WriteReviewModal
        open={isWriteModalOpen}
        onOpenChange={setIsWriteModalOpen}
        onSuccess={onReviewSubmitted}
      />
    </section>
  );
}

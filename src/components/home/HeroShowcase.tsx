'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from '@/components/common/Image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  MapPin,
  Building2,
  ShieldCheck,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { Car, HomepageSection, SiteSettings } from '@/types';

// Canonical showcase vehicles with valid transparent Cloudinary cutout fallbacks
const SHOWCASE_VEHICLES = [
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Ertiga',
    fullName: 'Maruti Suzuki Ertiga',
    image: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645560/royalrides/cars/1792645541561_ertiga-transparent.png',
    fallbackImage: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645458/royalrides/cars/1792645440297_ertiga-transparent.png',
    seating: '6+1 Seating',
    type: 'MPV',
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Innova',
    fullName: 'Toyota Innova Crysta',
    image: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    fallbackImage: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    seating: '7+1 Seating',
    type: 'MPV',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Swift Dzire',
    fullName: 'Maruti Suzuki Swift Dzire',
    image: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583207/royalrides/cars/oyui0yleedzw2vog1o9y.png',
    fallbackImage: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583207/royalrides/cars/oyui0yleedzw2vog1o9y.png',
    seating: '4+1 Seating',
    type: 'Sedan',
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Urbania Traveller',
    fullName: 'Force Urbania Luxury Van',
    image: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583210/royalrides/cars/au4kkl0peafch8dn64cy.png',
    fallbackImage: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583210/royalrides/cars/au4kkl0peafch8dn64cy.png',
    seating: '12+1 Seating',
    type: 'Luxury Van',
  },
];

interface HeroShowcaseProps {
  cars?: Car[];
  content?: HomepageSection;
  settings?: SiteSettings;
  onBookClick?: () => void;
}

export function HeroShowcase({ cars = [], content, settings, onBookClick }: HeroShowcaseProps) {
  const fallbackBg = '/images/hero-bg.jpg';
  const initialBg = content?.image_url || (content as any)?.hero_image_url || fallbackBg;
  const [bgSrc, setBgSrc] = useState<string>(initialBg);

  useEffect(() => {
    const nextBg = content?.image_url || (content as any)?.hero_image_url || fallbackBg;
    setBgSrc(nextBg);
  }, [content?.image_url, (content as any)?.hero_image_url]);

  // Merge live database vehicle records (hero_image_url, image_url, name) from MongoDB Atlas & Cloudinary
  const showcaseVehicles = useMemo(() => {
    return SHOWCASE_VEHICLES.map((canonical) => {
      const dbCar =
        cars.find((c) => c.id === canonical.id) ||
        cars.find((c) => c.name.toLowerCase() === canonical.name.toLowerCase()) ||
        cars.find((c) => c.name.toLowerCase().includes(canonical.name.toLowerCase().split(' ')[0]));

      const resolvedHeroImg = dbCar?.hero_image_url || dbCar?.image_url || canonical.image;
      const fallbackImg = dbCar?.image_url || canonical.fallbackImage || canonical.image;

      return {
        ...canonical,
        name: dbCar?.name || canonical.name,
        fullName: dbCar?.name || canonical.fullName,
        image: resolvedHeroImg,
        fallbackImage: fallbackImg,
      };
    });
  }, [cars]);

  // Track failed vehicle images and attempt fallback or graceful card
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = useCallback((vehicleName: string, attemptedUrl: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[HeroShowcase] Vehicle image failed to load for "${vehicleName}" from URL: ${attemptedUrl}`);
    }
    setFailedImages((prev) => {
      if (prev[attemptedUrl]) return prev;
      return { ...prev, [attemptedUrl]: true };
    });
  }, []);

  const getVehicleImageSrc = useCallback(
    (vehicle: (typeof showcaseVehicles)[0]) => {
      if (failedImages[vehicle.image] && vehicle.fallbackImage && vehicle.fallbackImage !== vehicle.image) {
        return vehicle.fallbackImage;
      }
      return vehicle.image;
    },
    [failedImages]
  );

  const [activeIndex, setActiveIndex] = useState(0); // 0 = Ertiga initially
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle to next vehicle
  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % showcaseVehicles.length);
  }, [showcaseVehicles.length]);

  // Listen to visibilitychange and prefers-reduced-motion
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Reliable 2.5s continuous automatic animation
  useEffect(() => {
    if (isTabHidden || prefersReducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 2500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTabHidden, prefersReducedMotion, nextSlide]);

  const currentCar = showcaseVehicles[activeIndex % showcaseVehicles.length];

  // Side positions relative to active index:
  // -1 is Left, +1 is Right, +2 is Far Right
  const getCarAtOffset = (offset: number) => {
    const total = showcaseVehicles.length;
    const idx = (activeIndex + offset + total) % total;
    return showcaseVehicles[idx];
  };

  const leftCar = getCarAtOffset(-1);
  const rightCar = getCarAtOffset(1);
  const farRightCar = getCarAtOffset(2);

  const leftImgSrc = getVehicleImageSrc(leftCar);
  const currentImgSrc = getVehicleImageSrc(currentCar);
  const rightImgSrc = getVehicleImageSrc(rightCar);
  const farRightImgSrc = getVehicleImageSrc(farRightCar);

  return (
    <section
      id="home"
      className="relative w-full min-h-[750px] sm:min-h-[780px] lg:min-h-[840px] bg-[#071A35] overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-6 select-none"
    >
      {/* 1. Cinematic Background (Dynamic with fallback) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgSrc}
          alt={content?.title || 'Koober Travels Chauffeur-Driven Luxury Car Rental'}
          fill
          priority
          sizes="100vw"
          unoptimized={Boolean(bgSrc?.startsWith('data:'))}
          className="object-cover object-center"
          onError={() => {
            if (bgSrc !== fallbackBg) {
              setBgSrc(fallbackBg);
            }
          }}
        />
        {/* Navy ambient gradients blending with brand aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A35]/85 via-transparent to-[#071A35]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A35] via-[#071A35]/20 to-transparent pointer-events-none" />
      </div>

      {/* 2. Centered Typography Section */}
      <div className="relative z-20 text-center px-4 sm:px-6 pt-2 sm:pt-4">
        {/* Eyebrow: — PREMIUM CHAUFFEUR-DRIVEN CAR RENTAL — */}
        <div className="flex items-center justify-center gap-3 text-[#F5B936] text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.22em] mb-2 sm:mb-3">
          <span className="w-5 sm:w-8 h-[1.5px] bg-[#F5B936]/80" />
          <span>{content?.badge || 'PREMIUM CHAUFFEUR-DRIVEN CAR RENTAL'}</span>
          <span className="w-5 sm:w-8 h-[1.5px] bg-[#F5B936]/80" />
        </div>

        {/* Large Heading: Comfortable Rides for Every Journey */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          {content?.title || 'Comfortable Rides for Every Journey'}
        </h1>

        {/* Dynamic Subtitle */}
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-[15px] font-medium text-slate-200/90 tracking-wide max-w-xl mx-auto px-4">
          {content?.subtitle || 'Airport Transfers • Outstation Trips • City Travel & More'}
        </p>

        {/* Rounded Gold CTA Button */}
        <div className="mt-4 sm:mt-5 flex justify-center">
          <button
            type="button"
            onClick={onBookClick}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs sm:text-sm font-extrabold shadow-lg shadow-[#F5B936]/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>{settings?.cta_text || 'Book Your Ride'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 3. Showcase Stage on Reflective Floor with Glowing Gold Circle */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 flex flex-col items-center">
        {/* Stage Canvas */}
        <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] flex items-end justify-center overflow-visible">
          {/* Glowing Golden Neon Circular Platform Ring on the floor */}
          <div className="absolute bottom-3 sm:bottom-6 w-[320px] sm:w-[480px] lg:w-[620px] h-[70px] sm:h-[95px] lg:h-[120px] rounded-[100%] border-[2.5px] sm:border-[3px] border-[#F5B936] shadow-[0_0_35px_#F5B936,inset_0_0_20px_#F5B936] pointer-events-none z-10">
            {/* Concentric inner glow ring */}
            <div className="absolute inset-2 sm:inset-3 rounded-[100%] border border-[#F5B936]/40 blur-[0.5px]" />
          </div>

          {/* Left Supporting Vehicle (Desktop / Tablet) */}
          <div className="hidden md:block absolute left-[3%] lg:left-[8%] bottom-6 sm:bottom-8 w-[240px] lg:w-[320px] h-[140px] lg:h-[190px] z-15 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${leftCar.name}-${leftImgSrc}`}
                initial={{ opacity: 0, x: -20, scale: 0.85 }}
                animate={{ opacity: 0.8, x: 0, scale: 0.88 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative w-full h-full filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.65)]"
              >
                {failedImages[leftImgSrc] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center select-none">
                    <span className="text-[#F5B936] text-xs font-bold uppercase tracking-wider">{leftCar.name}</span>
                  </div>
                ) : (
                  <Image
                    src={leftImgSrc}
                    alt={leftCar.name}
                    fill
                    unoptimized={true}
                    className="object-contain"
                    sizes="(max-width: 1024px) 240px, 320px"
                    onError={() => handleImageError(leftCar.name, leftImgSrc)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center Prominent Featured Vehicle */}
          <div className="relative z-25 w-[280px] sm:w-[420px] lg:w-[530px] h-[170px] sm:h-[250px] lg:h-[310px] flex flex-col items-center justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={`center-${currentCar.name}-${currentImgSrc}`}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.85)]"
              >
                {failedImages[currentImgSrc] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center select-none">
                    <span className="text-[#F5B936] text-sm font-bold uppercase tracking-wider">{currentCar.name}</span>
                    <span className="text-white/70 text-xs mt-1">{currentCar.seating} • {currentCar.type}</span>
                  </div>
                ) : (
                  <Image
                    src={currentImgSrc}
                    alt={currentCar.fullName}
                    fill
                    priority
                    unoptimized={true}
                    className="object-contain"
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 420px, 530px"
                    onError={() => handleImageError(currentCar.name, currentImgSrc)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Supporting Vehicle */}
          <div className="hidden md:block absolute right-[16%] lg:right-[18%] bottom-6 sm:bottom-8 w-[230px] lg:w-[310px] h-[135px] lg:h-[185px] z-15 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`right-${rightCar.name}-${rightImgSrc}`}
                initial={{ opacity: 0, x: 20, scale: 0.82 }}
                animate={{ opacity: 0.8, x: 0, scale: 0.85 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative w-full h-full filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.65)]"
              >
                {failedImages[rightImgSrc] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center select-none">
                    <span className="text-[#F5B936] text-xs font-bold uppercase tracking-wider">{rightCar.name}</span>
                  </div>
                ) : (
                  <Image
                    src={rightImgSrc}
                    alt={rightCar.name}
                    fill
                    unoptimized={true}
                    className="object-contain"
                    sizes="(max-width: 1024px) 230px, 310px"
                    onError={() => handleImageError(rightCar.name, rightImgSrc)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Far Right Supporting Vehicle */}
          <div className="hidden xl:block absolute right-[1%] bottom-8 sm:bottom-10 w-[230px] lg:w-[300px] h-[145px] lg:h-[195px] z-12 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`far-${farRightCar.name}-${farRightImgSrc}`}
                initial={{ opacity: 0, scale: 0.72 }}
                animate={{ opacity: 0.7, scale: 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative w-full h-full filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.6)]"
              >
                {failedImages[farRightImgSrc] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center select-none">
                    <span className="text-[#F5B936] text-xs font-bold uppercase tracking-wider">{farRightCar.name}</span>
                  </div>
                ) : (
                  <Image
                    src={farRightImgSrc}
                    alt={farRightCar.name}
                    fill
                    unoptimized={true}
                    className="object-contain"
                    sizes="300px"
                    onError={() => handleImageError(farRightCar.name, farRightImgSrc)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Active Vehicle Name Indicator & Pagination Dots */}
        <div className="flex flex-col items-center justify-center mt-2 z-20">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentCar.name}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
              className="text-xs sm:text-sm font-bold text-white tracking-wider mb-2 drop-shadow-sm"
            >
              {currentCar.name}
            </motion.span>
          </AnimatePresence>

          {/* 4 Pagination Dots */}
          <div className="flex items-center gap-2">
            {showcaseVehicles.map((vehicle, idx) => (
              <button
                key={vehicle.id || vehicle.name}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View ${vehicle.name}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? 'w-6 h-2 bg-[#F5B936]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Translucent Floating Dark Service Bar at Bottom */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 pb-2 sm:pb-4">
        <div className="bg-[#071A35]/85 backdrop-blur-md rounded-2xl border border-white/10 px-3 sm:px-6 py-3.5 shadow-2xl grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-2.5 sm:gap-y-0 text-center">
          {/* 1. Airport Transfers */}
          <div className="flex flex-col items-center justify-center py-1 sm:py-0 px-2 group">
            <Plane className="w-4 sm:w-5 h-4 sm:h-5 text-[#F5B936] mb-1 sm:mb-1.5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              Airport Transfers
            </span>
          </div>

          {/* 2. Outstation Trips */}
          <div className="flex flex-col items-center justify-center py-1 sm:py-0 px-2 group">
            <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-[#F5B936] mb-1 sm:mb-1.5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              Outstation Trips
            </span>
          </div>

          {/* 3. City Travel */}
          <div className="flex flex-col items-center justify-center py-1 sm:py-0 px-2 group">
            <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-[#F5B936] mb-1 sm:mb-1.5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              City Travel
            </span>
          </div>

          {/* 4. Safe & Reliable */}
          <div className="flex flex-col items-center justify-center py-1 sm:py-0 px-2 group">
            <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 text-[#F5B936] mb-1 sm:mb-1.5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              Safe &amp; Reliable
            </span>
          </div>

          {/* 5. 24/7 Support */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center py-1 sm:py-0 px-2 group">
            <Headphones className="w-4 sm:w-5 h-4 sm:h-5 text-[#F5B936] mb-1 sm:mb-1.5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

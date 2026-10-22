'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '@/components/common/Image';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MessageCircle,
  Users,
  Fuel,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { Car, SiteSettings } from '@/types';

interface FleetSectionProps {
  cars: Car[];
  settings?: SiteSettings;
  onSelectCar: (car: Car) => void;
}

const CATEGORY_TABS = [
  'All Vehicles',
  'MPV',
  'Sedan',
  'Luxury',
  'SUV',
  'Tempo Traveller',
];

export function FleetSection({ cars, settings, onSelectCar }: FleetSectionProps) {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Vehicles');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Filter only active cars
  const activeCars = useMemo(() => {
    return cars.filter((c) => c.is_active);
  }, [cars]);

  // Filter cars based on selected category tab
  const filteredCars = useMemo(() => {
    if (selectedCategory === 'All Vehicles') return activeCars;

    return activeCars.filter((car) => {
      const type = (car.car_type || '').toLowerCase();
      const badge = (car.category_badge || '').toLowerCase();
      const name = (car.name || '').toLowerCase();

      if (selectedCategory === 'MPV') {
        return type.includes('mpv') || name.includes('innova') || name.includes('ertiga');
      }
      if (selectedCategory === 'Sedan') {
        return type.includes('sedan') || name.includes('dzire');
      }
      if (selectedCategory === 'Luxury') {
        return (
          type.includes('luxury') ||
          badge.includes('luxury') ||
          name.includes('urbania') ||
          name.includes('fortuner')
        );
      }
      if (selectedCategory === 'SUV') {
        return type.includes('suv') || name.includes('fortuner');
      }
      if (selectedCategory === 'Tempo Traveller') {
        return (
          type.includes('tempo') ||
          type.includes('van') ||
          name.includes('urbania') ||
          name.includes('traveller')
        );
      }
      return true;
    });
  }, [activeCars, selectedCategory]);

  // Check scroll boundary to enable/disable arrow buttons
  const checkScrollBounds = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollBounds();
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);
    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [filteredCars]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const handleCardClick = (car: Car) => {
    const slug = car.slug || car.id;
    navigate(`/fleet/${slug}`);
  };

  const handleWhatsAppChat = (e: React.MouseEvent, car: Car) => {
    e.stopPropagation();
    const phone = settings?.whatsapp || settings?.phone || '+91 98765 43210';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const vehicleName = car.model_name || car.name;
    const message = encodeURIComponent(
      `Hello Koober Services, I am interested in inquiring about the ${vehicleName} (Tariff: ₹${car.outstation_price_per_km || 18}/km, Daily: ₹${car.daily_package_price?.toLocaleString() || '4,500'}/day). Please share availability.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleRent = (e: React.MouseEvent, car: Car) => {
    e.stopPropagation();
    onSelectCar(car);
  };

  return (
    <section
      id="fleet"
      className="py-14 sm:py-20 bg-white border-b border-[#E2E8F0] scroll-mt-20 sm:scroll-mt-24 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Category Tabs & Nav Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.2em] mb-2">
              <span className="w-5 h-[1.5px] bg-[#F5B936]" />
              <span>OUR FLEET</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#081A33] tracking-tight">
              Choose Your Perfect Ride
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
              Explore our chauffeur-driven vehicles for comfortable city journeys, airport transfers, and outstation travel.
            </p>
          </div>

          {/* Carousel Arrows on Desktop / Tablet */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-3 rounded-full border transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? 'border-slate-300 bg-white text-[#081A33] hover:bg-slate-50 hover:border-[#F5B936] shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'
              }`}
              aria-label="Previous vehicles"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-3 rounded-full border transition-all duration-200 cursor-pointer ${
                canScrollRight
                  ? 'border-slate-300 bg-white text-[#081A33] hover:bg-slate-50 hover:border-[#F5B936] shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'
              }`}
              aria-label="Next vehicles"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#081A33] text-white shadow-md'
                    : 'bg-[#F8FAFC] text-[#475569] hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Horizontal Vehicle Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {filteredCars.map((car, idx) => {
            const rating = car.rating || 4.9;
            const reviewCount = car.review_count_text || `(${car.review_count || 1000}+)`;
            const categoryBadge = car.category_badge || `// ${car.car_type.toUpperCase()}`;
            const manufacturer = car.manufacturer || (car.name.includes(' ') ? car.name.split(' ')[0].toUpperCase() : 'KOOBER TRAVELS');
            const modelName = car.model_name || car.name;
            const seats = car.seats_count ? `${car.seats_count} SEATS` : car.seating_capacity.toUpperCase();
            const fuel = car.fuel_type || 'PETROL / DIESEL';
            const transmission = car.transmission || 'MANUAL / AUTOMATIC';
            const outstationRate = car.outstation_price_per_km || 18;
            const dailyRate = car.daily_package_price ? `₹${car.daily_package_price.toLocaleString()}/day` : '₹4,500/day';
            const isFeatured = idx === 0 && selectedCategory === 'All Vehicles';

            return (
              <div
                key={car.id || car.name}
                onClick={() => handleCardClick(car)}
                className={`shrink-0 snap-start w-[84vw] sm:w-[350px] md:w-[370px] lg:w-[380px] bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between p-5 sm:p-6 ${
                  isFeatured
                    ? 'border-[#CCE829] ring-2 ring-[#CCE829]/30 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Top Badge & Rating Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-slate-800 uppercase">
                      {categoryBadge}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <Star className="w-3.5 h-3.5 fill-[#F5B936] text-[#F5B936]" />
                      <span>{rating}</span>
                      <span className="text-slate-400 font-normal">{reviewCount}</span>
                    </div>
                  </div>

                  {/* Manufacturer & Model Name */}
                  <div className="mb-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      {manufacturer}
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#081A33] tracking-tight truncate mt-0.5">
                      {modelName}
                    </h3>
                  </div>

                  {/* Vehicle Side Profile Image Showcase Box */}
                  <div className="relative w-full h-44 sm:h-48 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center p-3 overflow-hidden mb-4 group-hover:scale-[1.02] transition-transform">
                    <Image
                      src={car.image_url}
                      alt={modelName}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 85vw, 380px"
                    />
                  </div>

                  {/* Specs Bar (3 Columns with Dividers matching Screenshot 2) */}
                  <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200/90 rounded-lg py-2 px-1 text-center bg-white mb-5 shadow-2xs">
                    <div className="px-1 truncate">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 tracking-tight">
                        {seats}
                      </span>
                    </div>
                    <div className="px-1 truncate">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 tracking-tight">
                        {fuel}
                      </span>
                    </div>
                    <div className="px-1 truncate">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 tracking-tight">
                        {transmission}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Pricing & Action Buttons */}
                <div>
                  {/* Pricing Breakdown Row */}
                  <div className="flex items-end justify-between gap-2 pt-2 mb-4">
                    <div>
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                        OUTSTATION TARIFF
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#081A33] tracking-tight">
                          ₹{outstationRate}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/km</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        DAILY PACKAGE
                      </div>
                      <span className="inline-block px-2.5 py-1 rounded bg-[#CCE829] text-[#081A33] text-xs font-black tracking-tight shadow-2xs">
                        {dailyRate}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Row matching Screenshot 2: [↗] [CHAT] [RENT] */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* View Details Quick Arrow */}
                    <button
                      type="button"
                      onClick={() => handleCardClick(car)}
                      className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#081A33] border border-slate-200 flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                      title="View Vehicle Specifications & Tariff Details"
                      aria-label={`View details of ${modelName}`}
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* WhatsApp Chat Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWhatsAppChat(e, car)}
                      className="flex-1 h-10 px-3 rounded-lg bg-[#E6F8EE] hover:bg-[#D5F5E2] text-[#15803D] font-extrabold text-xs flex items-center justify-center gap-1.5 border border-[#BBF7D0] transition-colors cursor-pointer shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-[#15803D] text-[#15803D]" />
                      <span>CHAT</span>
                    </button>

                    {/* Rent / Book Button */}
                    <button
                      type="button"
                      onClick={(e) => handleRent(e, car)}
                      className="flex-1 h-10 px-4 rounded-lg bg-[#081A33] hover:bg-[#102846] text-white font-extrabold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>RENT</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Cue & Counter */}
        <div className="sm:hidden flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <span>Swipe horizontally to explore fleet</span>
          <span>{filteredCars.length} vehicles</span>
        </div>
      </div>
    </section>
  );
}

export default FleetSection;

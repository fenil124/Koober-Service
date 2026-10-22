'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Image from '@/components/common/Image';
import {
  ArrowLeft,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Fuel,
  Users,
  Gauge,
  Sliders,
  Briefcase,
  Award,
  Layers,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InquiryModal } from '@/components/common/InquiryModal';
import { FloatingContactWidget } from '@/components/common/FloatingContactWidget';
import { DataStore } from '@/lib/data-store';
import { Car, SiteSettings, InquiryFormInput } from '@/types';

export default function VehicleDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>();
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inquiry modal state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [prefilledInquiry, setPrefilledInquiry] = useState<Partial<InquiryFormInput>>({});

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [carsData, settingsData] = await Promise.all([
        DataStore.getCars(),
        DataStore.getSettings(),
      ]);
      setAllCars(carsData);
      setSettings(settingsData);

      const found = await DataStore.getCarBySlugOrId(slug);
      if (found) {
        setCar(found);
      } else {
        // Fallback to first car if slug not found
        setCar(carsData[0] || null);
      }
    } catch (err) {
      console.error('Error loading vehicle details:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    loadData();

    const unsubscribe = DataStore.subscribe((event) => {
      if (
        !event ||
        event.type === 'MUTATION' ||
        event.type === 'VISIBILITY_RESYNC' ||
        event.type === 'NETWORK_RECONNECTED'
      ) {
        loadData();
      }
    });
    return () => unsubscribe();
  }, [slug, loadData]);

  // Gallery images list
  const gallery = useMemo(() => {
    if (!car) return [];
    const imgs = (
      car.gallery_images && car.gallery_images.length > 0
        ? car.gallery_images
        : (car as any).gallery && (car as any).gallery.length > 0
        ? (car as any).gallery
        : []
    ).filter(
      (img: string) => typeof img === 'string' && img.trim() !== '' && !img.startsWith('/images/cars/')
    );

    if (imgs.length > 0) return imgs;
    if (car.image_url && !car.image_url.startsWith('/images/cars/')) return [car.image_url];
    if (car.hero_image_url && !car.hero_image_url.startsWith('/images/cars/')) return [car.hero_image_url];
    return [];
  }, [car]);

  const safeActiveIndex = gallery.length > 0 ? Math.min(activeImageIndex, gallery.length - 1) : 0;
  const currentMainImage = gallery[safeActiveIndex] || (car?.image_url && !car.image_url.startsWith('/images/cars/') ? car.image_url : '') || '';

  const nextImage = () => {
    if (gallery.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    if (gallery.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  // Other related fleet vehicles (excluding current car)
  const relatedCars = useMemo(() => {
    if (!car) return [];
    return allCars
      .filter((c) => c.is_active && c.id !== car.id && c.name !== car.name)
      .slice(0, 3);
  }, [allCars, car]);

  const handleOpenBooking = () => {
    if (!car) return;
    setPrefilledInquiry({
      car_id: car.id,
      car_name: car.model_name || car.name,
    });
    setIsInquiryModalOpen(true);
  };

  const handleWhatsAppInquiry = () => {
    if (!car) return;
    const phone = settings?.whatsapp || settings?.phone || '+91 98765 43210';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const vehicleName = car.model_name || car.name;
    const message = encodeURIComponent(
      `Hello Koober Services, I am interested in booking the ${vehicleName} (Tariff: ₹${car.outstation_price_per_km || 60}/km, City Package: ₹${car.daily_package_price?.toLocaleString() || '25,000'}/day). Please confirm availability.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#081A33] border-t-[#F5B936] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading Koober Services Fleet Details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-extrabold text-[#081A33] mb-2">Vehicle Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">The requested fleet vehicle could not be found or is inactive.</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-[#081A33] text-white text-xs font-extrabold shadow-md hover:bg-[#102846]"
        >
          Return to Fleet Collection
        </Link>
      </div>
    );
  }

  const rating = car.rating || 5.0;
  const reviewCount = car.review_count_text || `(${car.review_count || 400}+ Completed Tours)`;
  const categoryBadge = car.category_badge || car.car_type.toUpperCase();
  const manufacturer = car.manufacturer || (car.name.includes(' ') ? car.name.split(' ')[0].toUpperCase() : 'KOOBER TRAVELS');
  const modelName = car.model_name || car.name;
  const outstationRate = car.outstation_price_per_km || 60;
  const dailyRate = car.daily_package_price ? `₹${car.daily_package_price.toLocaleString()}` : '₹25,000';
  const minKmText = car.min_km_per_day || 'Min. 250-300 km/day';
  const dailyPackageText = car.daily_package_text || '8 Hours · 80 km included';
  const contactPhone = settings?.phone || '+91 98765 43210';
  const cleanPhone = contactPhone.replace(/[^0-9+]/g, '');

  const amenitiesList =
    car.amenities && car.amenities.length > 0
      ? car.amenities
      : [
          'Captain Reclining Seats',
          'Dual Air Conditioning',
          'Fast USB Chargers',
          'Spacious Luggage Boot',
          'Professional Highway Chauffeur',
        ];

  const highlightsList =
    car.highlights && car.highlights.length > 0
      ? car.highlights
      : [
          'Uniformed, commercial license verified highway chauffeur',
          'Automated Expressway Fastag pass - Zero roadside stops',
          '100% Sanitized cabin · Chilled mineral water included',
        ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Header Navbar */}
      <Header onOpenInquiry={() => setIsInquiryModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation Bar matching Screenshot 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 mb-6 text-xs border-b border-slate-200/80">
            <Link
              to="/#fleet"
              className="inline-flex items-center gap-2 font-bold tracking-wider text-slate-800 hover:text-[#F5B936] uppercase transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>BACK TO FLEET COLLECTION</span>
            </Link>

            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Link to="/#fleet" className="hover:text-slate-700">
                Fleet
              </Link>
              <span>/</span>
              <span className="text-slate-600">{car.car_type}</span>
              <span>/</span>
              <span className="font-bold text-[#081A33]">{car.name}</span>
            </div>
          </div>

          {/* Top 2-Column Section matching Screenshot 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
            {/* Left Column: Image Showcase Card & Quick Specs */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                {/* Badge and Rating */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#EBF874]/60 text-[#081A33] text-xs font-extrabold uppercase tracking-wider">
                    {categoryBadge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Star className="w-4 h-4 fill-[#F5B936] text-[#F5B936]" />
                    <span>{rating}</span>
                    <span className="text-slate-400 font-normal">{reviewCount}</span>
                  </div>
                </div>

                {/* Primary Image Showcase with Controls */}
                <div className="relative w-full h-72 sm:h-96 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center p-4 overflow-hidden mb-6 group">
                  <Image
                    src={currentMainImage}
                    alt={`${modelName} - Koober Services`}
                    fill
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    priority
                  />

                  {/* Previous / Next Image Controls */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#081A33] shadow-md flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Previous vehicle image"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#081A33] shadow-md flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Next vehicle image"
                      >
                        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      {/* Image Counter Badge */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#081A33]/80 backdrop-blur-sm text-white text-[11px] font-mono font-bold">
                        {safeActiveIndex + 1} / {gallery.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery Row if multiple images */}
                {gallery.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-6">
                    {gallery.map((img: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          safeActiveIndex === i
                            ? 'border-[#081A33] shadow-md scale-105'
                            : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 4 Quick Spec Chips below image matching Screenshot 3 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                      TOP SPEED
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#081A33]">
                      {car.top_speed || '240 km/h'}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                      HORSEPOWER
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#081A33] truncate">
                      {car.horsepower || 'High Output'}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                      CAPACITY
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#081A33]">
                      {car.seats_count ? `${car.seats_count} Guests` : car.seating_capacity}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                      TRANSMISSION
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#081A33] truncate">
                      {car.transmission || 'Automatic'}
                    </span>
                  </div>
                </div>

                {/* Highlight Tagline Pill matching Screenshot 3 */}
                <div className="w-full py-2.5 px-4 rounded-xl bg-[#FEFCE8] border border-[#FEF08A] flex items-center justify-center gap-2 text-xs font-bold text-[#854D0E]">
                  <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>{car.tagline || 'Ideal for Surat - Mumbai & Udaipur road trips'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Transparent Tariff Breakdown & Booking Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Subtitle & Title matching Screenshot 3 */}
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-1">
                  {manufacturer} &middot; {car.car_type.toUpperCase()} EDITION
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-[#081A33] tracking-tight mb-6">
                  {modelName}
                </h1>

                {/* Transparent Tariff Breakdown Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-4 pb-2 border-b border-slate-100">
                    TRANSPARENT TARIFF BREAKDOWN
                  </div>

                  {/* 2-Column Rates */}
                  <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-slate-100">
                    <div>
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                        OUTSTATION PER KM
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#081A33] tracking-tight">
                        ₹{outstationRate}
                        <span className="text-xs font-semibold text-slate-500">/km</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-1">
                        {minKmText}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">
                        CITY DAILY PACKAGE
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#081A33] tracking-tight">
                        {dailyRate}
                        <span className="text-xs font-semibold text-slate-500">/day</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-1">
                        {dailyPackageText}
                      </div>
                    </div>
                  </div>

                  {/* Feature Checklist matching Screenshot 3 */}
                  <div className="space-y-3 mb-6">
                    {highlightsList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                        <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Functional Action Buttons */}
                  <div className="space-y-3">
                    {/* WhatsApp Action Button */}
                    <button
                      type="button"
                      onClick={handleWhatsAppInquiry}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>ENQUIRE AVAILABILITY ON WHATSAPP</span>
                    </button>

                    {/* Reserve Online via Fleet Desk */}
                    <button
                      type="button"
                      onClick={handleOpenBooking}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#081A33] hover:bg-[#102846] text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
                    >
                      <span>RESERVE ONLINE VIA FLEET DESK</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Direct Telephone Call Link */}
                  <div className="mt-5 text-center text-xs text-slate-500">
                    <span>Prefer to call? </span>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="font-bold text-[#081A33] hover:text-[#F5B936] underline underline-offset-2 transition-colors"
                    >
                      {contactPhone} (24/7 VIP Line)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Section: Technical Specifications & Telemetry */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-12">
            <div className="mb-8">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#F5B936] mb-1">
                ENGINEERING SPECS
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081A33] tracking-tight">
                Technical Specifications &amp; Telemetry
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Maintained strictly to manufacturer schedule with OEM diagnostics and certified Michelin / Pirelli rubber.
              </p>
            </div>

            {/* 8-Grid Specs matching Screenshot 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  ENGINE &amp; POWERTRAIN
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.engine_powertrain || '2.4L GD Turbocharged Diesel'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  HORSEPOWER RATING
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.horsepower || 'High Output'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  TRANSMISSION
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.transmission || 'Automatic'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  DRIVETRAIN &amp; FUEL
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.fuel_type || 'Petrol'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  PASSENGER SEATING
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.seats_count ? `${car.seats_count} Captain Seats` : car.seating_capacity}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  MAXIMUM SPEED
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.top_speed || '240 km/h'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  DRIVER OPTION
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.driver_option || 'Chauffeur / Self-Drive'}
                </span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  LUGGAGE CAPACITY
                </span>
                <span className="text-sm font-black text-[#081A33]">
                  {car.luggage_capacity || '3–5 Large Trolleys'}
                </span>
              </div>
            </div>

            {/* Factory Amenities & Comfort Options */}
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-4">
                FACTORY AMENITIES &amp; COMFORT OPTIONS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70 text-xs font-bold text-slate-700"
                  >
                    <Check className="w-4 h-4 text-[#16A34A] stroke-[2.5]" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Recommendations / Explore More Fleet Models */}
          <div className="mb-12">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-1">
                  ALTERNATIVE RECOMMENDATIONS
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081A33] tracking-tight">
                  Explore More Fleet Models
                </h2>
              </div>

              <Link
                to="/#fleet"
                className="text-xs font-bold text-[#081A33] hover:text-[#F5B936] inline-flex items-center gap-1 transition-colors"
              >
                <span>VIEW FULL COLLECTION</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Related Cards Grid matching Screenshot 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCars.map((relCar) => {
                const relRating = relCar.rating || 4.9;
                const relBadge = relCar.category_badge?.replace('//', '').trim() || relCar.car_type.toUpperCase();
                const relMfg = relCar.manufacturer || (relCar.name.includes(' ') ? relCar.name.split(' ')[0].toUpperCase() : 'KOOBER TRAVELS');
                const relRate = relCar.outstation_price_per_km || 14;

                return (
                  <div
                    key={relCar.id}
                    onClick={() => navigate(`/fleet/${relCar.slug || relCar.id}`)}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold pb-2 mb-2 border-b border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {relBadge}
                        </span>
                        <div className="flex items-center gap-1 text-slate-700">
                          <Star className="w-3.5 h-3.5 fill-[#F5B936] text-[#F5B936]" />
                          <span>{relRating}</span>
                        </div>
                      </div>

                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                        {relMfg}
                      </div>
                      <h3 className="text-base font-extrabold text-[#081A33] truncate mb-3">
                        {relCar.model_name || relCar.name}
                      </h3>

                      <div className="relative w-full h-36 rounded-xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center p-2 overflow-hidden mb-4">
                        <Image
                          src={relCar.image_url}
                          alt={relCar.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-[9px] font-extrabold uppercase text-slate-400">
                          FROM
                        </div>
                        <div className="text-base font-black text-[#081A33]">
                          ₹{relRate}<span className="text-xs font-normal text-slate-500">/km</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/fleet/${relCar.slug || relCar.id}`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#081A33] hover:text-white text-[#081A33] text-xs font-extrabold transition-all cursor-pointer"
                      >
                        VIEW PAGE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Inquiry & Booking Modal */}
      <InquiryModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        cars={allCars}
        prefilledData={prefilledInquiry}
        onSuccess={loadData}
      />

      {/* Floating Contact Widget */}
      <FloatingContactWidget settings={settings} />
    </div>
  );
}

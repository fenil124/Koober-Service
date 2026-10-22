'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroShowcase } from '@/components/home/HeroShowcase';
import { FleetSection } from '@/components/home/FleetSection';
import { AboutSection } from '@/components/home/AboutSection';
import { RoutesSection } from '@/components/home/RoutesSection';
import { DestinationsSection } from '@/components/home/DestinationsSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { Footer } from '@/components/layout/Footer';
import { InquiryModal } from '@/components/common/InquiryModal';
import { FloatingContactWidget } from '@/components/common/FloatingContactWidget';
import { DataStore } from '@/lib/data-store';
import { Car, Route, Destination, Review, SiteSettings, HomepageSection, InquiryFormInput } from '@/types';

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>();
  const [content, setContent] = useState<Record<string, HomepageSection>>({});

  // Reusable enquiry modal state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [prefilledInquiry, setPrefilledInquiry] = useState<Partial<InquiryFormInput>>({});

  const isLoadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const [carsData, routesData, destsData, reviewsData, settingsData, contentData] = await Promise.all([
        DataStore.getCars(),
        DataStore.getRoutes(),
        DataStore.getDestinations(),
        DataStore.getReviews(),
        DataStore.getSettings(),
        DataStore.getHomepageContent(),
      ]);

      setCars(carsData);
      setRoutes(routesData);
      setDestinations(destsData);
      setReviews(reviewsData);
      setSettings(settingsData);
      setContent(contentData);
    } catch (err) {
      console.error('Error loading homepage data:', err);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for live updates from admin or cross-tabs (only genuine mutations or resync)
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

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleOpenGeneralInquiry = () => {
    setPrefilledInquiry({});
    setIsInquiryModalOpen(true);
  };

  const handleSelectCar = (car: Car) => {
    setPrefilledInquiry({
      car_id: car.id,
      car_name: car.name,
    });
    setIsInquiryModalOpen(true);
  };

  const handleSelectRoute = (origin: string, destination: string, carName?: string) => {
    setPrefilledInquiry((prev) => ({
      ...prev,
      pickup_location: origin,
      destination,
      car_name: carName || prev.car_name,
    }));
    setIsInquiryModalOpen(true);
  };

  const handleSelectDestination = (destName: string) => {
    setPrefilledInquiry((prev) => ({
      ...prev,
      destination: destName,
    }));
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Sticky Header Navbar with gold Book Now button */}
      <Header onOpenInquiry={handleOpenGeneralInquiry} />

      <main className="flex-1">
        {/* 2. Cinematic Hero Section with 2.5s continuous showcase */}
        <HeroShowcase
          cars={cars}
          content={content['hero']}
          settings={settings}
          onBookClick={handleOpenGeneralInquiry}
        />

        {/* 3. Complete Fleet Section with all active cars */}
        <FleetSection
          cars={cars}
          settings={settings}
          onSelectCar={handleSelectCar}
        />

        {/* 4. Complete About Us Section */}
        <AboutSection
          content={content['about']}
          settings={settings}
        />

        {/* 5. Popular Routes & Airport Transfers promotional card */}
        <RoutesSection
          routes={routes}
          cars={cars}
          onSelectRoute={handleSelectRoute}
        />

        {/* 6. Popular Destinations */}
        <DestinationsSection
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
        />

        {/* 7. Continuous Reviews Slider (Right to Left Marquee) */}
        <ReviewsSection
          reviews={reviews}
          onReviewSubmitted={loadData}
        />

        {/* 8. Booking Call-To-Action */}
        <CtaSection
          onBookClick={handleOpenGeneralInquiry}
          phone={settings?.phone}
        />
      </main>

      {/* 9. Dark navy brand footer */}
      <Footer settings={settings} />

      {/* 10. Reusable Popup Enquiry Modal */}
      <InquiryModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        cars={cars}
        prefilledData={prefilledInquiry}
        onSuccess={loadData}
      />

      {/* 11. Floating Contact Widget (Need Help? -> WhatsApp & Phone) */}
      <FloatingContactWidget settings={settings} />
    </div>
  );
}

'use client';

import Image from '@/components/common/Image';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import { Route, Car } from '@/types';
import { formatINR } from '@/lib/utils';

interface RoutesSectionProps {
  routes: Route[];
  cars: Car[];
  onSelectRoute: (origin: string, destination: string, carName?: string) => void;
}

export function RoutesSection({ routes, onSelectRoute }: RoutesSectionProps) {
  // 4 Canonical Fixed Routes matching Reference 2 & 3
  const canonicalRoutes = [
    {
      id: 'r1',
      origin: 'Surat',
      destination: 'Mumbai Airport',
      price: 8000,
    },
    {
      id: 'r2',
      origin: 'Surat',
      destination: 'Pune',
      price: 9500,
    },
    {
      id: 'r3',
      origin: 'Surat',
      destination: 'Ahmedabad',
      price: 6000,
    },
    {
      id: 'r4',
      origin: 'Surat',
      destination: 'Udaipur',
      price: 12000,
    },
  ];

  // Map active database routes dynamically if available, or use canonical fallback
  const activeRoutes = routes.filter((r) => r.is_active);
  const displayRoutes = activeRoutes.length > 0
    ? activeRoutes.slice(0, 4).map((r) => ({
        id: r.id,
        origin: r.origin,
        destination: r.destination,
        price: r.prices && r.prices.length > 0 ? r.prices[0].price : null,
      }))
    : canonicalRoutes;

  // Find if an airport route exists with an admin-configured image
  const airportRoute = routes.find(
    (r) =>
      (r.destination.toLowerCase().includes('airport') || r.origin.toLowerCase().includes('airport')) &&
      r.image_url
  );

  return (
    <section
      id="routes"
      className="py-14 sm:py-20 bg-white border-b border-[#E2E8F0] scroll-mt-20 sm:scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.2em] mb-1.5">
              <span className="w-5 h-[1.5px] bg-[#F5B936]" />
              <span>POPULAR ROUTES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#081A33] tracking-tight">
              Popular Routes
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Transparent pricing for your next journey.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectRoute('Surat', 'Outstation')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#081A33] hover:text-[#F5B936] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* 2-Column Desktop Layout: Routes List on Left (~60%) + Airport Card on Right (~40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Compact horizontal route rows */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
            {displayRoutes.map((route, idx) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                onClick={() => onSelectRoute(route.origin, route.destination)}
                className="group bg-[#F5F8FC] rounded-xl px-5 py-4 border border-[#E2E8F0] hover:border-[#F5B936]/80 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between"
              >
                {/* Route Location */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-[#081A33] flex items-center justify-center shrink-0 group-hover:border-[#F5B936] group-hover:text-[#F5B936] transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-sm sm:text-base text-[#081A33]">
                    <span>{route.origin}</span>
                    <span className="mx-2 text-[#64748B] font-normal">&rarr;</span>
                    <span>{route.destination}</span>
                  </div>
                </div>

                {/* Right-aligned Price & Chevron */}
                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-extrabold text-[#081A33] group-hover:text-[#F5B936] transition-colors">
                    {route.price !== null && route.price !== undefined && route.price > 0
                      ? formatINR(route.price)
                      : 'Get a Quote'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#081A33] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Airport Transfers Promotional Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => onSelectRoute('Surat', 'Mumbai Airport')}
            className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[260px] lg:min-h-[290px] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-end p-6 border border-slate-100"
          >
            <Image
              src={airportRoute?.image_url || '/images/airport-transfer.jpg'}
              alt="Airport Transfers"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            {/* Subtle dark gradient overlay on bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#081A33]/90 via-[#081A33]/35 to-transparent" />

            {/* Bottom Content & Round Arrow Button */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Airport Transfers
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                  On time, Every time.
                </p>
              </div>

              {/* White Circular Button with Arrow */}
              <div className="w-10 h-10 rounded-full bg-white text-[#081A33] flex items-center justify-center shadow-lg group-hover:bg-[#F5B936] transition-colors shrink-0">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

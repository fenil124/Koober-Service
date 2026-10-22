'use client';

import Image from '@/components/common/Image';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Destination } from '@/types';

interface DestinationsSectionProps {
  destinations: Destination[];
  onSelectDestination: (destName: string) => void;
}

export function DestinationsSection({ destinations, onSelectDestination }: DestinationsSectionProps) {
  // Canonical 6 destinations matching Reference 2 & 3
  const canonicalDestinations = [
    {
      id: 'd1',
      name: 'Mumbai',
      image_url: '/images/destinations/mumbai.jpg',
    },
    {
      id: 'd2',
      name: 'Lonavala',
      image_url: '/images/destinations/lonavala.jpg',
    },
    {
      id: 'd3',
      name: 'Nashik',
      image_url: '/images/destinations/nashik.jpg',
    },
    {
      id: 'd4',
      name: 'Statue of Unity',
      image_url: '/images/destinations/statue-of-unity.jpg',
    },
    {
      id: 'd5',
      name: 'Somnath',
      image_url: '/images/destinations/somnath.jpg',
    },
    {
      id: 'd6',
      name: 'Diu',
      image_url: '/images/destinations/diu.jpg',
    },
  ];

  const published = destinations.filter((d) =>
    typeof d.is_published === 'boolean'
      ? d.is_published
      : (typeof (d as any).is_active === 'boolean' ? (d as any).is_active : true)
  );
  const displayList = published.length > 0 ? published : canonicalDestinations;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      id="destinations"
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
              <span>POPULAR DESTINATIONS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#081A33] tracking-tight">
              Explore Amazing Places
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Discover destinations with our chauffeur-driven services.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectDestination('Outstation Tour')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#081A33] hover:text-[#F5B936] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* 6 Destination Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5"
        >
          {displayList.map((dest) => (
            <motion.div
              key={dest.id || dest.name}
              variants={cardVariants}
              onClick={() => onSelectDestination(dest.name)}
              className="group relative h-48 sm:h-52 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              <Image
                src={dest.image_url}
                alt={dest.name}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Subtle bottom dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#081A33]/90 via-[#081A33]/25 to-transparent pointer-events-none" />

              {/* Centered destination title at bottom */}
              <div className="absolute bottom-3.5 inset-x-2 text-center z-10">
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide group-hover:text-[#F5B936] transition-colors drop-shadow-sm block">
                  {dest.name}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

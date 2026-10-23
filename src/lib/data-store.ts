'use client';

import { Car, Route, Destination, Review, Inquiry, SiteSettings, HomepageSection, InquiryFormInput } from '@/types';
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('rr_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const inFlightRequests = new Map<string, Promise<any>>();

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // Deduplicate concurrent in-flight GET requests
  if (method === 'GET') {
    const existing = inFlightRequests.get(endpoint);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const promise = (async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      };

      const res = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const errorMsg = errorJson.error || `API request failed with HTTP ${res.status}`;
        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('rr_token');
            localStorage.removeItem('rr_admin_auth');
            window.dispatchEvent(new CustomEvent('rr_auth_expired'));
          }
        }
        throw new Error(errorMsg);
      }

      return await res.json();
    } finally {
      if (method === 'GET') {
        inFlightRequests.delete(endpoint);
      }
    }
  })();

  if (method === 'GET') {
    inFlightRequests.set(endpoint, promise);
  }

  return promise;
}

// Initial authoritative seed data matching screenshots
const INITIAL_CARS: Car[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Innova',
    slug: 'innova',
    manufacturer: 'TOYOTA',
    model_name: 'Toyota Innova Crysta',
    car_type: 'MPV',
    category_badge: '// MOST POPULAR',
    rating: 4.9,
    review_count: 1450,
    review_count_text: '(1,450+)',
    seating_capacity: '7+1 Seating',
    seats_count: 7,
    fuel_type: 'DIESEL',
    transmission: 'AUTOMATIC / MANUAL',
    outstation_price_per_km: 18,
    daily_package_price: 4500,
    daily_package_text: '8 Hours · 80 km included',
    min_km_per_day: 'Min. 250 km/day',
    package_duration_hours: 8,
    package_included_km: 80,
    driver_allowance: 400,
    extra_km_rate: 18,
    extra_hour_rate: 200,
    tagline: 'Ideal for Surat - Mumbai & Udaipur road trips',
    short_description: 'Spacious, comfortable, and reliable MPV with premium captain seating and dual climate control.',
    full_description: "Toyota Innova Crysta is India's most trusted executive MPV. Known for its plush interior space, supreme ride quality on long highway stretches, and class-leading reliability, it is the ideal vehicle for family vacations, airport commutes, and corporate delegates.",
    engine_powertrain: '2.4L GD Turbocharged Diesel',
    horsepower: '150 HP @ 3400 RPM',
    top_speed: '180 km/h',
    driver_option: 'Chauffeur / Self-Drive',
    luggage_capacity: '3–4 Large Bags',
    amenities: [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ],
    highlights: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin · Chilled mineral water included',
    ],
    image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    hero_image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    gallery: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    ],
    gallery_images: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 1,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Ertiga',
    slug: 'ertiga',
    manufacturer: 'MARUTI SUZUKI',
    model_name: 'Maruti Suzuki Ertiga',
    car_type: 'MPV',
    category_badge: '// FAMILY FAVORITE',
    rating: 4.8,
    review_count: 1120,
    review_count_text: '(1,120+)',
    seating_capacity: '6+1 Seating',
    seats_count: 7,
    fuel_type: 'PETROL / CNG',
    transmission: 'MANUAL / AUTOMATIC',
    outstation_price_per_km: 14,
    daily_package_price: 3500,
    daily_package_text: '8 Hours · 80 km included',
    min_km_per_day: 'Min. 250 km/day',
    package_duration_hours: 8,
    package_included_km: 80,
    driver_allowance: 350,
    extra_km_rate: 14,
    extra_hour_rate: 150,
    tagline: 'The Budget-Friendly Choice for Family Tours & Group Outings',
    short_description: 'Smart, economical 7-seater MPV with versatile seating, dual AC, and smooth riding dynamics.',
    full_description: 'Maruti Suzuki Ertiga delivers exceptional economy without sacrificing comfort. Featuring smart hybrid efficiency, flexible seating arrangements, and dedicated rear air-conditioning vents, it is beloved by families traveling across western India.',
    engine_powertrain: '1.5L K15C Smart Hybrid',
    horsepower: '102 HP @ 6000 RPM',
    top_speed: '170 km/h',
    driver_option: 'Chauffeur Driven',
    luggage_capacity: '2–3 Medium Bags',
    amenities: [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ],
    highlights: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin · Chilled mineral water included',
    ],
    image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645560/royalrides/cars/1792645541561_ertiga-transparent.png',
    hero_image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645560/royalrides/cars/1792645541561_ertiga-transparent.png',
    gallery: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792645560/royalrides/cars/1792645541561_ertiga-transparent.png',
    ],
    gallery_images: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792645560/royalrides/cars/1792645541561_ertiga-transparent.png',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 2,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Swift Dzire',
    slug: 'swift-dzire',
    manufacturer: 'MARUTI SUZUKI',
    model_name: 'Maruti Suzuki Swift Dzire',
    car_type: 'Sedan',
    category_badge: '// MOST ECONOMICAL',
    rating: 4.9,
    review_count: 2350,
    review_count_text: '(2,350+)',
    seating_capacity: '4+1 Seating',
    seats_count: 4,
    fuel_type: 'PETROL / CNG',
    transmission: 'MANUAL / AMT',
    outstation_price_per_km: 11,
    daily_package_price: 2400,
    daily_package_text: '8 Hours · 80 km included',
    min_km_per_day: 'Min. 250 km/day',
    package_duration_hours: 8,
    package_included_km: 80,
    driver_allowance: 300,
    extra_km_rate: 11,
    extra_hour_rate: 120,
    tagline: 'Effortless City Transit & Swift Airport Transfers',
    short_description: 'Compact sedan engineered for agility, quiet city cruising, and cost-effective outstation trips.',
    full_description: "India's favorite compact sedan. Swift Dzire offers plush contoured rear seating, exceptional fuel economy, and ample boot capacity for airport luggage, making it the top pick for business professionals and small families.",
    engine_powertrain: '1.2L DualJet Dual VVT',
    horsepower: '89 HP @ 6000 RPM',
    top_speed: '165 km/h',
    driver_option: 'Chauffeur Driven',
    luggage_capacity: '2 Large Suitcases',
    amenities: [
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ],
    highlights: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin · Chilled mineral water included',
    ],
    image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583207/royalrides/cars/oyui0yleedzw2vog1o9y.png',
    hero_image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583207/royalrides/cars/oyui0yleedzw2vog1o9y.png',
    gallery: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792583207/royalrides/cars/oyui0yleedzw2vog1o9y.png',
    ],
    gallery_images: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792583207/royalrides/cars/oyui0yleedzw2vog1o9y.png',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 3,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Urbania Traveller',
    slug: 'urbania',
    manufacturer: 'FORCE ATELIER',
    model_name: 'Urbania',
    car_type: 'Tempo Traveller',
    category_badge: 'TEMPO TRAVELLER',
    rating: 5.0,
    review_count: 400,
    review_count_text: '(400+ Completed Tours)',
    seating_capacity: '12+1 Seating',
    seats_count: 16,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    outstation_price_per_km: 60,
    daily_package_price: 25000,
    daily_package_text: '8 Hours · 80 km included',
    min_km_per_day: 'Min. 250-300 km/day',
    package_duration_hours: 8,
    package_included_km: 80,
    driver_allowance: 600,
    extra_km_rate: 60,
    extra_hour_rate: 500,
    tagline: 'Ideal for Surat - Mumbai & Udaipur road trips',
    short_description: 'Next-generation luxury van with individual reclining seats, panoramic windows, and whisper-quiet cabin.',
    full_description: 'Force Urbania sets a new benchmark in luxury group mobility. Engineered with monocoque chassis dynamics, independent front suspension, individual passenger AC vents, and high-speed highway stability, it transforms multi-day group tours and corporate expeditions into first-class journeys.',
    engine_powertrain: 'Mercedes-Derived FM 2.6L CR ED',
    horsepower: 'High Output',
    top_speed: '240 km/h',
    driver_option: 'Chauffeur / Self-Drive',
    luggage_capacity: '3–5 Large Trolleys',
    amenities: [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ],
    highlights: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin · Chilled mineral water included',
    ],
    image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583210/royalrides/cars/au4kkl0peafch8dn64cy.png',
    hero_image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792583210/royalrides/cars/au4kkl0peafch8dn64cy.png',
    gallery: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792583210/royalrides/cars/au4kkl0peafch8dn64cy.png',
    ],
    gallery_images: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792583210/royalrides/cars/au4kkl0peafch8dn64cy.png',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 4,
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Fortuner',
    slug: 'fortuner',
    manufacturer: 'TOYOTA',
    model_name: 'Toyota Fortuner',
    car_type: 'SUV',
    category_badge: '// LUXURY SUV',
    rating: 4.9,
    review_count: 980,
    review_count_text: '(980+)',
    seating_capacity: '7+1 Seating',
    seats_count: 7,
    fuel_type: 'DIESEL',
    transmission: 'AUTOMATIC',
    outstation_price_per_km: 50,
    daily_package_price: 18000,
    daily_package_text: '8 Hours · 80 km included',
    min_km_per_day: 'Min. 250 km/day',
    package_duration_hours: 8,
    package_included_km: 80,
    driver_allowance: 500,
    extra_km_rate: 50,
    extra_hour_rate: 400,
    tagline: 'VIP Road Presence for Executive Transit & Long-Distance Journeys',
    short_description: 'Formidable 4x4 luxury SUV offering commanding height, leather upholstery, and superior highway presence.',
    full_description: 'Toyota Fortuner is the quintessential luxury SUV for executive transit, high-profile events, and rugged cross-state journeys. With robust 4x4 capability, commanding road presence, and supreme cabin insulation, arrive at your destination with unmatched authority.',
    engine_powertrain: '2.8L Turbo Diesel 4x4',
    horsepower: '201 HP @ 3000 RPM',
    top_speed: '190 km/h',
    driver_option: 'Executive Chauffeur',
    luggage_capacity: '4–5 Large Trolleys',
    amenities: [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ],
    highlights: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin · Chilled mineral water included',
    ],
    image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    hero_image_url: 'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    gallery: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    ],
    gallery_images: [
      'https://res.cloudinary.com/imjtguki/image/upload/v1792645496/royalrides/cars/1792645477116_innova-transparent.png',
    ],
    is_active: true,
    is_hero_featured: false,
    display_order: 5,
  },
];

const INITIAL_ROUTES: Route[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    origin: 'Surat',
    destination: 'Mumbai Airport',
    image_url: '/images/airport-transfer.jpg',
    is_active: true,
    is_featured: true,
    display_order: 1,
    prices: [
      { id: 'rp-1', route_id: 'b1111111-1111-1111-1111-111111111111', car_id: 'c3333333-3333-3333-3333-333333333333', price: 7000 },
      { id: 'rp-2', route_id: 'b1111111-1111-1111-1111-111111111111', car_id: 'c2222222-2222-2222-2222-222222222222', price: 8000 },
      { id: 'rp-3', route_id: 'b1111111-1111-1111-1111-111111111111', car_id: 'c1111111-1111-1111-1111-111111111111', price: 13000 },
      { id: 'rp-4', route_id: 'b1111111-1111-1111-1111-111111111111', car_id: 'c4444444-4444-4444-4444-444444444444', price: null }, // Urbania: Get a Quote
    ],
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    origin: 'Surat',
    destination: 'Pune',
    is_active: true,
    is_featured: true,
    display_order: 2,
    prices: [
      { id: 'rp-5', route_id: 'b2222222-2222-2222-2222-222222222222', car_id: 'c2222222-2222-2222-2222-222222222222', price: 9500 },
    ],
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    origin: 'Surat',
    destination: 'Ahmedabad',
    is_active: true,
    is_featured: true,
    display_order: 3,
    prices: [
      { id: 'rp-6', route_id: 'b3333333-3333-3333-3333-333333333333', car_id: 'c3333333-3333-3333-3333-333333333333', price: 6000 },
    ],
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    origin: 'Surat',
    destination: 'Udaipur',
    is_active: true,
    is_featured: true,
    display_order: 4,
    prices: [
      { id: 'rp-7', route_id: 'b4444444-4444-4444-4444-444444444444', car_id: 'c1111111-1111-1111-1111-111111111111', price: 12000 },
    ],
  },
  {
    id: 'b5555555-5555-5555-5555-555555555555',
    origin: 'Surat',
    destination: 'Nashik',
    is_active: true,
    is_featured: true,
    display_order: 5,
    prices: [
      { id: 'rp-8', route_id: 'b5555555-5555-5555-5555-555555555555', car_id: 'c2222222-2222-2222-2222-222222222222', price: 7000 },
    ],
  },
];

const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Mumbai',
    description: 'Financial capital, Marine Drive & Gateway of India.',
    image_url: '/images/destinations/mumbai.jpg',
    is_published: true,
    display_order: 1,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Lonavala',
    description: 'Scenic misty Western Ghats, valleys & waterfalls.',
    image_url: '/images/destinations/lonavala.jpg',
    is_published: true,
    display_order: 2,
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Nashik',
    description: 'Wine capital and sacred pilgrimage temples along Godavari.',
    image_url: '/images/destinations/nashik.jpg',
    is_published: true,
    display_order: 3,
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Statue of Unity',
    description: 'World’s tallest statue overlooking the serene Narmada river.',
    image_url: '/images/destinations/statue-of-unity.jpg',
    is_published: true,
    display_order: 4,
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    name: 'Somnath',
    description: 'Magnificent oceanfront Jyotirlinga temple shrine.',
    image_url: '/images/destinations/somnath.jpg',
    is_published: true,
    display_order: 5,
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    name: 'Diu',
    description: 'Sun-kissed beaches, golden sand, and historic sea fort.',
    image_url: '/images/destinations/diu.jpg',
    is_published: true,
    display_order: 6,
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rv1',
    customer_name: 'Rohit Patel',
    rating: 5,
    review_text: 'Excellent service! On-time pickup and very professional driver. Highly recommended!',
    is_published: true,
    is_demo: true,
    display_order: 1,
  },
  {
    id: 'rv2',
    customer_name: 'Priya Shah',
    rating: 5,
    review_text: 'Very comfortable journey to Mumbai Airport. Clean car and great service.',
    is_published: true,
    is_demo: true,
    display_order: 2,
  },
  {
    id: 'rv3',
    customer_name: 'Amit Desai',
    rating: 5,
    review_text: 'Booked Innova for family trip. Smooth ride and great experience. Will book again!',
    is_published: true,
    is_demo: true,
    display_order: 3,
  },
  {
    id: 'rv4',
    customer_name: 'Neha Modi',
    rating: 5,
    review_text: 'Traveled from Surat to Udaipur with family. Driver was punctual and courteous.',
    is_published: true,
    is_demo: true,
    display_order: 4,
  },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'in1',
    customer_name: 'Rahul Patel',
    phone: '9876543210',
    pickup_location: 'Surat',
    destination: 'Mumbai',
    travel_date: '2024-10-25',
    travel_time: '06:00 AM',
    car_name: 'Innova',
    car_id: 'c1111111-1111-1111-1111-111111111111',
    passengers: 6,
    trip_type: 'one-way',
    status: 'New',
    submission_type: 'booking',
    source: 'website',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'in2',
    customer_name: 'Priya Shah',
    phone: '9876123456',
    pickup_location: 'Surat',
    destination: 'Pune',
    travel_date: '2024-10-26',
    travel_time: '08:30 AM',
    car_name: 'Ertiga',
    car_id: 'c2222222-2222-2222-2222-222222222222',
    passengers: 4,
    trip_type: 'round-trip',
    status: 'Contacted',
    submission_type: 'inquiry',
    source: 'website',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'in3',
    customer_name: 'Amit Desai',
    phone: '9876987654',
    pickup_location: 'Surat',
    destination: 'Ahmedabad',
    travel_date: '2024-10-28',
    travel_time: '09:00 AM',
    car_name: 'Swift Dzire',
    car_id: 'c3333333-3333-3333-3333-333333333333',
    passengers: 4,
    trip_type: 'one-way',
    status: 'New',
    source: 'website',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'in4',
    customer_name: 'Neha Modi',
    phone: '9876456789',
    pickup_location: 'Surat',
    destination: 'Udaipur',
    travel_date: '2024-10-30',
    travel_time: '05:00 AM',
    car_name: 'Innova',
    car_id: 'c1111111-1111-1111-1111-111111111111',
    passengers: 5,
    trip_type: 'round-trip',
    status: 'Quotation Given',
    source: 'phone',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'in5',
    customer_name: 'Kunal Mehta',
    phone: '9876765432',
    pickup_location: 'Surat',
    destination: 'Mumbai',
    travel_date: '2024-10-31',
    travel_time: '07:00 AM',
    car_name: 'Urbania',
    car_id: 'c4444444-4444-4444-4444-444444444444',
    passengers: 12,
    trip_type: 'one-way',
    status: 'Confirmed',
    source: 'whatsapp',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  id: 'default',
  agency_name: 'Koober Services',
  tagline: 'Comfortable Rides for Every Journey',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'contact@kooberservices.com',
  address: 'Ring Road, Surat, Gujarat 395002',
  logo_url: '/logo.png',
  cloudinary_public_id: 'koober_services_logo',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  youtube_url: 'https://youtube.com',
  cta_text: 'Book Your Ride',
};

const INITIAL_CONTENT: Record<string, HomepageSection> = {
  hero: {
    id: 'hero',
    title: 'Comfortable Rides for Every Journey',
    subtitle: 'Airport Transfers • Outstation Trips • City Travel & More',
    badge: 'PREMIUM CHAUFFEUR-DRIVEN CAR RENTAL',
    body: 'Experience effortless, punctual, and safe road journeys with our professionally driven fleet of modern cars.',
    image_url: '/images/hero-bg.jpg',
  },
  features: {
    id: 'features',
    title: 'Why Choose Koober Services',
    subtitle: 'Excellence in Every Mile',
    badge: 'OUR PROMISE',
    body: 'Punctual door-to-door pickups, sanitized and comfortable vehicles, experienced vetted chauffeurs, and transparent billing.',
  },
  about: {
    id: 'about',
    title: 'Premium Chauffeur-Driven Travel Services',
    subtitle: 'Dedicated to Comfort, Safety, and Reliable Road Journeys',
    badge: 'ABOUT KOOBER SERVICES',
    body: 'Koober Services is a premium car rental and travel agency specializing in outstation travel, airport transfers, corporate transit, and family tours. Our fleet of meticulously maintained vehicles and seasoned, courteous chauffeurs ensure you travel in absolute comfort and peace of mind.',
  },
  contact: {
    id: 'contact',
    title: 'Ready to Plan Your Journey?',
    subtitle: 'Get in touch with our team for quick quotes, custom itineraries, and reservations.',
    badge: 'CONTACT US',
    body: 'Available 24/7 for emergency bookings, corporate packages, and outstation inquiries.',
  },
};

// Local storage keys
const STORAGE_KEYS = {
  CARS: 'rr_cars',
  ROUTES: 'rr_routes',
  DESTINATIONS: 'rr_destinations',
  REVIEWS: 'rr_reviews',
  INQUIRIES: 'rr_inquiries',
  SETTINGS: 'rr_settings',
  CONTENT: 'rr_content',
};

// Safe browser local storage helpers
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

// Local storage silent cache write without triggering mutation events or refetches
function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Silently ignore storage quota or private browsing errors
  }
}

// Storage mutation write: persists data AND broadcasts event across tabs/listeners
function setStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Broadcast event across browser tabs
    try {
      const bc = new BroadcastChannel('rr_sync_channel');
      bc.postMessage({ type: 'MUTATION', key });
      bc.close();
    } catch {
      // BroadcastChannel unsupported fallback
    }

    // Dispatch local custom event
    window.dispatchEvent(new CustomEvent('rr_store_change', { detail: { key, type: 'MUTATION' } }));

    // Non-blocking on-demand Next.js server cache purge
    try {
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' }),
      }).catch(() => {
        // Silently tolerate if offline or sandboxed
      });
    } catch {
      // Ignore background fetch error
    }
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

// Database error state tracking
let lastDatabaseError: string | null = null;

export const DataStore = {
  getLastDatabaseError(): string | null {
    return lastDatabaseError;
  },
  setLastDatabaseError(err: string) {
    lastDatabaseError = err;
  },
  clearLastDatabaseError() {
    lastDatabaseError = null;
  },

  // CARS
  async getCars(): Promise<Car[]> {
    let list: Car[] = [];
    try {
      list = await apiRequest<Car[]>('/api/cars');
      lastDatabaseError = null;
      setCache(STORAGE_KEYS.CARS, list);
    } catch (err: any) {
      console.warn('API getCars error, falling back to local cache:', err);
      lastDatabaseError = 'cars: ' + (err?.message || 'Failed to fetch cars');
      list = getStorage<Car[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    }

    if (!list || list.length === 0) {
      list = INITIAL_CARS;
    }

    // Deep merge with INITIAL_CARS defaults so that specifications, pricing, badges, ratings, and gallery images are enriched if missing
    return list.map((c) => {
      const initial = INITIAL_CARS.find(
        (init) =>
          init.id === c.id ||
          init.name.toLowerCase() === c.name.toLowerCase() ||
          init.slug === c.slug ||
          (init.model_name && c.model_name && init.model_name.toLowerCase() === c.model_name.toLowerCase())
      );

      const isStaleLocalImage = typeof c.image_url === 'string' && c.image_url.startsWith('/images/cars/');
      const isPlaceholderImage =
        !c.image_url ||
        c.image_url.includes('unsplash.com') ||
        c.image_url.includes('placeholder') ||
        c.image_url.includes('bmw') ||
        c.image_url.includes('mercedes') ||
        isStaleLocalImage;

      const resolvedImageUrl =
        isPlaceholderImage && initial
          ? initial.image_url
          : c.image_url || initial?.image_url || '';

      const rawGallery = Array.isArray(c.gallery_images) && c.gallery_images.length > 0
        ? c.gallery_images
        : Array.isArray((c as any).gallery) && (c as any).gallery.length > 0
        ? (c as any).gallery
        : Array.isArray(initial?.gallery_images)
        ? initial.gallery_images
        : [];

      const validGallery = rawGallery.filter(
        (img: string) =>
          typeof img === 'string' &&
          img.trim() !== '' &&
          !img.startsWith('/images/cars/') &&
          !img.includes('placeholder') &&
          !img.includes('unsplash.com')
      );

      const resolvedGallery = validGallery.length > 0
        ? validGallery
        : (resolvedImageUrl && !resolvedImageUrl.startsWith('/images/cars/') ? [resolvedImageUrl] : []);

      return {
        ...(initial || {}),
        ...c,
        image_url: resolvedImageUrl,
        slug: c.slug || initial?.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        gallery: resolvedGallery,
        gallery_images: resolvedGallery,
        amenities: c.amenities && c.amenities.length > 0 ? c.amenities : (initial?.amenities || []),
        highlights: c.highlights && c.highlights.length > 0 ? c.highlights : (initial?.highlights || []),
      };
    });
  },

  async getCarBySlugOrId(identifier: string): Promise<Car | undefined> {
    const cars = await this.getCars();
    const cleanId = decodeURIComponent(identifier).toLowerCase().trim();
    return cars.find((c) => {
      const slug = (c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
      return (
        c.id.toLowerCase() === cleanId ||
        slug === cleanId ||
        c.name.toLowerCase() === cleanId ||
        c.name.toLowerCase().replace(/\s+/g, '-') === cleanId
      );
    });
  },

  async saveCar(car: Partial<Car>): Promise<Car> {
    const generatedSlug = car.slug || (car.name ? car.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    let updatedCar: Car;

    if (car.id) {
      updatedCar = await apiRequest<Car>(`/api/cars/${car.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...car, slug: generatedSlug }),
      });
    } else {
      updatedCar = await apiRequest<Car>('/api/cars', {
        method: 'POST',
        body: JSON.stringify({ ...car, slug: generatedSlug }),
      });
    }

    const currentCars = getStorage<Car[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const idx = currentCars.findIndex((c) => c.id === updatedCar.id || (car.id && c.id === car.id));
    if (idx !== -1) {
      currentCars[idx] = updatedCar;
    } else {
      currentCars.push(updatedCar);
    }
    setStorage(STORAGE_KEYS.CARS, currentCars);
    return updatedCar;
  },

  async deleteCar(id: string): Promise<void> {
    await apiRequest(`/api/cars/${id}`, { method: 'DELETE' });
    const current = getStorage<Car[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const updated = current.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CARS, updated);
  },

  // ROUTES
  async getRoutes(): Promise<Route[]> {
    try {
      const data = await apiRequest<Route[]>('/api/routes');
      if (data && data.length > 0) {
        lastDatabaseError = null;
        setCache(STORAGE_KEYS.ROUTES, data);
        return data;
      }
    } catch (err: any) {
      console.warn('API getRoutes error, falling back to local cache:', err);
      lastDatabaseError = 'routes: ' + (err?.message || 'Failed to fetch routes');
    }
    return getStorage<Route[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
  },

  async saveRoute(route: Partial<Route>): Promise<Route> {
    let updatedRoute: Route;
    if (route.id) {
      updatedRoute = await apiRequest<Route>(`/api/routes/${route.id}`, {
        method: 'PUT',
        body: JSON.stringify(route),
      });
    } else {
      updatedRoute = await apiRequest<Route>('/api/routes', {
        method: 'POST',
        body: JSON.stringify(route),
      });
    }

    const currentRoutes = getStorage<Route[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
    const idx = currentRoutes.findIndex((r) => r.id === updatedRoute.id || (route.id && r.id === route.id));
    if (idx !== -1) {
      currentRoutes[idx] = updatedRoute;
    } else {
      currentRoutes.push(updatedRoute);
    }
    setStorage(STORAGE_KEYS.ROUTES, currentRoutes);
    return updatedRoute;
  },

  async deleteRoute(id: string): Promise<void> {
    await apiRequest(`/api/routes/${id}`, { method: 'DELETE' });
    const current = getStorage<Route[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
    const updated = current.filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.ROUTES, updated);
  },

  // DESTINATIONS
  async getDestinations(): Promise<Destination[]> {
    try {
      const data = await apiRequest<Destination[]>('/api/destinations');
      if (data && data.length > 0) {
        lastDatabaseError = null;
        const normalized = data.map((d: any) => ({
          ...d,
          is_published: typeof d.is_published === 'boolean'
            ? d.is_published
            : (typeof d.is_active === 'boolean' ? d.is_active : true),
        }));
        setCache(STORAGE_KEYS.DESTINATIONS, normalized);
        return normalized;
      }
    } catch (err: any) {
      console.warn('API getDestinations error, falling back to local cache:', err);
      lastDatabaseError = 'destinations: ' + (err?.message || 'Failed to fetch destinations');
    }
    const raw = getStorage<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
    return raw.map((d: any) => ({
      ...d,
      is_published: typeof d.is_published === 'boolean'
        ? d.is_published
        : (typeof d.is_active === 'boolean' ? d.is_active : true),
    }));
  },

  async saveDestination(dest: Partial<Destination>): Promise<Destination> {
    const isPub = typeof dest.is_published === 'boolean'
      ? dest.is_published
      : (typeof dest.is_active === 'boolean' ? dest.is_active : true);

    const payload = {
      ...dest,
      is_published: isPub,
      is_active: isPub,
    };

    let updatedDest: Destination;
    if (dest.id) {
      updatedDest = await apiRequest<Destination>(`/api/destinations/${dest.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      updatedDest = await apiRequest<Destination>('/api/destinations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    updatedDest.is_published = typeof updatedDest.is_published === 'boolean'
      ? updatedDest.is_published
      : isPub;

    const destinations = await this.getDestinations();
    const idx = destinations.findIndex((d) => d.id === updatedDest.id || (dest.id && d.id === dest.id));
    if (idx !== -1) {
      destinations[idx] = updatedDest;
    } else {
      destinations.push(updatedDest);
    }
    setStorage(STORAGE_KEYS.DESTINATIONS, destinations);
    return updatedDest;
  },

  async deleteDestination(id: string): Promise<void> {
    await apiRequest(`/api/destinations/${id}`, { method: 'DELETE' });
    const current = getStorage<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
    const updated = current.filter((d) => d.id !== id);
    setStorage(STORAGE_KEYS.DESTINATIONS, updated);
  },

  // REVIEWS
  async getReviews(): Promise<Review[]> {
    try {
      const data = await apiRequest<Review[]>('/api/reviews');
      if (data && data.length > 0) {
        lastDatabaseError = null;
        setCache(STORAGE_KEYS.REVIEWS, data);
        return data;
      }
    } catch (err: any) {
      console.warn('API getReviews error, falling back to local cache:', err);
      lastDatabaseError = 'reviews: ' + (err?.message || 'Failed to fetch reviews');
    }
    return getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  async saveReview(review: Partial<Review>): Promise<Review> {
    let updatedReview: Review;
    if (review.id) {
      updatedReview = await apiRequest<Review>(`/api/reviews/${review.id}`, {
        method: 'PUT',
        body: JSON.stringify(review),
      });
    } else {
      updatedReview = await apiRequest<Review>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      });
    }

    const currentReviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const idx = currentReviews.findIndex((r) => r.id === updatedReview.id || (review.id && r.id === review.id));
    if (idx !== -1) {
      currentReviews[idx] = updatedReview;
    } else {
      currentReviews.push(updatedReview);
    }
    setStorage(STORAGE_KEYS.REVIEWS, currentReviews);
    return updatedReview;
  },

  async deleteReview(id: string): Promise<void> {
    await apiRequest(`/api/reviews/${id}`, { method: 'DELETE' });
    const current = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const updated = current.filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.REVIEWS, updated);
  },

  // INQUIRIES
  async getInquiries(): Promise<Inquiry[]> {
    try {
      const data = await apiRequest<Inquiry[]>('/api/inquiries');
      if (Array.isArray(data)) {
        const normalized = data.map((item) => ({
          ...item,
          submission_type: item.submission_type || 'booking',
        }));
        setCache(STORAGE_KEYS.INQUIRIES, normalized);
        return normalized;
      }
      return [];
    } catch (err: any) {
      // Re-throw authentication/authorization errors so admin dashboard handles 401 properly
      if (
        err?.message?.includes('401') ||
        err?.message?.toLowerCase().includes('authentication') ||
        err?.message?.toLowerCase().includes('log in') ||
        err?.message?.includes('403')
      ) {
        throw err;
      }
      console.warn('API getInquiries error:', err);
      const cached = getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
      return cached.map((item) => ({
        ...item,
        submission_type: item.submission_type || 'booking',
      }));
    }
  },

  async submitInquiry(input: InquiryFormInput, source: 'website' | 'phone' | 'whatsapp' = 'website'): Promise<Inquiry> {
    const data = await apiRequest<Inquiry>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({ ...input, source }),
    });
    const inquiries = getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    inquiries.unshift(data);
    setStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    return data;
  },

  async updateInquiryStatus(
    id: string,
    status: Inquiry['status'],
    notes?: string,
    agreedPrice?: number,
    submissionType?: Inquiry['submission_type']
  ): Promise<Inquiry | null> {
    const updated = await apiRequest<Inquiry>(`/api/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        internal_notes: notes,
        agreed_price: agreedPrice,
        ...(submissionType ? { submission_type: submissionType } : {}),
      }),
    });
    const inquiries = getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inquiries[idx] = updated;
      setStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    }
    return updated;
  },

  async deleteInquiry(id: string): Promise<void> {
    await apiRequest(`/api/inquiries/${id}`, { method: 'DELETE' });
    const current = getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const updated = current.filter((i) => i.id !== id);
    setStorage(STORAGE_KEYS.INQUIRIES, updated);
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    try {
      const data = await apiRequest<SiteSettings>('/api/settings');
      if (data) {
        setCache(STORAGE_KEYS.SETTINGS, data);
        return data;
      }
    } catch (err: any) {
      console.warn('API getSettings error, falling back to local storage:', err);
    }
    return getStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const saved = await apiRequest<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    setStorage(STORAGE_KEYS.SETTINGS, saved);
    return saved;
  },

  // HOMEPAGE SECTIONS
  async getHomepageContent(): Promise<Record<string, HomepageSection>> {
    try {
      const data = await apiRequest<Record<string, HomepageSection>>('/api/content');
      if (data && Object.keys(data).length > 0) {
        const map: Record<string, HomepageSection> = { ...INITIAL_CONTENT, ...data };
        setCache(STORAGE_KEYS.CONTENT, map);
        return map;
      }
    } catch (err: any) {
      console.warn('API getHomepageContent error, falling back to local storage:', err);
    }
    return getStorage<Record<string, HomepageSection>>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  },

  async saveHomepageContent(key: string, content: Partial<HomepageSection>): Promise<HomepageSection> {
    const saved = await apiRequest<HomepageSection>(`/api/content/${key}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });

    const all = getStorage<Record<string, HomepageSection>>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
    all[key] = saved;
    setStorage(STORAGE_KEYS.CONTENT, all);
    return saved;
  },

  // CLOUDINARY STORAGE ASSET UPLOAD
  async uploadAsset(
    file: File,
    folder: string = 'general'
  ): Promise<{ url: string; secure_url: string; public_id: string; format?: string; sizeBytes?: number }> {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Unsupported image format (${file.type}). Please upload JPG, PNG, WebP, or SVG.`);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image file is too large. Maximum allowed size is 10MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const errorMsg = errorJson.error || `Upload failed with HTTP ${res.status}`;
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rr_token');
          localStorage.removeItem('rr_admin_auth');
          window.dispatchEvent(new CustomEvent('rr_auth_expired'));
        }
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return {
      url: data.secure_url || data.url,
      secure_url: data.secure_url || data.url,
      public_id: data.public_id,
      format: data.format,
      sizeBytes: data.sizeBytes,
    };
  },

  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    const asset = await this.uploadAsset(file, folder);
    return asset.secure_url;
  },

  async importAssetFromUrl(
    url: string,
    folder: string = 'general'
  ): Promise<{ url: string; secure_url: string; public_id: string }> {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are permitted.');
    }

    const res = await fetch('/api/import-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ url: trimmed, folder }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const errorMsg = errorJson.error || `Image import failed with HTTP ${res.status}`;
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rr_token');
          localStorage.removeItem('rr_admin_auth');
          window.dispatchEvent(new CustomEvent('rr_auth_expired'));
        }
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return {
      url: data.secure_url || data.url,
      secure_url: data.secure_url || data.url,
      public_id: data.public_id,
    };
  },

  async importImageFromUrl(url: string, folder: string = 'general'): Promise<string> {
    const asset = await this.importAssetFromUrl(url, folder);
    return asset.secure_url;
  },

  // CATALOG RECONCILIATION & HEALTH CHECK
  async reconcileCatalogData(): Promise<{
    routesInserted: number;
    pricesInserted: number;
    destinationsInserted: number;
    reviewsInserted: number;
    settingsUpdated: boolean;
    errors: string[];
  }> {
    const report = {
      routesInserted: 0,
      pricesInserted: 0,
      destinationsInserted: 0,
      reviewsInserted: 0,
      settingsUpdated: true,
      errors: [] as string[],
    };

    try {
      const health = await apiRequest<{ status: string; database?: any; cloudinary?: any }>('/api/health');
      if (health.status !== 'ok') {
        report.errors.push('Database reporting status: ' + health.status);
      }
      window.dispatchEvent(new CustomEvent('rr_store_change', { detail: { key: 'all' } }));
    } catch (err: any) {
      report.errors.push(err.message || 'Cannot reach API backend');
    }

    return report;
  },

  // LOCAL STORAGE MIGRATION PREVIEW
  getLocalStorageMigrationPreview() {
    return {
      cars: getStorage<Car[]>(STORAGE_KEYS.CARS, []),
      routes: getStorage<Route[]>(STORAGE_KEYS.ROUTES, []),
      destinations: getStorage<Destination[]>(STORAGE_KEYS.DESTINATIONS, []),
      reviews: getStorage<Review[]>(STORAGE_KEYS.REVIEWS, []),
      inquiries: getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []),
      settings: getStorage<SiteSettings | null>(STORAGE_KEYS.SETTINGS, null),
    };
  },

  // REALTIME SYNCHRONIZATION
  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    return RealtimeManager.getInstance().subscribe(callback);
  },

  getRealtimeStatus(): string {
    return RealtimeManager.getInstance().getStatus();
  },
};

export type RealtimeEvent = {
  type: string;
  key: string;
  table?: string;
  payload?: Record<string, unknown> | null;
  timestamp?: number;
};

// Singleton Realtime Synchronization Manager
// Coordinates BroadcastChannel across browser tabs and local window events
class RealtimeManager {
  private static instance: RealtimeManager;
  private subscribers: Set<(event: RealtimeEvent) => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isInitialized = false;
  private status: 'connected' | 'connecting' | 'disconnected' = 'connected';
  private lastHiddenTime = 0;

  private constructor() {}

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  public getStatus(): string {
    return this.status;
  }

  public subscribe(callback: (event: RealtimeEvent) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    this.subscribers.add(callback);

    if (!this.isInitialized) {
      this.init();
    }

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.teardown();
      }
    };
  }

  private notifyTimeout: any = null;

  private notify(event: RealtimeEvent) {
    if (this.notifyTimeout) {
      clearTimeout(this.notifyTimeout);
    }
    this.notifyTimeout = setTimeout(() => {
      this.subscribers.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          console.error('Realtime callback error:', err);
        }
      });
    }, 150);
  }

  private init() {
    this.isInitialized = true;
    this.status = 'connected';

    // 1. Cross-tab BroadcastChannel
    try {
      this.broadcastChannel = new BroadcastChannel('rr_sync_channel');
      this.broadcastChannel.onmessage = (e: MessageEvent) => {
        if (e.data && e.data.type) {
          this.notify({ ...e.data, timestamp: Date.now() });
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }

    // 2. Same-window custom event (only notify on actual MUTATION)
    window.addEventListener('rr_store_change', this.handleLocalEvent);

    // 3. Tab visibility listener (re-sync on tab refocus if inactive)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 4. Online/offline connection resilience
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleLocalEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    // Only notify if it's a MUTATION event
    if (detail?.type === 'MUTATION') {
      this.notify({
        type: 'MUTATION',
        key: detail?.key || 'all',
        timestamp: Date.now(),
      });
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.lastHiddenTime = Date.now();
    } else {
      // If inactive for > 5s, trigger silent resync to guarantee freshness
      if (Date.now() - this.lastHiddenTime > 5000) {
        this.notify({
          type: 'VISIBILITY_RESYNC',
          key: 'all',
          timestamp: Date.now(),
        });
      }
    }
  };

  private handleOnline = () => {
    this.status = 'connected';
    this.notify({
      type: 'NETWORK_RECONNECTED',
      key: 'all',
      timestamp: Date.now(),
    });
  };

  private handleOffline = () => {
    this.status = 'disconnected';
  };

  private teardown() {
    this.isInitialized = false;

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // Safe ignore
      }
      this.broadcastChannel = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('rr_store_change', this.handleLocalEvent);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.status = 'disconnected';
  }
}


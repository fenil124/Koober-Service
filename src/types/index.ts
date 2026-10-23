export type CarType = 'MPV' | 'Sedan' | 'Luxury Van' | 'SUV' | 'Tempo Traveller' | 'Luxury' | string;

export interface Car {
  id: string;
  name: string;
  car_type: string;
  seating_capacity: string;
  image_url: string;
  hero_image_url?: string;
  cloudinary_public_id?: string | null;
  is_active: boolean;
  is_hero_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;

  // Extended fields for Fleet Card & Vehicle Details
  slug?: string;
  manufacturer?: string;
  model_name?: string;
  category_badge?: string;
  rating?: number;
  review_count?: number;
  review_count_text?: string;
  seats_count?: number;
  fuel_type?: string;
  transmission?: string;
  outstation_price_per_km?: number;
  daily_package_price?: number;
  daily_package_text?: string;
  min_km_per_day?: number | string;
  package_duration_hours?: number;
  package_included_km?: number;
  driver_allowance?: number;
  extra_km_rate?: number;
  extra_hour_rate?: number;
  tagline?: string;
  short_description?: string;
  full_description?: string;
  engine_powertrain?: string;
  horsepower?: string;
  top_speed?: string;
  driver_option?: string;
  luggage_capacity?: string;
  amenities?: string[];
  gallery?: string[];
  gallery_images?: string[];
  highlights?: string[];
}

export interface RoutePrice {
  id: string;
  route_id: string;
  car_id: string;
  price: number | null; // null means "Get a Quote"
  car?: Car;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  prices?: RoutePrice[];
  created_at?: string;
  updated_at?: string;
}

export interface Destination {
  id: string;
  name: string;
  description?: string | null;
  image_url: string;
  cloudinary_public_id?: string | null;
  is_published: boolean;
  is_active?: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  avatar_url?: string | null;
  cloudinary_public_id?: string | null;
  is_published: boolean;
  is_demo: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type InquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Given'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export type InquirySource = 'website' | 'phone' | 'whatsapp';
export type SubmissionType = 'inquiry' | 'booking';

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  pickup_location: string;
  destination: string;
  travel_date: string;
  travel_time?: string;
  car_name?: string;
  car_id?: string | null;
  passengers: number;
  trip_type: 'one-way' | 'round-trip';
  message?: string | null;
  status: InquiryStatus;
  submission_type?: SubmissionType;
  internal_notes?: string | null;
  agreed_price?: number | null;
  source: InquirySource;
  created_at: string;
  updated_at?: string;
}

export interface SiteSettings {
  id: string;
  agency_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo_url?: string | null;
  cloudinary_public_id?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  cta_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  body?: string;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
}

export interface InquiryFormInput {
  customer_name: string;
  phone: string;
  pickup_location: string;
  destination: string;
  travel_date: string;
  travel_time?: string;
  car_id?: string;
  car_name?: string;
  passengers: number;
  trip_type: 'one-way' | 'round-trip';
  submission_type?: SubmissionType;
  message?: string;
}

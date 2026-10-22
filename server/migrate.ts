import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

import fs from 'fs';
import { connectDB } from './db';
import { uploadUrlToCloudinary, isCloudinaryConfigured } from './cloudinary';
import { hashPassword } from './auth';

import { User } from './models/User';
import { Car } from './models/Car';
import { Route } from './models/Route';
import { Destination } from './models/Destination';
import { Review } from './models/Review';
import { Inquiry } from './models/Inquiry';
import { HomepageSection } from './models/HomepageSection';
import { SiteSettings } from './models/SiteSettings';

async function migrate() {
  console.log('--- STARTING ROYALRIDES SUPABASE TO MONGODB & CLOUDINARY MIGRATION ---');

  await connectDB();

  const backupPath = path.resolve(__dirname, 'supabase-backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('Backup file not found at:', backupPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(backupPath, 'utf-8');
  const backup = JSON.parse(raw);

  const stats = {
    users: 0,
    cars: 0,
    routes: 0,
    destinations: 0,
    reviews: 0,
    inquiries: 0,
    homepage_sections: 0,
    settings: 0,
    mediaUploadedToCloudinary: 0,
    mediaSkippedOrLocal: 0,
  };

  // Helper to upload remote Supabase image to Cloudinary
  async function migrateMedia(url: string | null | undefined, folder: string): Promise<{ url: string; public_id?: string }> {
    if (!url) return { url: '' };

    // If it's a Supabase storage URL or external http URL and Cloudinary is configured
    if (isCloudinaryConfigured() && (url.includes('supabase.co') || url.startsWith('http://') || url.startsWith('https://'))) {
      try {
        console.log(`[Cloudinary Migration] Uploading: ${url.substring(0, 60)}...`);
        const res = await uploadUrlToCloudinary(url, `royalrides/${folder}`);
        stats.mediaUploadedToCloudinary++;
        console.log(`[Cloudinary Migration] Saved to: ${res.secure_url}`);
        return { url: res.secure_url, public_id: res.public_id };
      } catch (err: any) {
        console.warn(`[Cloudinary Migration Warning] Failed to upload ${url} to Cloudinary:`, err?.message || err);
        // Fall back to original URL
        return { url };
      }
    }

    stats.mediaSkippedOrLocal++;
    return { url };
  }

  // 1. Users / Profiles
  console.log('\n[1/8] Migrating Users & Profiles...');
  const profiles = backup.profiles || [];
  const defaultPassword = 'admin@royalrides123';
  const hashedPassword = await hashPassword(defaultPassword);

  for (const prof of profiles) {
    const existing = await User.findOne({ email: prof.email });
    if (!existing) {
      await User.create({
        id: prof.id,
        email: prof.email,
        password_hash: hashedPassword,
        full_name: prof.full_name || 'Administrator',
        role: prof.role || 'admin',
        avatar_url: prof.avatar_url,
      });
      stats.users++;
    } else {
      console.log(`User ${prof.email} already exists in MongoDB.`);
    }
  }

  // Ensure default demo admin also exists
  const demoEmail = 'admin@gmail.com';
  const demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    await User.create({
      id: 'usr_demo_admin',
      email: demoEmail,
      password_hash: hashedPassword,
      full_name: 'Koober Admin',
      role: 'admin',
    });
    stats.users++;
  }

  // 2. Cars
  console.log('\n[2/8] Migrating Cars...');
  const cars = backup.cars || [];
  for (const car of cars) {
    const mainImg = await migrateMedia(car.image_url, 'cars');
    const heroImg = car.hero_image_url && car.hero_image_url !== car.image_url
      ? await migrateMedia(car.hero_image_url, 'cars')
      : mainImg;

    const payload = {
      id: car.id,
      name: car.name,
      car_type: car.car_type || 'Sedan',
      seating_capacity: car.seating_capacity || '4+1 Seating',
      image_url: mainImg.url,
      hero_image_url: heroImg.url,
      cloudinary_public_id: mainImg.public_id || heroImg.public_id || null,
      is_active: car.is_active ?? true,
      is_hero_featured: car.is_hero_featured ?? true,
      display_order: car.display_order || 0,
      per_km_rate: car.per_km_rate || null,
      driver_allowance: car.driver_allowance || null,
      fuel_type: car.fuel_type || 'Diesel',
      transmission: car.transmission || 'Manual',
      features: car.features || [],
      luggage_capacity: car.luggage_capacity || '3 Bags',
      full_description: car.full_description || null,
    };

    await Car.findOneAndUpdate({ id: car.id }, payload, { upsert: true, new: true });
    stats.cars++;
  }

  // 3. Routes & Route Prices
  console.log('\n[3/8] Migrating Routes...');
  const routes = backup.routes || [];
  const routePrices = backup.route_prices || [];

  for (const r of routes) {
    const pricesForRoute = routePrices
      .filter((rp: any) => rp.route_id === r.id)
      .map((rp: any) => ({ car_id: rp.car_id, price: Number(rp.price) || 0 }));

    const routeImg = await migrateMedia(r.image_url, 'routes');

    const payload = {
      id: r.id,
      origin: r.origin,
      destination: r.destination,
      image_url: routeImg.url,
      cloudinary_public_id: routeImg.public_id || null,
      is_active: r.is_active ?? true,
      is_featured: r.is_featured ?? true,
      display_order: r.display_order || 0,
      prices: pricesForRoute,
    };

    await Route.findOneAndUpdate({ id: r.id }, payload, { upsert: true, new: true });
    stats.routes++;
  }

  // 4. Destinations
  console.log('\n[4/8] Migrating Destinations...');
  const destinations = backup.destinations || [];
  for (const d of destinations) {
    const destImg = await migrateMedia(d.image_url, 'destinations');

    const payload = {
      id: d.id,
      name: d.name,
      state: d.state,
      image_url: destImg.url,
      cloudinary_public_id: destImg.public_id || null,
      category: d.category || 'Hill Station',
      distance_km: Number(d.distance_km) || 0,
      starting_price: Number(d.starting_price) || 0,
      is_featured: d.is_featured ?? false,
      is_active: d.is_active ?? true,
      display_order: d.display_order || 0,
      description: d.description || null,
      key_attractions: d.key_attractions || [],
      best_time_to_visit: d.best_time_to_visit || null,
    };

    await Destination.findOneAndUpdate({ id: d.id }, payload, { upsert: true, new: true });
    stats.destinations++;
  }

  // 5. Reviews
  console.log('\n[5/8] Migrating Reviews...');
  const reviews = backup.reviews || [];
  for (const rev of reviews) {
    const avatar = await migrateMedia(rev.avatar_url, 'reviews');

    const payload = {
      id: rev.id,
      customer_name: rev.customer_name,
      rating: Number(rev.rating) || 5,
      review_text: rev.review_text,
      avatar_url: avatar.url || null,
      cloudinary_public_id: avatar.public_id || null,
      is_published: rev.is_published ?? true,
      is_demo: rev.is_demo ?? false,
      display_order: rev.display_order || 0,
    };

    await Review.findOneAndUpdate({ id: rev.id }, payload, { upsert: true, new: true });
    stats.reviews++;
  }

  // 6. Inquiries
  console.log('\n[6/8] Migrating Inquiries...');
  const inquiries = backup.inquiries || [];
  for (const inq of inquiries) {
    const payload = {
      id: inq.id,
      customer_name: inq.customer_name,
      phone: inq.phone,
      pickup_location: inq.pickup_location,
      destination: inq.destination,
      travel_date: inq.travel_date,
      travel_time: inq.travel_time || 'Morning',
      car_name: inq.car_name || null,
      car_id: inq.car_id || null,
      passengers: Number(inq.passengers) || 1,
      trip_type: inq.trip_type || 'one-way',
      message: inq.message || null,
      status: inq.status || 'New',
      internal_notes: inq.internal_notes || null,
      agreed_price: inq.agreed_price ? Number(inq.agreed_price) : null,
      source: inq.source || 'website',
    };

    await Inquiry.findOneAndUpdate({ id: inq.id }, payload, { upsert: true, new: true });
    stats.inquiries++;
  }

  // 7. Homepage Sections
  console.log('\n[7/8] Migrating Homepage Sections...');
  const homepageSections = backup.homepage_sections || [];
  for (const sec of homepageSections) {
    const secImg = await migrateMedia(sec.image_url, 'content');

    const payload = {
      id: sec.id,
      title: sec.title,
      subtitle: sec.subtitle,
      badge: sec.badge,
      body: sec.body,
      image_url: secImg.url,
      cloudinary_public_id: secImg.public_id || null,
    };

    await HomepageSection.findOneAndUpdate({ id: sec.id }, payload, { upsert: true, new: true });
    stats.homepage_sections++;
  }

  // Also ensure 'features' and 'contact' sections exist
  const existingFeatures = await HomepageSection.findOne({ id: 'features' });
  if (!existingFeatures) {
    await HomepageSection.create({
      id: 'features',
      title: 'Why Choose Koober Services',
      subtitle: 'Excellence in Every Mile',
      badge: 'OUR PROMISE',
      body: 'Punctual door-to-door pickups, sanitized and comfortable vehicles, experienced vetted chauffeurs, and transparent billing.',
    });
    stats.homepage_sections++;
  }

  const existingContact = await HomepageSection.findOne({ id: 'contact' });
  if (!existingContact) {
    await HomepageSection.create({
      id: 'contact',
      title: 'Ready to Plan Your Journey?',
      subtitle: 'Get in touch with our team for quick quotes, custom itineraries, and reservations.',
      badge: 'CONTACT US',
      body: 'Available 24/7 for emergency bookings, corporate packages, and outstation inquiries.',
    });
    stats.homepage_sections++;
  }

  // 8. Site Settings
  console.log('\n[8/8] Migrating Site Settings...');
  const settingsList = backup.site_settings || [];
  const s = settingsList[0] || {};
  const logo = await migrateMedia(s.logo_url, 'branding');

  await SiteSettings.findOneAndUpdate(
    { id: 'default' },
    {
      id: 'default',
      agency_name: s.agency_name || 'Koober Services',
      tagline: s.tagline || 'Comfortable Rides for Every Journey',
      phone: s.phone || '+91 98765 43210',
      whatsapp: s.whatsapp || '+91 98765 43210',
      email: s.email || 'contact@kooberservices.com',
      address: s.address || 'Ring Road, Surat, Gujarat 395002',
      logo_url: logo.url || null,
      cloudinary_public_id: logo.public_id || null,
      facebook_url: s.facebook_url || '',
      instagram_url: s.instagram_url || '',
      youtube_url: s.youtube_url || '',
      cta_text: s.cta_text || 'Book Your Ride',
    },
    { upsert: true, new: true }
  );
  stats.settings = 1;

  console.log('\n--- MIGRATION COMPLETED SUCCESSFULLY ---');
  console.log('Final Migration Statistics:', JSON.stringify(stats, null, 2));

  process.exit(0);
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

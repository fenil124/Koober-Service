import dotenv from 'dotenv';
import path from 'path';

// Explicitly load root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import { connectDB } from './db';
import { User } from './models/User';
import { Car } from './models/Car';
import { HomepageSection } from './models/HomepageSection';
import { Inquiry } from './models/Inquiry';
import { signToken, verifyToken, comparePassword } from './auth';
import { isCloudinaryConfigured, cloudinary } from './cloudinary';

async function runTests() {
  console.log('--- RoyalRides Backend & MongoDB Atlas & Cloudinary Test Suite ---');

  // 1. Database Connection Test
  console.log('\n[TEST 1] Testing MongoDB Atlas Connection...');
  await connectDB();
  console.log('✓ Connected to MongoDB Atlas. Current readyState:', mongoose.connection.readyState);
  console.log('✓ Database Name:', mongoose.connection.db?.databaseName);

  // 2. Cloudinary Storage Configuration Test
  console.log('\n[TEST 2] Testing Cloudinary Configuration & Ping...');
  const isCloudConfigured = isCloudinaryConfigured();
  console.log('✓ isCloudinaryConfigured():', isCloudConfigured);
  if (!isCloudConfigured) {
    throw new Error('Cloudinary is not configured');
  }
  const ping = await cloudinary.api.ping();
  console.log('✓ Cloudinary Ping Response:', ping);

  // 3. User Authentication & Password Hashing Test
  console.log('\n[TEST 3] Testing User Authentication & JWT...');
  const adminUser = await User.findOne({ email: 'admin@royalrides.com' });
  if (!adminUser) {
    throw new Error('admin@royalrides.com not found in MongoDB Users collection');
  }
  console.log('✓ Admin user found:', adminUser.email, 'Role:', adminUser.role);
  const isValidPass = await comparePassword('admin@royalrides123', adminUser.password_hash);
  console.log('✓ Password verification with bcryptjs:', isValidPass);
  if (!isValidPass) {
    throw new Error('Password mismatch for admin');
  }
  const token = signToken({
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    fullName: adminUser.name || 'Admin',
  });
  console.log('✓ Signed JWT Token:', token.substring(0, 30) + '...');
  const decoded = verifyToken(token);
  console.log('✓ Decoded JWT Payload:', decoded?.email, decoded?.role);

  // 4. Cars Collection Test
  console.log('\n[TEST 4] Testing Cars Collection in MongoDB...');
  const cars = await Car.find().sort({ display_order: 1 });
  console.log(`✓ Retrieved ${cars.length} cars from MongoDB Atlas:`);
  cars.forEach((c) => {
    console.log(`   - ${c.name} (${c.model_name}): hero_image=${c.hero_image_url?.substring(0, 50)}...`);
  });

  // 5. Hero Background Image Update & Public Display Test (Requirement 5)
  console.log('\n[TEST 5] Testing Hero Background Image Update & MongoDB Persistence...');
  const initialHero = await HomepageSection.findOne({ id: 'hero' });
  console.log('✓ Current Hero Image URL:', initialHero?.image_url);

  const testCloudinaryUrl = 'https://res.cloudinary.com/imjtguki/image/upload/v1776773229/royalrides/content/hero_cinematic_skyline.jpg';
  console.log('✓ Updating Hero Section image_url to Cloudinary URL in MongoDB...');
  const updatedHero = await HomepageSection.findOneAndUpdate(
    { id: 'hero' },
    { image_url: testCloudinaryUrl, updated_at: new Date() },
    { new: true, upsert: true }
  );
  console.log('✓ Updated Hero document in MongoDB:', updatedHero.id, 'image_url:', updatedHero.image_url);

  // Re-fetch to ensure persistence across sessions/refreshes
  const refetchedHero = await HomepageSection.findOne({ id: 'hero' });
  if (refetchedHero?.image_url !== testCloudinaryUrl) {
    throw new Error('Hero image_url was not persisted properly to MongoDB Atlas!');
  }
  console.log('✓ Verified re-fetch: Hero Background image is persistent across reloads:', refetchedHero.image_url);

  // 6. Inquiries CRUD Test
  console.log('\n[TEST 6] Testing Customer Inquiry Submission & Status Flow...');
  const testInquiry = await Inquiry.create({
    id: 'test_inq_' + Date.now(),
    customer_name: 'Test Customer Migration',
    phone: '9988776655',
    pickup_location: 'Surat Railway Station',
    destination: 'Mumbai International Airport',
    travel_date: '2026-11-01',
    travel_time: '10:00 AM',
    car_name: 'Innova Crysta',
    passengers: 4,
    trip_type: 'one-way',
    status: 'New',
    source: 'website',
  });
  console.log('✓ Created test inquiry in MongoDB:', testInquiry.id, testInquiry.customer_name);

  // Update status
  const updatedInquiry = await Inquiry.findOneAndUpdate(
    { id: testInquiry.id },
    { status: 'Confirmed', agreed_price: 6500, internal_notes: 'Verified via test suite' },
    { new: true }
  );
  console.log('✓ Updated inquiry status:', updatedInquiry?.status, 'Agreed Price:', updatedInquiry?.agreed_price);

  // Clean up test inquiry
  await Inquiry.deleteOne({ id: testInquiry.id });
  console.log('✓ Cleaned up test inquiry');

  console.log('\n========================================');
  console.log('ALL BACKEND, MONGODB ATLAS & CLOUDINARY TESTS PASSED!');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});

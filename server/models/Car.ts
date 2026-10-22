import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
  id: string;
  name: string;
  car_type: string;
  seating_capacity: string;
  image_url: string;
  hero_image_url?: string | null;
  cloudinary_public_id?: string | null;
  gallery?: string[];
  gallery_images?: string[];
  is_active: boolean;
  is_hero_featured?: boolean;
  display_order: number;
  per_km_rate?: number | null;
  driver_allowance?: number | null;
  fuel_type?: string | null;
  transmission?: string | null;
  features?: string[];
  luggage_capacity?: string | null;
  full_description?: string | null;
  created_at: Date;
  updated_at: Date;
}

const CarSchema = new Schema<ICar>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    car_type: { type: String, required: true, trim: true },
    seating_capacity: { type: String, required: true, trim: true },
    image_url: { type: String, required: true },
    hero_image_url: { type: String, default: null },
    cloudinary_public_id: { type: String, default: null },
    gallery: { type: [String], default: [] },
    gallery_images: { type: [String], default: [] },
    is_active: { type: Boolean, default: true, index: true },
    is_hero_featured: { type: Boolean, default: false },
    display_order: { type: Number, default: 0, index: true },
    per_km_rate: { type: Number, default: null },
    driver_allowance: { type: Number, default: null },
    fuel_type: { type: String, default: 'Diesel' },
    transmission: { type: String, default: 'Manual' },
    features: { type: [String], default: [] },
    luggage_capacity: { type: String, default: '3 Bags' },
    full_description: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Car = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

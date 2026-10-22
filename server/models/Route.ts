import mongoose, { Schema, Document } from 'mongoose';

export interface IRoutePrice {
  car_id: string;
  price: number;
}

export interface IRoute extends Document {
  id: string;
  origin: string;
  destination: string;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  distance_km?: number | null;
  estimated_duration?: string | null;
  popular_pickup_points?: string[];
  drop_points?: string[];
  toll_tax_included?: boolean;
  prices: IRoutePrice[];
  created_at: Date;
  updated_at: Date;
}

const RoutePriceSchema = new Schema<IRoutePrice>(
  {
    car_id: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const RouteSchema = new Schema<IRoute>(
  {
    id: { type: String, required: true, unique: true, index: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    image_url: { type: String, default: null },
    cloudinary_public_id: { type: String, default: null },
    is_active: { type: Boolean, default: true, index: true },
    is_featured: { type: Boolean, default: false },
    display_order: { type: Number, default: 0, index: true },
    distance_km: { type: Number, default: null },
    estimated_duration: { type: String, default: null },
    popular_pickup_points: { type: [String], default: [] },
    drop_points: { type: [String], default: [] },
    toll_tax_included: { type: Boolean, default: true },
    prices: { type: [RoutePriceSchema], default: [] },
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

export const Route = mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);

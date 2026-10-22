import mongoose, { Schema, Document } from 'mongoose';

export interface IDestination extends Document {
  id: string;
  name: string;
  state: string;
  image_url: string;
  cloudinary_public_id?: string | null;
  category?: string | null;
  distance_km?: number | null;
  starting_price?: number | null;
  is_featured: boolean;
  is_active: boolean;
  is_published: boolean;
  display_order: number;
  description?: string | null;
  key_attractions?: string[];
  best_time_to_visit?: string | null;
  created_at: Date;
  updated_at: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, default: 'Gujarat', trim: true },
    image_url: { type: String, required: true },
    cloudinary_public_id: { type: String, default: null },
    category: { type: String, default: 'Hill Station' },
    distance_km: { type: Number, default: 0 },
    starting_price: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true, index: true },
    is_published: { type: Boolean, default: true, index: true },
    display_order: { type: Number, default: 0, index: true },
    description: { type: String, default: null },
    key_attractions: { type: [String], default: [] },
    best_time_to_visit: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        delete ret._id;
        if (ret.is_published === undefined && ret.is_active !== undefined) {
          ret.is_published = ret.is_active;
        }
        if (ret.is_active === undefined && ret.is_published !== undefined) {
          ret.is_active = ret.is_published;
        }
        return ret;
      },
    },
  }
);

export const Destination =
  mongoose.models.Destination || mongoose.model<IDestination>('Destination', DestinationSchema);

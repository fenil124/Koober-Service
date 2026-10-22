import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepageSection extends Document {
  id: string;
  title: string;
  subtitle: string;
  badge?: string | null;
  body?: string | null;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

const HomepageSectionSchema = new Schema<IHomepageSection>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    badge: { type: String, default: null },
    body: { type: String, default: null },
    image_url: { type: String, default: null },
    cloudinary_public_id: { type: String, default: null },
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

export const HomepageSection =
  mongoose.models.HomepageSection ||
  mongoose.model<IHomepageSection>('HomepageSection', HomepageSectionSchema);

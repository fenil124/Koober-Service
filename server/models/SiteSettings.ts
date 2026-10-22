import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
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
  created_at: Date;
  updated_at: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    id: { type: String, required: true, unique: true, default: 'default', index: true },
    agency_name: { type: String, default: 'Koober Services' },
    tagline: { type: String, default: 'Comfortable Rides for Every Journey' },
    phone: { type: String, default: '+91 98765 43210' },
    whatsapp: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'contact@kooberservices.com' },
    address: { type: String, default: 'Ring Road, Surat, Gujarat 395002' },
    logo_url: { type: String, default: null },
    cloudinary_public_id: { type: String, default: null },
    facebook_url: { type: String, default: null },
    instagram_url: { type: String, default: null },
    youtube_url: { type: String, default: null },
    cta_text: { type: String, default: 'Book Your Ride' },
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

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

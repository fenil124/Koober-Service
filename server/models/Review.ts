import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  avatar_url?: string | null;
  cloudinary_public_id?: string | null;
  is_published: boolean;
  is_demo: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer_name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String, required: true, trim: true },
    avatar_url: { type: String, default: null },
    cloudinary_public_id: { type: String, default: null },
    is_published: { type: Boolean, default: true, index: true },
    is_demo: { type: Boolean, default: false },
    display_order: { type: Number, default: 0, index: true },
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

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

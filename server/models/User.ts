import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'staff' | 'user';
  avatar_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'staff', 'user'], default: 'admin' },
    avatar_url: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.password_hash;
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

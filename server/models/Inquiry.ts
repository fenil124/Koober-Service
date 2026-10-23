import mongoose, { Schema, Document } from 'mongoose';

export type InquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Given'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export const VALID_INQUIRY_STATUSES: InquiryStatus[] = [
  'New',
  'Contacted',
  'Quotation Given',
  'Confirmed',
  'Completed',
  'Cancelled',
];

const STATUS_NORMALIZATION_MAP: Record<string, InquiryStatus> = {
  'new': 'New',
  'contacted': 'Contacted',
  'quotation given': 'Quotation Given',
  'quotation_given': 'Quotation Given',
  'quotation-given': 'Quotation Given',
  'quote given': 'Quotation Given',
  'confirmed': 'Confirmed',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'canceled': 'Cancelled',
};

export function normalizeInquiryStatus(raw?: string | null): InquiryStatus {
  if (!raw) return 'New';
  const trimmed = String(raw).trim();
  const lower = trimmed.toLowerCase();
  if (STATUS_NORMALIZATION_MAP[lower]) {
    return STATUS_NORMALIZATION_MAP[lower];
  }
  if (VALID_INQUIRY_STATUSES.includes(trimmed as InquiryStatus)) {
    return trimmed as InquiryStatus;
  }
  return 'New';
}

export interface IInquiry extends Document {
  id: string;
  customer_name: string;
  phone: string;
  pickup_location: string;
  destination: string;
  travel_date: string;
  travel_time?: string | null;
  car_name?: string | null;
  car_id?: string | null;
  passengers: number;
  trip_type: 'one-way' | 'round-trip';
  message?: string | null;
  status: InquiryStatus;
  submission_type?: 'inquiry' | 'booking';
  internal_notes?: string | null;
  agreed_price?: number | null;
  source: 'website' | 'phone' | 'whatsapp';
  created_at: Date;
  updated_at: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    pickup_location: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    travel_date: { type: String, required: true },
    travel_time: { type: String, default: 'Morning' },
    car_name: { type: String, default: null },
    car_id: { type: String, default: null },
    passengers: { type: Number, default: 1 },
    trip_type: { type: String, enum: ['one-way', 'round-trip'], default: 'one-way' },
    message: { type: String, default: null },
    status: {
      type: String,
      enum: VALID_INQUIRY_STATUSES,
      set: (val: string) => normalizeInquiryStatus(val),
      default: 'New',
      index: true,
    },
    submission_type: {
      type: String,
      enum: ['inquiry', 'booking'],
      default: 'booking',
      index: true,
    },
    internal_notes: { type: String, default: null },
    agreed_price: { type: Number, default: null },
    source: {
      type: String,
      enum: ['website', 'phone', 'whatsapp'],
      default: 'website',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(_doc, ret: any) {
        if (!ret.submission_type) {
          ret.submission_type = 'booking';
        }
        if (ret.status) {
          ret.status = normalizeInquiryStatus(ret.status);
        }
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Inquiry = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

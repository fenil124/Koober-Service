import { z } from 'zod';

export const inquiryFormSchema = z.object({
  customer_name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(80, { message: 'Name is too long' }),
  phone: z
    .string()
    .min(10, { message: 'Enter a valid 10-digit mobile number' })
    .regex(/^[6-9]\d{9}$|^(\+91[\-\s]?)?[6-9]\d{9}$/, {
      message: 'Enter a valid Indian mobile number (e.g. 9876543210)',
    }),
  pickup_location: z
    .string()
    .min(2, { message: 'Pickup location is required' }),
  destination: z
    .string()
    .min(2, { message: 'Destination is required' }),
  travel_date: z
    .string()
    .min(1, { message: 'Travel date is required' }),
  travel_time: z.string().optional(),
  car_id: z.string().optional(),
  car_name: z.string().optional(),
  passengers: z
    .number()
    .min(1, { message: 'At least 1 passenger' })
    .max(30, { message: 'Maximum 30 passengers' }),
  trip_type: z.enum(['one-way', 'round-trip']),
  message: z.string().max(500, { message: 'Message is too long' }).optional(),
});

export type InquiryFormSchemaType = z.infer<typeof inquiryFormSchema>;

export const carFormSchema = z.object({
  name: z.string().min(2, 'Car name is required'),
  car_type: z.string().min(2, 'Car type is required'),
  seating_capacity: z.string().min(2, 'Seating capacity is required'),
  image_url: z.string().min(1, 'Image URL or selection is required'),
  is_active: z.boolean().default(true),
  is_hero_featured: z.boolean().default(true),
  display_order: z.number().default(0),
});

export const routeFormSchema = z.object({
  origin: z.string().min(2, 'Origin city is required'),
  destination: z.string().min(2, 'Destination is required'),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(true),
});

export const destinationFormSchema = z.object({
  name: z.string().min(2, 'Destination name is required'),
  description: z.string().optional().nullable(),
  image_url: z.string().min(1, 'Image URL is required'),
  is_published: z.boolean().default(true),
});

export const reviewFormSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  rating: z.number().min(1).max(5),
  review_text: z.string().min(10, 'Review text must be at least 10 characters'),
  is_published: z.boolean().default(true),
});

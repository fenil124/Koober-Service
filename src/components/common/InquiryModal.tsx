'use client';

import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Car as CarIcon,
  Loader2,
} from 'lucide-react';
import { inquiryFormSchema, InquiryFormSchemaType } from '@/lib/validations';
import { Car, InquiryFormInput } from '@/types';
import { DataStore } from '@/lib/data-store';

interface InquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cars: Car[];
  prefilledData?: Partial<InquiryFormInput>;
  onSuccess?: () => void;
}

export function InquiryModal({
  open,
  onOpenChange,
  cars,
  prefilledData,
  onSuccess,
}: InquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeCars = cars.filter((c) => c.is_active);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<InquiryFormSchemaType>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      pickup_location: 'Surat',
      destination: '',
      travel_date: '',
      travel_time: 'Morning (06:00 AM - 11:00 AM)',
      car_id: '',
      car_name: '',
      passengers: 4,
      trip_type: 'one-way',
      message: '',
    },
  });

  const tripType = watch('trip_type');
  const selectedCarId = watch('car_id');

  // Handle prefilled data
  useEffect(() => {
    if (open && prefilledData) {
      if (prefilledData.pickup_location) setValue('pickup_location', prefilledData.pickup_location);
      if (prefilledData.destination) setValue('destination', prefilledData.destination);
      if (prefilledData.car_id) {
        setValue('car_id', prefilledData.car_id);
        const car = cars.find((c) => c.id === prefilledData.car_id);
        if (car) setValue('car_name', car.name);
      } else if (prefilledData.car_name) {
        const car = cars.find((c) => c.name.toLowerCase() === prefilledData.car_name?.toLowerCase());
        if (car) {
          setValue('car_id', car.id);
          setValue('car_name', car.name);
        }
      }
    }
  }, [open, prefilledData, cars, setValue]);

  // Reset success state on open
  useEffect(() => {
    if (open) {
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [open]);

  const onSubmit = async (data: InquiryFormSchemaType) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let carName = data.car_name;
      if (data.car_id) {
        const c = cars.find((item) => item.id === data.car_id);
        if (c) carName = c.name;
      }

      await DataStore.submitInquiry({
        ...data,
        car_name: carName,
      });

      setSubmitSuccess(true);
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl bg-white shadow-2xl transition-all duration-200 border border-slate-100 max-h-[92vh] max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 overflow-hidden">
          {/* Header */}
          <div className="bg-[#071A35] px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#F5B936] uppercase tracking-wider mb-1">
                <span>KOOBER SERVICES</span>
              </div>
              <DialogPrimitive.Title className="text-lg sm:text-xl font-extrabold tracking-tight">
                Plan Your Journey
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-slate-300">
                Fill details below for an instant chauffeur-driven ride quote.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0">
            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-[#071A35]">
                  Inquiry Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you! Our travel coordinator has received your journey details and will call you with a tailored itinerary and confirmation shortly.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="px-6 py-2.5 rounded-full bg-[#F5B936] text-[#071A35] text-xs font-bold hover:bg-[#E5A928] shadow-md transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Trip Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Trip Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setValue('trip_type', 'one-way')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        tripType === 'one-way'
                          ? 'bg-[#071A35] text-white border-[#071A35]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      One-way Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('trip_type', 'round-trip')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        tripType === 'round-trip'
                          ? 'bg-[#071A35] text-white border-[#071A35]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Round Trip
                    </button>
                  </div>
                </div>

                {/* Customer Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('customer_name')}
                      placeholder="e.g. Rahul Patel"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                    />
                    {errors.customer_name && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.customer_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Pickup & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Pickup Location *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('pickup_location')}
                        placeholder="e.g. Surat"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    {errors.pickup_location && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.pickup_location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Destination *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('destination')}
                        placeholder="e.g. Mumbai Airport"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    {errors.destination && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.destination.message}</p>
                    )}
                  </div>
                </div>

                {/* Travel Date & Preferred Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Travel Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        {...register('travel_date')}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    {errors.travel_date && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.travel_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <select
                        {...register('travel_time')}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                      >
                        <option value="Early Morning (04:00 AM - 07:00 AM)">Early Morning (04:00 AM - 07:00 AM)</option>
                        <option value="Morning (07:00 AM - 12:00 PM)">Morning (07:00 AM - 12:00 PM)</option>
                        <option value="Afternoon (12:00 PM - 05:00 PM)">Afternoon (12:00 PM - 05:00 PM)</option>
                        <option value="Evening (05:00 PM - 09:00 PM)">Evening (05:00 PM - 09:00 PM)</option>
                        <option value="Night (09:00 PM - 04:00 AM)">Night (09:00 PM - 04:00 AM)</option>
                      </select>
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Car Selection & Passengers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Preferred Vehicle
                    </label>
                    <div className="relative">
                      <select
                        {...register('car_id')}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                      >
                        <option value="">Any Available Vehicle</option>
                        {activeCars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.name} ({car.seating_capacity})
                          </option>
                        ))}
                      </select>
                      <CarIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#344054] mb-1">
                      Number of Passengers
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        {...register('passengers', { valueAsNumber: true })}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                      />
                      <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    {errors.passengers && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.passengers.message}</p>
                    )}
                  </div>
                </div>

                {/* Special Instructions Message */}
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    {...register('message')}
                    placeholder="e.g. Flight number, extra luggage space, child seat..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-full bg-[#F5B936] text-[#071A35] text-xs sm:text-sm font-extrabold hover:bg-[#E5A928] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Booking Request</span>
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    No advance payment required now. Our team confirms exact fare and driver details.
                  </p>
                </div>
              </form>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

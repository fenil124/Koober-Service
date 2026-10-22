'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, CheckCircle2, AlertCircle, Calendar, Clock, MapPin, Users, Car as CarIcon } from 'lucide-react';
import { inquiryFormSchema, InquiryFormSchemaType } from '@/lib/validations';
import { Car, InquiryFormInput } from '@/types';
import { DataStore } from '@/lib/data-store';

interface InquirySectionProps {
  cars: Car[];
  prefilledData?: Partial<InquiryFormInput>;
  onSuccess?: () => void;
}

export function InquirySection({ cars, prefilledData, onSuccess }: InquirySectionProps) {
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
      travel_time: 'Morning',
      car_id: '',
      car_name: '',
      passengers: 1,
      trip_type: 'one-way',
      message: '',
    },
  });

  const selectedCarId = watch('car_id');

  // Handle prefilled data changes
  useEffect(() => {
    if (prefilledData) {
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
  }, [prefilledData, cars, setValue]);

  const onSubmit = async (data: InquiryFormSchemaType) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Find selected car name
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
    <section id="inquiry" className="py-16 sm:py-20 bg-white border-b border-[#E4E7EC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E8AD36] uppercase tracking-wider mb-2">
            <span className="w-5 h-0.5 bg-[#E8AD36]" />
            BOOKING INQUIRY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B50] tracking-tight">
            Get a Free Trip Quote
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#667085] max-w-lg mx-auto">
            Submit your itinerary details and our team will get back to you with custom pricing and vehicle availability.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#F7F9FC] rounded-3xl p-6 sm:p-10 border border-[#E4E7EC] shadow-md">
          {submitSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#082B50]">
                Inquiry Received Successfully!
              </h3>
              <p className="text-sm text-[#475467] max-w-md mx-auto">
                Your inquiry has been submitted successfully. Our team will contact you shortly to discuss availability and confirm your booking.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#082B50] text-white text-xs font-bold hover:bg-[#071A2D] transition-colors"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Trip Type Selector */}
              <div className="flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D0D5DD] text-xs font-semibold cursor-pointer has-checked:border-[#082B50] has-checked:bg-[#082B50]/5">
                  <input
                    type="radio"
                    value="one-way"
                    {...register('trip_type')}
                    className="text-[#082B50] focus:ring-0"
                  />
                  <span>One-Way Trip</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D0D5DD] text-xs font-semibold cursor-pointer has-checked:border-[#082B50] has-checked:bg-[#082B50]/5">
                  <input
                    type="radio"
                    value="round-trip"
                    {...register('trip_type')}
                    className="text-[#082B50] focus:ring-0"
                  />
                  <span>Round Trip</span>
                </label>
              </div>

              {/* Grid: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Patel"
                    {...register('customer_name')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors ${
                      errors.customer_name ? 'border-red-400' : 'border-[#D0D5DD]'
                    }`}
                  />
                  {errors.customer_name && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.customer_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    {...register('phone')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors ${
                      errors.phone ? 'border-red-400' : 'border-[#D0D5DD]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Grid: Pickup & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#344054] mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#082B50]" />
                    <span>Pickup Location *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Surat"
                    {...register('pickup_location')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors ${
                      errors.pickup_location ? 'border-red-400' : 'border-[#D0D5DD]'
                    }`}
                  />
                  {errors.pickup_location && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.pickup_location.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#344054] mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E8AD36]" />
                    <span>Destination City / Spot *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai Airport"
                    {...register('destination')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors ${
                      errors.destination ? 'border-red-400' : 'border-[#D0D5DD]'
                    }`}
                  />
                  {errors.destination && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.destination.message}</p>
                  )}
                </div>
              </div>

              {/* Grid: Date, Time, Passengers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#344054] mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#082B50]" />
                    <span>Travel Date *</span>
                  </label>
                  <input
                    type="date"
                    {...register('travel_date')}
                    className={`w-full px-3 py-2.5 rounded-xl bg-white border text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors ${
                      errors.travel_date ? 'border-red-400' : 'border-[#D0D5DD]'
                    }`}
                  />
                  {errors.travel_date && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.travel_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#344054] mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#082B50]" />
                    <span>Pickup Time</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 06:00 AM"
                    {...register('travel_time')}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D0D5DD] text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#344054] mb-1.5">
                    <Users className="w-3.5 h-3.5 text-[#082B50]" />
                    <span>Passengers *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    {...register('passengers', { valueAsNumber: true })}
                    className={`w-full px-3 py-2.5 rounded-xl bg-white border text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors ${
                      errors.passengers ? 'border-red-400' : 'border-[#D0D5DD]'
                    }`}
                  />
                  {errors.passengers && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.passengers.message}</p>
                  )}
                </div>
              </div>

              {/* Vehicle Preference */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#344054] mb-1.5">
                  <CarIcon className="w-3.5 h-3.5 text-[#082B50]" />
                  <span>Preferred Car</span>
                </label>
                <select
                  {...register('car_id')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D0D5DD] text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors"
                >
                  <option value="">Any comfortable vehicle</option>
                  {activeCars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.car_type} • {c.seating_capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Special message or notes */}
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Special Requirements / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need baby seat, multiple luggage, flight number details..."
                  {...register('message')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D0D5DD] text-sm text-[#101828] focus:outline-hidden focus:border-[#082B50] transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#082B50] text-white text-sm font-bold shadow-lg hover:bg-[#071A2D] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Submitting Inquiry...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

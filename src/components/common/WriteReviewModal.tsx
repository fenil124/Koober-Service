'use client';

import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Star, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { DataStore } from '@/lib/data-store';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WriteReviewModal({
  open,
  onOpenChange,
  onSuccess,
}: WriteReviewModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setErrorMsg('Please share a few sentences about your travel experience (minimum 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // New reviews default to pending moderation (is_published: false)
      await DataStore.saveReview({
        customer_name: customerName.trim(),
        rating,
        review_text: reviewText.trim(),
        is_published: false,
        is_demo: false,
      });

      setSubmitSuccess(true);
      setCustomerName('');
      setReviewText('');
      setRating(5);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setSubmitSuccess(false);
      setErrorMsg(null);
    }
    onOpenChange(val);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl bg-white shadow-2xl transition-all duration-200 border border-slate-100 flex flex-col max-h-[92vh] max-h-[92dvh] animate-in fade-in zoom-in-95 overflow-hidden">
          {/* Header */}
          <div className="bg-[#071A35] px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#F5B936] uppercase tracking-wider mb-1">
                <span>KOOBER SERVICES</span>
              </div>
              <DialogPrimitive.Title className="text-lg sm:text-xl font-extrabold tracking-tight">
                Share Your Experience
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-slate-300">
                Help other travellers by leaving honest feedback.
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
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-[#071A35]">
                  Thank You for Your Review!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your feedback has been submitted successfully and will appear publicly on our website following standard administrative verification.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="px-6 py-2 rounded-full bg-[#071A35] text-white text-xs font-bold hover:bg-[#0E3A68] transition-colors cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Rating *
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-md text-[#F5B936] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        aria-label={`${star} Stars`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || rating) >= star
                              ? 'fill-[#F5B936] text-[#F5B936]'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#071A35]">
                      {hoverRating || rating} out of 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How was your chauffeur, car comfort, and journey?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#071A35] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-full bg-[#F5B936] text-[#071A35] text-xs font-extrabold hover:bg-[#E5A928] shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    All reviews are moderated by Koober Services before public display.
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

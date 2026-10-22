'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from '@/components/common/Image';
import { Star, Plus, Edit, Trash2, X, Check, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Review } from '@/types';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ImageManager } from '@/components/admin/ImageManager';
import { ResponsiveModal } from '@/components/common/ResponsiveModal';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingReviewId, setLoadingReviewId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formPublicId, setFormPublicId] = useState<string | null>(null);
  const [formPublished, setFormPublished] = useState(true);

  const loadReviews = useCallback(async () => {
    const data = await DataStore.getReviews();
    setReviews(data);
  }, []);

  useEffect(() => {
    loadReviews();

    const unsubscribe = DataStore.subscribe(() => {
      loadReviews();
    });

    return () => {
      unsubscribe();
    };
  }, [loadReviews]);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormName('');
    setFormRating(5);
    setFormText('');
    setFormAvatarUrl('');
    setFormPublicId(null);
    setFormPublished(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rev: Review) => {
    setEditingReview(rev);
    setFormName(rev.customer_name);
    setFormRating(rev.rating);
    setFormText(rev.review_text);
    setFormAvatarUrl(rev.avatar_url || '');
    setFormPublicId(rev.cloudinary_public_id || null);
    setFormPublished(rev.is_published);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Direct Approve / Unpublish toggle without opening the edit form
  const handleToggleApprove = async (rev: Review) => {
    if (loadingReviewId) return;
    setLoadingReviewId(rev.id);

    const newPublishedState = !rev.is_published;
    try {
      await DataStore.saveReview({
        id: rev.id,
        is_published: newPublishedState,
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === rev.id ? { ...r, is_published: newPublishedState } : r))
      );
      toast.success(
        newPublishedState
          ? `Review from ${rev.customer_name} approved and published`
          : `Review from ${rev.customer_name} unpublished to pending`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update review status');
    } finally {
      setLoadingReviewId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      setErrorMessage('Customer name and review text are required');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await DataStore.saveReview({
        id: editingReview ? editingReview.id : undefined,
        customer_name: formName.trim(),
        rating: Number(formRating),
        review_text: formText.trim(),
        avatar_url: formAvatarUrl.trim() || null,
        cloudinary_public_id: formPublicId,
        is_published: formPublished,
      });

      toast.success(editingReview ? 'Review updated' : 'Review recorded');
      setIsModalOpen(false);
      loadReviews();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save review.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await DataStore.deleteReview(deleteTarget.id);
      toast.success(`Review from ${deleteTarget.customer_name} deleted`);
      setDeleteTarget(null);
      loadReviews();
    } catch (err: any) {
      console.error('Delete review error:', err);
      toast.error(err?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const allCount = reviews.length;
  const pendingCount = reviews.filter((r) => !r.is_published).length;
  const approvedCount = reviews.filter((r) => r.is_published).length;

  const filtered = reviews.filter((r) => {
    if (activeTab === 'pending') return !r.is_published;
    if (activeTab === 'approved') return r.is_published;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Reviews Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Moderate customer feedback, approve stories for the homepage ticker, and manage ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors self-start sm:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-xl self-start shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#0B2C50] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B2C50]'
          }`}
        >
          All ({allCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B2C50]'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B2C50]'
          }`}
        >
          Pending Moderation ({pendingCount})
        </button>
      </div>

      {/* Grid of Reviews */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] text-xs text-[#64748B]">
          No customer reviews matching this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header: Customer Initial, Name, and Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#0B2C50] text-[#F5B936] font-black text-sm flex items-center justify-center shrink-0 border border-slate-200">
                      {rev.avatar_url ? (
                        <Image
                          src={rev.avatar_url}
                          alt={rev.customer_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        rev.customer_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#14243A]">
                        {rev.customer_name}
                      </h3>
                      {/* Accessible Star Rating */}
                      <div
                        className="flex items-center gap-0.5 mt-0.5"
                        aria-label={`Rating: ${rev.rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-[#F5B936] text-[#F5B936]'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      rev.is_published
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {rev.is_published ? 'Published' : 'Pending'}
                  </span>
                </div>

                {/* Review Quote Text */}
                <p className="text-xs text-[#64748B] leading-relaxed italic line-clamp-4 mb-4">
                  &ldquo;{rev.review_text}&rdquo;
                </p>
              </div>

              {/* Action Buttons: Direct Approve / Unpublish + Edit + Delete */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleApprove(rev)}
                  disabled={loadingReviewId === rev.id}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    rev.is_published
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {loadingReviewId === rev.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : rev.is_published ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>{rev.is_published ? 'Unpublish' : 'Approve'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(rev)}
                  className="p-1.5 rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-[#0B2C50] hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Edit Review Content"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(rev)}
                  className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Responsive Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingReview ? 'Edit Review' : 'Add Customer Review'}
        description="Manage customer testimonials, rating, review message, and avatar photo"
        maxWidth="lg"
        isSubmitting={isSaving}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Review'}</span>
            </button>
          </div>
        }
      >
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form id="review-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Rohit Patel"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Star Rating (1 to 5)
              </label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14243A] mb-1">
              Review Text *
            </label>
            <textarea
              rows={3}
              required
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="Customer feedback on driver, car cleanliness, punctuality..."
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] resize-none"
            />
          </div>

          {/* Universal ImageManager for Avatar */}
          <ImageManager
            label="Customer Avatar Photo"
            description="Optional customer photo. If left empty, customer initial is displayed."
            value={formAvatarUrl}
            onChange={(newUrl: string, publicId?: string) => {
              setFormAvatarUrl(newUrl);
              if (publicId) setFormPublicId(publicId);
            }}
            folder="reviews"
            aspectRatio="square"
            recommendedSize="Recommended: 400 × 400 px (Square avatar)"
          />

          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#14243A] block">
                Approved for Public Website
              </span>
              <span className="text-[11px] text-[#64748B]">
                Show in homepage continuous marquee ticker
              </span>
            </div>
            <input
              type="checkbox"
              checked={formPublished}
              onChange={(e) => setFormPublished(e.target.checked)}
              className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
            />
          </div>
        </form>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete customer review?"
        itemName={deleteTarget ? deleteTarget.customer_name : undefined}
        description="This review will be permanently removed from moderation records and the website."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

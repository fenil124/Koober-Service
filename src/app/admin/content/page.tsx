'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from '@/components/common/Image';
import { Edit, Save, CheckCircle2, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { HomepageSection } from '@/types';
import { ImageManager } from '@/components/admin/ImageManager';
import { ResponsiveModal } from '@/components/common/ResponsiveModal';

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, HomepageSection>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPublicId, setFormPublicId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    const data = await DataStore.getHomepageContent();
    setContent(data);
  }, []);

  useEffect(() => {
    loadContent();
    const unsubscribe = DataStore.subscribe(() => {
      loadContent();
    });
    return () => {
      unsubscribe();
    };
  }, [loadContent]);

  const handleOpenEdit = (key: string) => {
    const section = content[key];
    setEditingKey(key);
    setFormTitle(section?.title || '');
    setFormSubtitle(section?.subtitle || '');
    setFormBadge(section?.badge || '');
    setFormBody(section?.body || '');
    setFormImageUrl(section?.image_url || '');
    setFormPublicId(section?.cloudinary_public_id || null);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey || isSaving) return;

    setIsSaving(true);
    setFormError(null);
    try {
      await DataStore.saveHomepageContent(editingKey, {
        title: formTitle,
        subtitle: formSubtitle,
        badge: formBadge,
        body: formBody,
        image_url: formImageUrl || null,
        cloudinary_public_id: formPublicId,
      });

      toast.success(`${editingKey.toUpperCase()} section updated and saved successfully!`);
      setEditingKey(null);
      await loadContent();
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to save section content';
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const sectionsList = [
    {
      key: 'hero',
      name: 'Hero Section',
      desc: 'Update headline, subtitle, badge and background image',
      thumbnail: content['hero']?.image_url || '/images/hero-bg.jpg',
    },
    {
      key: 'features',
      name: 'Features Section',
      desc: 'Update agency guarantees and promise highlights',
      thumbnail: null,
    },
    {
      key: 'about',
      name: 'About Section',
      desc: 'Update company bio, standards, and safety description',
      thumbnail: content['about']?.image_url || '/images/airport-transfer.jpg',
    },
    {
      key: 'contact',
      name: 'Contact Information & Callout',
      desc: 'Update customer callout headlines and service hours',
      thumbnail: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header matching panel 9 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B50] tracking-tight">
          Home Page Content
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Manage your website copywriting, slogans, and featured sections dynamically.
        </p>
      </div>

      {/* Sections List matching panel 9 */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] divide-y divide-[#E4E7EC] overflow-hidden shadow-2xs">
        {sectionsList.map((sec) => {
          const item = content[sec.key];
          return (
            <div key={sec.key} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                {sec.thumbnail && (
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <Image
                      src={sec.thumbnail}
                      alt={sec.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#082B50]">{sec.name}</h3>
                  <p className="text-xs text-[#667085] mt-0.5">{sec.desc}</p>
                  {item?.title && (
                    <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-md">
                      Current: &ldquo;{item.title}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(sec.key)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-[#082B50] hover:text-[#082B50] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Content Modal */}
      <ResponsiveModal
        isOpen={Boolean(editingKey)}
        onClose={() => !isSaving && setEditingKey(null)}
        title={editingKey ? `Edit ${editingKey.toUpperCase()} Content` : ''}
        description="Update copywriting, headlines, badges, and media for this section."
        maxWidth="lg"
        isSubmitting={isSaving}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setEditingKey(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="content-edit-form"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#082B50] text-white text-xs font-bold hover:bg-[#071A2D] cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-xs"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Content'}</span>
            </button>
          </div>
        }
      >
        <form id="content-edit-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1">
              Tag / Badge (Uppercase)
            </label>
            <input
              type="text"
              value={formBadge}
              onChange={(e) => setFormBadge(e.target.value)}
              placeholder="e.g. PREMIUM CHAUFFEUR DRIVEN CAR RENTAL"
              className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1">
              Main Headline / Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Comfortable Rides for Every Journey"
              className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="e.g. Airport Transfers, Outstation Trips, City Travel and More"
              className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1">
              Body Description
            </label>
            <textarea
              rows={3}
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="Extended description or details"
              className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
            />
          </div>

          {editingKey === 'hero' && (
            <ImageManager
              label="Hero Background Image"
              description="Atmospheric landscape or roadway background banner displayed behind the hero vehicle showcase."
              value={formImageUrl}
              onChange={(newUrl: string, publicId?: string) => {
                setFormImageUrl(newUrl);
                if (publicId) setFormPublicId(publicId);
              }}
              folder="content"
              aspectRatio="video"
              recommendedSize="Recommended: 1920 × 1080 px (Dark or high-contrast landscape)"
            />
          )}

          {editingKey === 'about' && (
            <ImageManager
              label="About Feature Photo"
              description="High-resolution image showing chauffeur hospitality, airport transfers, or luxury fleet comfort."
              value={formImageUrl}
              onChange={(newUrl: string, publicId?: string) => {
                setFormImageUrl(newUrl);
                if (publicId) setFormPublicId(publicId);
              }}
              folder="content"
              aspectRatio="video"
              recommendedSize="Recommended: 1200 × 900 px (Landscape orientation)"
            />
          )}
        </form>
      </ResponsiveModal>
    </div>
  );
}

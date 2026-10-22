'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Image as ImageIcon, ExternalLink, Check } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { DataStore } from '@/lib/data-store';
import { SiteSettings } from '@/types';
import { toast } from 'sonner';
import { ImageManager } from '@/components/admin/ImageManager';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'seo'>('general');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [agencyName, setAgencyName] = useState('Koober Services');
  const [tagline, setTagline] = useState('Comfortable Rides for Every Journey');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPublicId, setLogoPublicId] = useState<string | null>(null);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [whatsapp, setWhatsapp] = useState('+91 98765 43210');
  const [email, setEmail] = useState('contact@kooberservices.com');
  const [address, setAddress] = useState('Ring Road, Surat, Gujarat 395002');
  const [ctaText, setCtaText] = useState('Book Your Ride');
  const [facebook, setFacebook] = useState('https://facebook.com');
  const [instagram, setInstagram] = useState('https://instagram.com');
  const [youtube, setYoutube] = useState('https://youtube.com');

  useEffect(() => {
    async function load() {
      const data = await DataStore.getSettings();
      setAgencyName(data.agency_name || 'Koober Services');
      setTagline(data.tagline || 'Comfortable Rides for Every Journey');
      setLogoUrl(data.logo_url || '');
      setLogoPublicId(data.cloudinary_public_id || null);
      setPhone(data.phone || '+91 98765 43210');
      setWhatsapp(data.whatsapp || '+91 98765 43210');
      setEmail(data.email || 'contact@kooberservices.com');
      setAddress(data.address || 'Ring Road, Surat, Gujarat 395002');
      setCtaText(data.cta_text || 'Book Your Ride');
      setFacebook(data.facebook_url || '');
      setInstagram(data.instagram_url || '');
      setYoutube(data.youtube_url || '');
    }
    load();
    const unsubscribe = DataStore.subscribe(() => {
      load();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await DataStore.saveSettings({
        agency_name: agencyName,
        tagline,
        logo_url: logoUrl || null,
        cloudinary_public_id: logoPublicId,
        phone,
        whatsapp,
        email,
        address,
        cta_text: ctaText,
        facebook_url: facebook,
        instagram_url: instagram,
        youtube_url: youtube,
      });

      setIsSaving(false);
      setIsSaved(true);
      toast.success('Settings saved successfully');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: unknown) {
      setIsSaving(false);
      toast.error('Failed to save settings: ' + (err instanceof Error ? err.message : String(err)));
    }
  };


  return (
    <div className="space-y-6">
      {/* Header matching panel 10 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B50] tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Manage your business information, contact phone lines, and branding.
        </p>
      </div>

      {/* Tabs matching panel 10 */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC]">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'general'
              ? 'border-[#082B50] text-[#082B50]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'contact'
              ? 'border-[#082B50] text-[#082B50]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          Contact Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'social'
              ? 'border-[#082B50] text-[#082B50]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          Social Media
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'seo'
              ? 'border-[#082B50] text-[#082B50]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          SEO
        </button>
      </div>

      {/* Settings Form matching panel 10 */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 sm:p-8 shadow-2xs max-w-3xl">
        {isSaved && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {activeTab === 'general' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Agency Name
                </label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Website Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Call-to-Action (CTA) Button Text
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              {/* Universal ImageManager for Brand Logo */}
              <ImageManager
                label="Agency Brand Logo"
                description="Upload brand logo (PNG with transparent background or SVG recommended) or paste URL."
                value={logoUrl}
                onChange={(newUrl: string, publicId?: string) => {
                  setLogoUrl(newUrl);
                  if (publicId) setLogoPublicId(publicId);
                }}
                folder="branding"
                aspectRatio="wide"
                recommendedSize="Recommended: 400 × 120 px (Transparent PNG/SVG)"
              />
            </>
          )}

          {activeTab === 'contact' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Direct Phone Number (Click to Call)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@kooberservices.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ring Road, Surat, Gujarat 395002"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>
            </>
          )}

          {activeTab === 'social' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Default Meta Title
                </label>
                <input
                  type="text"
                  defaultValue="Koober Services - Premium Chauffeur Driven Car Rental"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  defaultValue="Hire premium chauffeur driven cars from Surat to Mumbai Airport, Pune, Ahmedabad. Well maintained Innova, Ertiga, Swift Dzire, and Urbania Traveller."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#082B50] text-white text-xs font-bold hover:bg-[#071A2D] transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

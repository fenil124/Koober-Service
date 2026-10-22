'use client';

import { useState, useRef, useCallback } from 'react';
import Image from '@/components/common/Image';
import { Upload, Link2, Loader2, CheckCircle2, AlertCircle, Trash2, ArrowDownToLine, Globe, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';

export interface ImageManagerProps {
  label: string;
  description?: string;
  value?: string | null;
  onChange: (newUrl: string, publicId?: string) => void;
  folder?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  recommendedSize?: string;
  required?: boolean;
  className?: string;
}

export function ImageManager({
  label,
  description,
  value,
  onChange,
  folder = 'general',
  aspectRatio = 'video',
  recommendedSize = 'Recommended: 1200 × 800 px (Landscape)',
  required = false,
  className = '',
}: ImageManagerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aspect ratio class mapping
  const ratioClasses = {
    video: 'aspect-[16/9]',
    wide: 'aspect-[16/10]',
    square: 'aspect-square max-w-[200px]',
    auto: 'min-h-[160px]',
  }[aspectRatio] || 'aspect-[16/9]';

  // File Upload Handler
  const handleFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        const err = 'Please upload a valid image file (JPG, PNG, WebP, or SVG).';
        setErrorMessage(err);
        toast.error(err);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        const err = 'Image size exceeds the 10 MB limit.';
        setErrorMessage(err);
        toast.error(err);
        return;
      }

      setIsUploading(true);
      try {
        const asset = await DataStore.uploadAsset(file, folder);
        onChange(asset.secure_url, asset.public_id);
        toast.success('Image uploaded successfully!');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Image upload failed';
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onChange, folder]
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // URL Handlers
  const handleImportToCloudinary = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an image URL');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMessage('Image URL must start with http:// or https://');
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    try {
      const asset = await DataStore.importAssetFromUrl(trimmed, folder);
      onChange(asset.secure_url, asset.public_id);
      setUrlInput('');
      toast.success('Image imported and saved successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import image from URL';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    const trimmed = val.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      onChange(trimmed);
      setErrorMessage(null);
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted.startsWith('http://') || pasted.startsWith('https://')) {
      onChange(pasted);
      setErrorMessage(null);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = urlInput.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        onChange(trimmed);
        setErrorMessage(null);
        toast.success('Image URL applied');
      }
    }
  };

  const handleUseExternalUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an image URL');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMessage('Image URL must start with http:// or https://');
      return;
    }

    onChange(trimmed);
    setUrlInput('');
    setErrorMessage(null);
    toast.success('External image URL applied');
  };

  const handleRemove = () => {
    onChange('');
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label & Instructions */}
      <div>
        <label className="block text-xs font-bold text-[#14243A]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-[11px] text-[#64748B] mt-0.5">{description}</p>
        )}
      </div>

      {/* Preview Area */}
      {value && value.trim() !== '' ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-50 shadow-2xs group">
          <div className={`relative w-full ${ratioClasses} bg-slate-100 flex items-center justify-center overflow-hidden`}>
            <Image
              src={value}
              alt={label}
              fill
              className="object-contain sm:object-cover transition-transform duration-300 group-hover:scale-102"
              sizes="(max-width: 768px) 100vw, 500px"
            />
            {/* Dark gradient for controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Quick Remove Button */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleRemove}
                title="Remove Image"
                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Info Bar inside preview */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 px-2 py-1 bg-black/40 backdrop-blur-xs rounded-lg truncate">
              <span className="truncate max-w-[280px]" title={value}>
                {value}
              </span>
              {value.startsWith('http') && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 hover:text-[#F5B936] shrink-0 ml-2"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span>View</span>
                </a>
              )}
            </div>
          </div>

          {/* Image status footer */}
          <div className="p-2.5 bg-white border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Image Ready</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {recommendedSize}
            </span>
          </div>
        </div>
      ) : (
        /* Empty State Placeholder */
        <div className={`rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-slate-50 flex flex-col items-center justify-center p-6 text-center ${ratioClasses}`}>
          <div className="w-12 h-12 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-400 mb-2">
            <Upload className="w-5 h-5 text-[#0B2C50]" />
          </div>
          <span className="text-xs font-bold text-[#14243A]">No image selected</span>
          <span className="text-[11px] text-[#64748B] mt-0.5">{recommendedSize}</span>
        </div>
      )}

      {/* Tabs for Upload File vs Image URL */}
      <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-[#E2E8F0] space-y-3">
        <div className="flex rounded-xl bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-[#0B2C50] shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-[#0B2C50] shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Upload File Panel */}
        {activeTab === 'upload' && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed transition-all p-4 text-center ${
              isDragging
                ? 'border-[#0B2C50] bg-blue-50/50'
                : 'border-[#CBD5E1] bg-white hover:border-[#0B2C50]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={onFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading image...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File from Computer</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-[#64748B]">
                or drag & drop your image here (max 10MB; JPG, PNG, WebP, SVG)
              </span>
            </div>
          </div>
        )}

        {/* Image URL Panel */}
        {activeTab === 'url' && (
          <div className="space-y-2.5">
            <div>
              <input
                type="url"
                value={urlInput}
                onChange={handleUrlInputChange}
                onPaste={handleUrlPaste}
                onKeyDown={handleUrlKeyDown}
                onBlur={() => {
                  const trimmed = urlInput.trim();
                  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                    onChange(trimmed);
                  }
                }}
                placeholder="https://images.unsplash.com/... or external image URL"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                disabled={isImporting || !urlInput.trim()}
                onClick={handleImportToCloudinary}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing image...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Import & Save to Cloud (Recommended)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isImporting || !urlInput.trim()}
                onClick={handleUseExternalUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Use External URL</span>
              </button>
            </div>
            <p className="text-[10px] text-[#64748B]">
              &bull; <strong>Import & Save:</strong> Safely stores the image in high-speed cloud storage so it won&apos;t break if the external link goes offline.
            </p>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageManager;

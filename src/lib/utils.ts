import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return 'Get a Quote';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getWhatsAppUrl(
  phone: string | undefined,
  message?: string
): string {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(
    message || 'Hello Koober Services, I would like to inquire about booking a chauffeur-driven car.'
  );
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export function getTelUrl(phone: string | undefined): string {
  if (!phone) return '#';
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}

export function getIndiaDateStrings() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayStr = formatter.format(now); // "YYYY-MM-DD"
  
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = formatter.format(tomorrow);

  return { todayStr, tomorrowStr };
}

export function isShortNoticeDate(dateString?: string | null): boolean {
  if (!dateString) return false;
  const cleanDate = dateString.trim().split('T')[0];
  const { todayStr, tomorrowStr } = getIndiaDateStrings();
  return cleanDate === todayStr || cleanDate === tomorrowStr;
}

export {
  isCloudinaryUrl,
  getOptimizedCloudinaryUrl,
  getCloudinarySrcSet,
  DEFAULT_CLOUDINARY_WIDTHS,
  type CloudinaryOptimizationOptions,
} from './cloudinary';


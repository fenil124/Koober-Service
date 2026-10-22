/**
 * Cloudinary Frontend Image Optimization Utilities
 *
 * Provides automatic, on-the-fly URL transformation for Cloudinary assets:
 * - Dynamic format negotiation (f_auto: AVIF/WebP based on browser support)
 * - Intelligent perceptual compression (q_auto)
 * - Responsive sizing & dimensions (w_..., c_limit/c_fill)
 * - Responsive srcSet generation for retina and multi-device viewports
 */

export interface CloudinaryOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'limit' | 'fill' | 'scale' | 'fit' | 'thumb' | 'auto' | 'pad';
  dpr?: number | 'auto';
  gravity?: 'auto' | 'center' | 'face' | 'north' | 'south' | 'east' | 'west';
  rawTransformations?: string;
}

const CLOUDINARY_HOST_PATTERN = /(?:res\.cloudinary\.com|cloudinary\.com)/i;
const CLOUDINARY_UPLOAD_REGEX = /^(https?:)?(\/\/[^/]+\/[^/]+\/(?:image|video)\/upload\/)(.*)$/i;

/**
 * Checks whether a given URL is a Cloudinary-hosted asset.
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return CLOUDINARY_HOST_PATTERN.test(url) && url.includes('/upload/');
}

/**
 * Checks if the URL references a vector SVG asset.
 */
function isSvgUrl(url: string): boolean {
  return /\.svg(\?.*)?$/i.test(url);
}

/**
 * Converts a raw or original Cloudinary image URL into an optimized Cloudinary delivery URL.
 * Automatically injects `f_auto,q_auto` (format auto & smart quality) and dimension constraints.
 * If the URL is not from Cloudinary, it is returned untouched.
 */
export function getOptimizedCloudinaryUrl(
  url?: string | null,
  options: CloudinaryOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';
  if (!isCloudinaryUrl(url)) return url;

  // Don't modify SVGs with format/quality transformations (preserves sharp vectors)
  if (isSvgUrl(url)) {
    return url;
  }

  const match = url.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) return url;

  const protocol = match[1] || 'https:';
  const uploadPrefix = match[2];
  let tail = match[3];

  // Build transformation segments
  const transforms: string[] = [];

  // Format negotiation: default f_auto (AVIF/WebP) unless custom format requested
  const format = options.format || 'auto';
  if (format) {
    transforms.push(`f_${format}`);
  }

  // Quality: default q_auto (intelligent compression)
  const quality = options.quality ?? 'auto';
  if (quality) {
    transforms.push(`q_${quality}`);
  }

  // Width & Crop
  if (options.width && options.width > 0) {
    transforms.push(`w_${Math.round(options.width)}`);
    const crop = options.crop || 'limit';
    transforms.push(`c_${crop}`);
  } else if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }

  // Height
  if (options.height && options.height > 0) {
    transforms.push(`h_${Math.round(options.height)}`);
    if (!options.width && !options.crop) {
      transforms.push('c_limit');
    }
  }

  // DPR (Device Pixel Ratio)
  if (options.dpr) {
    transforms.push(`dpr_${options.dpr}`);
  }

  // Gravity
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  }

  // Raw transformations append if provided
  if (options.rawTransformations) {
    transforms.push(options.rawTransformations);
  }

  // Inspect existing transformations in the URL if present
  // A version segment matches `v\d+/`
  const versionMatch = tail.match(/(^|\/)(v\d+)\//);

  if (versionMatch && versionMatch.index !== undefined) {
    const vIndex = versionMatch.index + (versionMatch[1] ? versionMatch[1].length : 0);
    const existingTransforms = tail.substring(0, vIndex).replace(/\/$/, '').trim();
    const afterVersion = tail.substring(vIndex);

    if (existingTransforms) {
      // Split existing tokens to avoid duplicates
      const existingTokens = existingTransforms
        .split('/')
        .flatMap((seg) => seg.split(','))
        .map((t) => t.trim())
        .filter(Boolean);

      // Merge: override existing f_, q_, w_, h_ if newly provided
      const filteredExisting = existingTokens.filter((token) => {
        if (format && token.startsWith('f_')) return false;
        if (quality && token.startsWith('q_')) return false;
        if (options.width && (token.startsWith('w_') || token.startsWith('c_'))) return false;
        if (options.height && (token.startsWith('h_') || token.startsWith('c_'))) return false;
        if (options.dpr && token.startsWith('dpr_')) return false;
        return true;
      });

      const mergedTransforms = [...transforms, ...filteredExisting];
      const transformSegment = mergedTransforms.join(',');
      return `${protocol}${uploadPrefix}${transformSegment}/${afterVersion}`;
    } else {
      // No existing transformation segment, tail starts right with v123...
      const transformSegment = transforms.join(',');
      return `${protocol}${uploadPrefix}${transformSegment}/${afterVersion}`;
    }
  }

  // If no version segment is found (e.g., /upload/royalrides/car.jpg)
  // Check if first segment looks like existing transformation
  const firstSlash = tail.indexOf('/');
  if (firstSlash !== -1) {
    const firstSegment = tail.substring(0, firstSlash);
    const isTransformSegment = /(?:[w|h|q|f|c|dpr|g]_[a-z0-9]+|[\w]+,[\w]+)/i.test(firstSegment);

    if (isTransformSegment) {
      const remainder = tail.substring(firstSlash + 1);
      const transformSegment = transforms.join(',');
      return `${protocol}${uploadPrefix}${transformSegment}/${remainder}`;
    }
  }

  // Prepend transformations before public ID
  const transformSegment = transforms.join(',');
  return `${protocol}${uploadPrefix}${transformSegment}/${tail}`;
}

/**
 * Standard responsive width breakpoints for web delivery.
 */
export const DEFAULT_CLOUDINARY_WIDTHS = [360, 480, 640, 768, 1024, 1280, 1600, 1920];

/**
 * Generates an HTML `srcset` attribute string for Cloudinary URLs with multiple width descriptors.
 * Enables the browser to choose the most efficient image file for the current display resolution and DPR.
 */
export function getCloudinarySrcSet(
  url?: string | null,
  widths: number[] = DEFAULT_CLOUDINARY_WIDTHS,
  options: Omit<CloudinaryOptimizationOptions, 'width'> = {}
): string {
  if (!url || !isCloudinaryUrl(url) || isSvgUrl(url)) return '';

  return widths
    .map((w) => {
      const optimized = getOptimizedCloudinaryUrl(url, {
        ...options,
        width: w,
        crop: options.crop || 'limit',
      });
      return `${optimized} ${w}w`;
    })
    .join(', ');
}

import React, { useMemo } from 'react';
import {
  isCloudinaryUrl,
  getOptimizedCloudinaryUrl,
  getCloudinarySrcSet,
  DEFAULT_CLOUDINARY_WIDTHS,
} from '@/lib/cloudinary';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  quality?: number;
  crop?: 'limit' | 'fill' | 'scale' | 'fit' | 'thumb' | 'auto';
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    fill,
    priority,
    sizes,
    unoptimized,
    quality,
    crop,
    className,
    style,
    loading,
    width,
    height,
    srcSet,
    decoding = 'async',
    ...rest
  },
  ref
) {
  const computedStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: 0,
        ...style,
      }
    : { ...style };

  // Resolve Cloudinary optimization
  const { resolvedSrc, resolvedSrcSet, resolvedSizes } = useMemo(() => {
    // If caller explicitly flags unoptimized or image is not on Cloudinary, pass through
    if (unoptimized || !isCloudinaryUrl(src)) {
      return {
        resolvedSrc: src,
        resolvedSrcSet: srcSet,
        resolvedSizes: sizes,
      };
    }

    const numericWidth = typeof width === 'number' ? width : width ? parseInt(String(width), 10) : undefined;
    const numericHeight = typeof height === 'number' ? height : height ? parseInt(String(height), 10) : undefined;

    // Fixed dimensions specified
    if (numericWidth && !isNaN(numericWidth)) {
      return {
        resolvedSrc: getOptimizedCloudinaryUrl(src, {
          width: numericWidth,
          height: numericHeight && !isNaN(numericHeight) ? numericHeight : undefined,
          quality,
          crop: crop || 'limit',
        }),
        resolvedSrcSet: srcSet,
        resolvedSizes: sizes,
      };
    }

    // Responsive / fill layout or sizes given: auto-generate responsive srcSet
    if (fill || sizes) {
      const generatedSrcSet = srcSet || getCloudinarySrcSet(src, DEFAULT_CLOUDINARY_WIDTHS, {
        quality,
        crop: crop || 'limit',
      });

      return {
        resolvedSrc: getOptimizedCloudinaryUrl(src, {
          width: 1200,
          quality,
          crop: crop || 'limit',
        }),
        resolvedSrcSet: generatedSrcSet,
        resolvedSizes: sizes || (fill ? '100vw' : undefined),
      };
    }

    // General Cloudinary image without explicit dimensions: apply format + smart compression
    return {
      resolvedSrc: getOptimizedCloudinaryUrl(src, {
        quality,
        crop: crop || 'limit',
      }),
      resolvedSrcSet: srcSet,
      resolvedSizes: sizes,
    };
  }, [src, unoptimized, width, height, quality, crop, fill, sizes, srcSet]);

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      srcSet={resolvedSrcSet}
      alt={alt}
      sizes={resolvedSizes}
      loading={priority ? 'eager' : loading || 'lazy'}
      decoding={decoding}
      style={computedStyle}
      className={className}
      width={width}
      height={height}
      fetchPriority={priority ? 'high' : undefined}
      {...rest}
    />
  );
});

export default Image;


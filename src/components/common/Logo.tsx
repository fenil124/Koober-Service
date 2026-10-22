import React from 'react';

export interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  height?: number;
  width?: number;
  className?: string;
  imgClassName?: string;
  alt?: string;
}

const LOGO_SRC = '/logo.png';
const LOGO_FALLBACK = '/images/logo.png';

export function Logo({
  variant = 'dark',
  size = 'md',
  height: customHeight,
  width: customWidth,
  className = '',
  imgClassName = '',
  alt = 'Koober Services',
}: LogoProps) {
  // Proportional sizing matching the 485x385 tightly cropped transparent Koober logo (ratio ~1.26:1)
  const sizeMap = {
    xs: { height: 38, width: 48 },
    sm: { height: 48, width: 60 },
    md: { height: 82, width: 103 },
    lg: { height: 100, width: 126 },
    xl: { height: 120, width: 151 },
  };

  const defaultDimensions = sizeMap[size] || sizeMap.md;
  const height = customHeight ?? defaultDimensions.height;
  const width = customWidth ?? (customHeight ? Math.round(customHeight * (485 / 385)) : defaultDimensions.width);

  const containerVariantClass =
    variant === 'light'
      ? 'bg-[#071A35] p-3 rounded-2xl border border-[#F5B936]/25 shadow-md'
      : 'bg-transparent';

  return (
    <div className={`inline-flex items-center justify-center shrink-0 select-none ${containerVariantClass} ${className}`}>
      <img
        src={LOGO_SRC}
        alt={alt}
        width={width}
        height={height}
        style={{
          height: `${height}px`,
          width: 'auto',
          aspectRatio: '485 / 385',
          objectFit: 'contain',
        }}
        className={`shrink-0 block transition-transform group-hover:scale-105 ${imgClassName}`}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== LOGO_FALLBACK) {
            target.src = LOGO_FALLBACK;
          }
        }}
      />
    </div>
  );
}

export default Logo;

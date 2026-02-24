"use client";

import { useState, useEffect } from 'react';
import { processExternalImageUrl, getFallbackImageUrl } from '@/lib/imageUtils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  onError?: () => void;
}

export default function SafeImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes, // kept for API compatibility, not used by <img>
  onError
}: SafeImageProps) {
  // Immediately normalize empty/whitespace-only src to a safe local fallback
  const initialSrc =
    src && src.trim().length > 0 ? src : getFallbackImageUrl(src);

  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const normalized =
      src && src.trim().length > 0 ? src : getFallbackImageUrl(src);

    if (normalized !== currentSrc) {
      setCurrentSrc(normalized);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src, currentSrc]);

  // Safety timeout: if Firefox (or any browser) never fires onLoad/onError,
  // stop showing the "Loading..." overlay after a few seconds and fall back.
  useEffect(() => {
    if (!isLoading) return;
    if (typeof window === 'undefined') return;

    const timeoutId = window.setTimeout(() => {
      setCurrentSrc(getFallbackImageUrl(src));
      setHasError(false);
      setIsLoading(false);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading, src]);

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    setIsLoading(false);

    if (currentSrc === src && src.startsWith('http')) {
      // Try processed external URL first
      const processedUrl = processExternalImageUrl(src);
      if (processedUrl !== src && currentSrc !== processedUrl) {
        console.log('Trying processed external URL:', processedUrl);
        setCurrentSrc(processedUrl);
        setHasError(false);
        setIsLoading(true);
        return;
      }
    }

    // Fall back to default image (local hero background)
    const fallback = getFallbackImageUrl(src);
    if (currentSrc !== fallback && currentSrc !== src) {
      console.log('Falling back to:', fallback);
      setCurrentSrc(fallback);
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const wrapperStyle = fill ? { width: '100%', height: '100%' } : {};
  const imgClass = `${fill ? 'w-full h-full object-cover' : ''} ${className}`;

  return (
    <div className={`relative ${fill ? '' : ''}`} style={wrapperStyle}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#111827] animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {!hasError && (
        <img
          src={currentSrc}
          alt={alt}
          className={imgClass}
          width={width}
          height={height}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center px-2">
            <div>Image unavailable</div>
            <div className="text-xs mt-1 opacity-70">{alt}</div>
          </div>
        </div>
      )}
    </div>
  );
}

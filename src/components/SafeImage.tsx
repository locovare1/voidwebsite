"use client";

import { useState } from 'react';
import Image from 'next/image';
import { processDiscordImageUrl, getFallbackImageUrl } from '@/lib/imageUtils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  onError?: () => void;
}

export default function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fill = false, 
  width, 
  height,
  onError 
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    setHasError(true);
    setIsLoading(false);
    
    if (currentSrc === src && src.includes('discord')) {
      // Try processed Discord URL first
      const processedUrl = processDiscordImageUrl(src);
      if (processedUrl !== src) {
        console.log('Trying processed Discord URL:', processedUrl);
        setCurrentSrc(processedUrl);
        setHasError(false);
        setIsLoading(true);
        return;
      }
    }
    
    // Fall back to default image
    const fallback = getFallbackImageUrl(src);
    if (currentSrc !== fallback) {
      console.log('Falling back to:', fallback);
      setCurrentSrc(fallback);
      setHasError(false);
      setIsLoading(true);
    }
    
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // For Discord URLs, use regular img tag to avoid Next.js domain restrictions
  if (src.includes('discord')) {
    return (
      <div className={`relative ${className}`} style={fill ? { width: '100%', height: '100%' } : {}}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={currentSrc}
          alt={alt}
          className={`${fill ? 'w-full h-full object-cover' : ''} ${className}`}
          width={width}
          height={height}
          onError={handleError}
          onLoad={handleLoad}
          style={hasError ? { display: 'none' } : {}}
        />
        {hasError && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-gray-400 text-sm text-center">
              <div>Failed to load image</div>
              <div className="text-xs mt-1">Discord image unavailable</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For non-Discord URLs, use Next.js Image component
  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center ${className}`}>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={src.includes('discord')}
      />
    </>
  );
}
/**
 * Utility functions for handling image URLs, especially Discord CDN URLs
 */

/**
 * Process external image URLs to make them more reliable
 * Handles Discord, Imgur, and other external image services
 */
export function processExternalImageUrl(url: string): string {
  if (!url || !url.startsWith('http')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Handle Discord URLs
    if (url.includes('discord')) {
      // Remove expiration and signature parameters that can cause issues
      urlObj.searchParams.delete('ex');
      urlObj.searchParams.delete('is');
      urlObj.searchParams.delete('hm');
      
      // Keep only essential parameters
      const format = urlObj.searchParams.get('format');
      const width = urlObj.searchParams.get('width');
      const height = urlObj.searchParams.get('height');
      
      // Clear all parameters
      urlObj.search = '';
      
      // Add back only the safe ones
      if (format && ['webp', 'png', 'jpg', 'jpeg'].includes(format)) {
        urlObj.searchParams.set('format', format);
      }
      if (width && parseInt(width) > 0) {
        urlObj.searchParams.set('width', Math.min(parseInt(width), 1024).toString());
      }
      if (height && parseInt(height) > 0) {
        urlObj.searchParams.set('height', Math.min(parseInt(height), 1024).toString());
      }
    }
    
    // Handle other problematic parameters from various services
    urlObj.searchParams.delete('token');
    urlObj.searchParams.delete('signature');
    urlObj.searchParams.delete('expires');
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to process external URL:', error);
    return url;
  }
}

// Keep the old function name for backward compatibility
export const processDiscordImageUrl = processExternalImageUrl;

/**
 * Get a fallback image URL based on the original URL type
 */
export function getFallbackImageUrl(originalUrl?: string): string {
  if (!originalUrl) {
    return '/hero-bg.jpg';
  }
  
  // For Discord URLs, we might want a specific fallback
  if (originalUrl.includes('discord')) {
    return '/hero-bg.jpg';
  }
  
  return '/hero-bg.jpg';
}

/**
 * Check if an image URL is likely to work with Next.js Image component
 */
export function isOptimizableImageUrl(url: string): boolean {
  if (!url.startsWith('http')) {
    return true; // Local images
  }
  
  // External images that often have CORS issues
  const problematicDomains = ['discord', 'cdn.discord', 'media.discord'];
  if (problematicDomains.some(domain => url.includes(domain))) {
    return false;
  }
  
  return true;
}

/**
 * Check if URL is from a trusted image host
 */
export function isTrustedImageHost(url: string): boolean {
  if (!url.startsWith('http')) {
    return true; // Local images
  }
  
  const trustedHosts = [
    'imgur.com',
    'i.imgur.com',
    'images.unsplash.com',
    'raw.githubusercontent.com',
    'github.com',
    'cdn.jsdelivr.net'
  ];
  
  return trustedHosts.some(host => url.includes(host));
}

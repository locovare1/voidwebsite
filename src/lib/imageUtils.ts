/**
 * Utility functions for handling image URLs, especially Discord CDN URLs
 */

/**
 * Process Discord CDN URLs to make them more reliable
 * Discord URLs often have expiration tokens and parameters that can cause issues
 */
export function processDiscordImageUrl(url: string): string {
  if (!url.includes('discord')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Remove expiration and signature parameters that can cause issues
    urlObj.searchParams.delete('ex');
    urlObj.searchParams.delete('is');
    urlObj.searchParams.delete('hm');
    
    // Keep format and quality parameters as they're useful
    // urlObj.searchParams.delete('format');
    // urlObj.searchParams.delete('quality');
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to process Discord URL:', error);
    return url;
  }
}

/**
 * Get a fallback image URL based on the original URL type
 */
export function getFallbackImageUrl(originalUrl?: string): string {
  if (!originalUrl) {
    return '/logo.png';
  }
  
  // For Discord URLs, we might want a specific fallback
  if (originalUrl.includes('discord')) {
    return '/logo.png';
  }
  
  return '/logo.png';
}

/**
 * Check if an image URL is likely to work with Next.js Image component
 */
export function isOptimizableImageUrl(url: string): boolean {
  if (!url.startsWith('http')) {
    return true; // Local images
  }
  
  // Discord images often have CORS issues, so we might want to disable optimization
  if (url.includes('discord')) {
    return false;
  }
  
  return true;
}
/**
 * Utility functions for handling image URLs, especially Discord CDN URLs
 */

/**
 * Process Discord CDN URLs to make them more reliable
 * Discord URLs often have expiration tokens and parameters that can cause issues
 */
export function processDiscordImageUrl(url: string): string {
  if (!url || !url.includes('discord')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Remove expiration and signature parameters that can cause issues
    urlObj.searchParams.delete('ex');
    urlObj.searchParams.delete('is');
    urlObj.searchParams.delete('hm');
    
    // For Discord, sometimes removing all parameters helps with CORS
    // Keep only essential ones
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
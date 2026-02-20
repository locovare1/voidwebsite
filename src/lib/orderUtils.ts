// Order utility functions

/**
 * Generates a formatted order number
 * Format: VOID-YYYYMMDD-XXXXX
 * Example: VOID-20241222-A1B2C
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Generate a 5-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `VOID-${year}${month}${day}-${code}`;
}

/**
 * Formats order number for display
 * Shows full order number or shortened version
 */
export function formatOrderNumber(orderNumber: string, short: boolean = false): string {
  if (short && orderNumber.startsWith('VOID-')) {
    // Return last 8 characters for short display
    return orderNumber.slice(-8);
  }
  return orderNumber;
}

/**
 * Validates order number format
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  // Check for new format: VOID-YYYYMMDD-XXXXX
  const newFormatRegex = /^VOID-\d{8}-[A-Z0-9]{5}$/;
  
  // Check for old format: order_timestamp_randomstring
  const oldFormatRegex = /^order_\d+_[a-z0-9]+$/;
  
  return newFormatRegex.test(orderNumber) || oldFormatRegex.test(orderNumber);
}
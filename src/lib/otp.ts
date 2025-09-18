import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate OTP expiry time (5 minutes from now)
 */
export function generateOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiryTime: Date): boolean {
  return new Date() > expiryTime;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian phone number
  // Should be 10 digits or 12 digits (with country code)
  if (cleaned.length === 10) {
    // Indian mobile numbers start with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(cleaned);
  } else if (cleaned.length === 12) {
    // With country code 91
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.slice(2);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  return phone;
}

/**
 * Normalize phone number for storage
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  
  throw new Error('Invalid phone number format');
}

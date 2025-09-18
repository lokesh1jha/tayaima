import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique SKU for a product variant
 */
export function generateSKU(productName: string, unit: string, amount: number): string {
  // Create a base from product name (first 3 chars, uppercase)
  const nameCode = productName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
    
  // Unit code (first 2 chars)
  const unitCode = unit.substring(0, 2).toUpperCase();
  
  // Amount code (remove decimals, take first 3 digits)
  const amountCode = amount.toString().replace('.', '').substring(0, 3).padEnd(3, '0');
  
  // Random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${nameCode}-${unitCode}${amountCode}-${randomSuffix}`;
}

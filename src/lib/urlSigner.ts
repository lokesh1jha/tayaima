import { createStorageProvider } from './storage';

// Cache for signed URLs to avoid repeated signing
const signedUrlCache = new Map<string, { url: string; timestamp: number }>();
const SIGNED_URL_CACHE_TTL = 50 * 60 * 1000; // 50 minutes (URLs expire in 1 hour)

// Shared storage provider instance
let storageProvider: any = null;

function getStorageProvider() {
  if (!storageProvider) {
    storageProvider = createStorageProvider();
  }
  return storageProvider;
}

// Utility to sign URLs automatically with caching
export async function signUrl(url: string): Promise<string> {
  if (!url) return url;
  
  // If it's a local URL, return as-is
  if (url.startsWith('/uploads/')) {
    return url;
  }
  
  // If it's an S3 URL, sign it with caching
  if (url.includes('.s3.') || url.includes('amazonaws.com')) {
    try {
      // Check cache first
      const cached = signedUrlCache.get(url);
      if (cached && Date.now() - cached.timestamp < SIGNED_URL_CACHE_TTL) {
        return cached.url;
      }
      
      const storage = getStorageProvider();
      
      // Extract key from URL (handles both signed and unsigned URLs)
      const key = storage.extractKey(url);
      
      if (key) {
        // Generate fresh signed URL
        const signedUrl = await storage.getViewUrl(key);
        
        // Cache the signed URL
        signedUrlCache.set(url, { url: signedUrl, timestamp: Date.now() });
        
        return signedUrl;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to sign URL:', error);
      }
    }
  }
  
  // Return original URL as fallback
  return url;
}

// Utility to sign multiple URLs
export async function signUrls(urls: string[]): Promise<string[]> {
  if (!urls || urls.length === 0) return urls;
  
  const signedUrls = await Promise.all(
    urls.map(url => signUrl(url))
  );
  
  return signedUrls;
}

// Utility to sign URLs in an object (like a product with images array)
export async function signUrlsInObject<T extends Record<string, any>>(
  obj: T,
  urlFields: (keyof T)[]
): Promise<T> {
  if (!obj) return obj;
  
  const signedObj = { ...obj };
  
  for (const field of urlFields) {
    const value = obj[field];
    
    if (typeof value === 'string') {
      (signedObj[field] as any) = await signUrl(value);
    } else if (Array.isArray(value) && value.every((v: any) => typeof v === 'string')) {
      (signedObj[field] as any) = await signUrls(value);
    }
  }
  
  return signedObj;
}

// Utility to sign URLs in an array of objects
export async function signUrlsInArray<T extends Record<string, any>>(
  array: T[],
  urlFields: (keyof T)[]
): Promise<T[]> {
  if (!array || array.length === 0) return array;
  
  const signedArray = await Promise.all(
    array.map(obj => signUrlsInObject(obj, urlFields))
  );
  
  return signedArray;
}

// Utility to invalidate cache for specific URLs
export function invalidateUrlCache(urls: string[]): void {
  urls.forEach(url => {
    if (url) {
      signedUrlCache.delete(url);
    }
  });
}

// Utility to clear all cached URLs
export function clearUrlCache(): void {
  signedUrlCache.clear();
}

// Utility to invalidate cache for URLs that contain a specific pattern
export function invalidateUrlCacheByPattern(pattern: string): void {
  const keysToDelete: string[] = [];
  
  for (const [key] of signedUrlCache) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => signedUrlCache.delete(key));
}

// Utility to invalidate cache for a specific product's images
export function invalidateProductImageCache(productId: string): void {
  // This is a more targeted approach - we could store product-to-image mappings
  // For now, we'll use a pattern-based approach
  invalidateUrlCacheByPattern(`products/${productId}`);
}

// Utility to get cache statistics (useful for debugging)
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: signedUrlCache.size,
    keys: Array.from(signedUrlCache.keys())
  };
}

// Utility to add cache-busting parameter to URLs
export function addCacheBuster(url: string, timestamp?: number): string {
  if (!url) return url;
  
  const cacheBuster = timestamp || Date.now();
  const separator = url.includes('?') ? '&' : '?';
  
  return `${url}${separator}v=${cacheBuster}`;
}

// Utility to add cache-busting to multiple URLs
export function addCacheBusterToUrls(urls: string[], timestamp?: number): string[] {
  if (!urls || urls.length === 0) return urls;
  
  const cacheBuster = timestamp || Date.now();
  return urls.map(url => addCacheBuster(url, cacheBuster));
}

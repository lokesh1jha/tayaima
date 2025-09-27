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

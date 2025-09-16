import { createStorageProvider } from './storage';

// Utility to sign URLs automatically
export async function signUrl(url: string): Promise<string> {
  if (!url) return url;
  
  // If it's a local URL or already signed, return as-is
  if (url.startsWith('/uploads/') || url.includes('X-Amz-Signature')) {
    return url;
  }
  
  // If it's an S3 URL, sign it
  if (url.includes('.s3.') || url.includes('amazonaws.com')) {
    try {
      const storage = createStorageProvider();
      const key = storage.extractKey(url);
      
      if (key) {
        return await storage.getViewUrl(key);
      }
    } catch (error) {
      console.error('Failed to sign URL:', error);
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

// Storage abstraction layer - easy to switch between different storage providers

export interface StorageProvider {
  upload(file: Buffer, key: string, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  isConfigured(): boolean;
  extractKey(url: string): string | null;
  getViewUrl(key: string): Promise<string>;
}

// Storage configuration
export interface StorageConfig {
  provider: 's3' | 'local';
  s3?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  };
}

// Get current storage configuration
export function getStorageConfig(): StorageConfig {
  const isS3Configured = !!(
    process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_S3_BUCKET_NAME
  );

  if (isS3Configured) {
    return {
      provider: 's3',
      s3: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        bucketName: process.env.AWS_S3_BUCKET_NAME!,
      }
    };
  }

  return { provider: 'local' };
}

// Generate unique storage key
export function generateStorageKey(originalName: string, prefix: string = 'products'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '');
  const extension = sanitizedName.split('.').pop() || 'jpg';
  
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
}

// Validate file for upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: `Invalid file type: ${file.type}. Only images are allowed.` };
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: `File too large: ${file.name}. Maximum size is 5MB.` };
  }

  return { valid: true };
}

// Storage Factory - creates the appropriate storage provider
export function createStorageProvider(): StorageProvider {
  const config = getStorageConfig();
  
  if (config.provider === 's3') {
    // Lazy import to avoid loading S3 SDK in development
    const { S3StorageProvider } = require('./s3');
    return new S3StorageProvider();
  } else {
    // Fallback to local storage
    const { LocalStorageProvider } = require('./localStorage');
    return new LocalStorageProvider();
  }
}


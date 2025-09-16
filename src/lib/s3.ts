import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider, getStorageConfig } from './storage';

// S3 Storage Provider Implementation
export class S3StorageProvider implements StorageProvider {
  private s3Client: S3Client | null = null;
  private config: any = null;

  constructor() {
    const storageConfig = getStorageConfig();
    if (storageConfig.provider === 's3' && storageConfig.s3) {
      this.config = storageConfig.s3;
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    }
  }

  isConfigured(): boolean {
    return this.s3Client !== null && this.config !== null;
  }

  async upload(file: Buffer, key: string, contentType: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured. Please set AWS environment variables.');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ACL removed - modern S3 buckets use bucket policies instead
      CacheControl: 'max-age=31536000', // Cache for 1 year
    });

    await this.s3Client!.send(command);
    
    // Return direct S3 URL
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured. Please set AWS environment variables.');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    await this.s3Client!.send(command);
  }

  extractKey(url: string): string | null {
    try {
      if (url.includes('.s3.') || url.includes('amazonaws.com')) {
        const urlObj = new URL(url);
        let pathname = urlObj.pathname.substring(1); // Remove leading slash
        
        // Handle different S3 URL formats
        // For path-style URLs like: https://s3.region.amazonaws.com/bucket/key
        if (url.includes('s3.') && url.includes('amazonaws.com')) {
          const pathParts = pathname.split('/');
          if (pathParts.length > 1 && pathParts[0] === this.config.bucketName) {
            // Remove bucket name from path for path-style URLs
            pathname = pathParts.slice(1).join('/');
          }
        }
        
        // Decode URL components
        return decodeURIComponent(pathname);
      }
      return null;
    } catch (error) {
      // Import logger dynamically to avoid circular dependencies
      const { logger } = require('./logger');
      logger.error('Error extracting key from URL', error, { url });
      return null;
    }
  }

  async getViewUrl(key: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured. Please set AWS environment variables.');
    }

    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    // Generate signed URL valid for 1 hour
    return await getSignedUrl(this.s3Client!, command, { expiresIn: 3600 });
  }

  // Optional: Generate presigned URL for direct uploads
  async generatePresignedUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('S3 is not configured. Please set AWS environment variables.');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      ContentType: contentType,
      // ACL removed - modern S3 buckets use bucket policies instead
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn });
  }
}

// Legacy exports for backward compatibility (will be removed later)
export const isS3Configured = new S3StorageProvider().isConfigured();
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

// Legacy functions for backward compatibility (will be removed later)
export async function uploadToS3(file: Buffer, key: string, contentType: string): Promise<string> {
  const provider = new S3StorageProvider();
  return provider.upload(file, key, contentType);
}

export async function deleteFromS3(key: string): Promise<void> {
  const provider = new S3StorageProvider();
  return provider.delete(key);
}

export function generateS3Key(originalName: string, prefix: string = 'products'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '');
  const extension = sanitizedName.split('.').pop() || 'jpg';
  
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
}

export function extractS3Key(url: string): string | null {
  const provider = new S3StorageProvider();
  return provider.extractKey(url);
}

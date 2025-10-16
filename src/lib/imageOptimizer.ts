import sharp from 'sharp';

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  stripMetadata?: boolean;
}

export interface OptimizedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  savings: string;
}

/**
 * Optimize and convert image to WebP format
 * - Resizes large images to reasonable dimensions
 * - Strips metadata for privacy and smaller file size
 * - Converts to WebP for better compression
 * - Typically achieves 60-80% size reduction
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    quality = 85,
    maxWidth = 2048,
    maxHeight = 2048,
    format = 'webp',
    stripMetadata = true
  } = options;

  try {
    let pipeline = sharp(buffer);

    // Get original metadata
    const metadata = await pipeline.metadata();
    
    // Resize if image is too large (maintain aspect ratio)
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    if (metadata.height && metadata.height > maxHeight) {
      pipeline = pipeline.resize(null, maxHeight, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Strip metadata for privacy and smaller file size
    if (stripMetadata) {
      pipeline = pipeline.withMetadata({
        exif: {}
      });
    }

    // Convert to target format
    if (format === 'webp') {
      pipeline = pipeline.webp({ 
        quality, 
        effort: 4, // Balance between compression and speed (0-6)
        smartSubsample: true
      });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ 
        quality, 
        progressive: true,
        mozjpeg: true // Better compression
      });
    } else if (format === 'png') {
      pipeline = pipeline.png({ 
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    }

    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    const originalSize = buffer.length;
    const optimizedSize = optimizedBuffer.length;
    const savingsPercent = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    return {
      buffer: optimizedBuffer,
      format,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
      originalSize,
      optimizedSize,
      savings: `${savingsPercent}%`
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
}

/**
 * Generate multiple sizes for responsive images
 * Useful for serving different sizes based on device screen size
 */
export async function generateResponsiveSizes(
  buffer: Buffer,
  sizes: number[] = [320, 640, 1024, 1920]
): Promise<Array<{ buffer: Buffer; width: number; filename: string }>> {
  const results = [];

  for (const width of sizes) {
    const optimized = await sharp(buffer)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 85 })
      .toBuffer();

    const metadata = await sharp(optimized).metadata();

    results.push({
      buffer: optimized,
      width: metadata.width || width,
      filename: `w${width}`
    });
  }

  return results;
}

/**
 * Validate if buffer is a valid image
 */
export async function validateImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!(metadata.width && metadata.height && metadata.format);
  } catch {
    return false;
  }
}

/**
 * Get image dimensions without full optimization
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number; format: string }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown'
  };
}


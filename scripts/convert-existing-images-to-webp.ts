/**
 * Script to convert all existing product images to WebP format
 * 
 * This script:
 * 1. Fetches all products from the database
 * 2. Downloads each image from S3
 * 3. Converts to WebP format with optimization
 * 4. Uploads the WebP version to S3
 * 5. Updates the database with new WebP URLs
 * 6. Optionally deletes old images
 * 
 * Usage:
 *   npm run convert:images        # Dry run (preview changes)
 *   npm run convert:images --execute  # Actually convert images
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { optimizeImage } from '../src/lib/imageOptimizer';
import { Readable } from 'stream';

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const DRY_RUN = !process.argv.includes('--execute');
const DELETE_OLD = process.argv.includes('--delete-old');

interface ConversionStats {
  totalProducts: number;
  totalImages: number;
  convertedImages: number;
  skippedImages: number;
  failedImages: number;
  totalSizeBefore: number;
  totalSizeAfter: number;
  errors: Array<{ productId: string; imageUrl: string; error: string }>;
}

const stats: ConversionStats = {
  totalProducts: 0,
  totalImages: 0,
  convertedImages: 0,
  skippedImages: 0,
  failedImages: 0,
  totalSizeBefore: 0,
  totalSizeAfter: 0,
  errors: [],
};

/**
 * Download image from S3
 */
async function downloadImageFromS3(imageUrl: string): Promise<Buffer | null> {
  try {
    // Extract S3 key from URL
    // Format: https://bucket-name.s3.region.amazonaws.com/path/to/image.jpg
    const urlPattern = /https:\/\/[^.]+\.s3\.[^.]+\.amazonaws\.com\/(.+?)(\?|$)/;
    const match = imageUrl.match(urlPattern);
    
    if (!match) {
      console.error(`  ❌ Invalid S3 URL format: ${imageUrl}`);
      return null;
    }

    const key = decodeURIComponent(match[1]);
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      console.error(`  ❌ No body in S3 response for: ${key}`);
      return null;
    }

    // Convert stream to buffer
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  } catch (error: any) {
    console.error(`  ❌ Error downloading from S3:`, error.message);
    return null;
  }
}

/**
 * Upload WebP image to S3
 */
async function uploadWebPToS3(buffer: Buffer, originalUrl: string): Promise<string | null> {
  try {
    // Extract original key and create new WebP key
    const urlPattern = /https:\/\/[^.]+\.s3\.[^.]+\.amazonaws\.com\/(.+?)(\?|$)/;
    const match = originalUrl.match(urlPattern);
    
    if (!match) {
      return null;
    }

    const originalKey = decodeURIComponent(match[1]);
    
    // Replace extension with .webp
    const webpKey = originalKey.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: webpKey,
      Body: buffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);
    
    // Construct new URL (without query parameters)
    const baseUrl = originalUrl.split('?')[0];
    const newUrl = baseUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
    
    return newUrl;
  } catch (error: any) {
    console.error(`  ❌ Error uploading to S3:`, error.message);
    return null;
  }
}

/**
 * Delete old image from S3
 */
async function deleteOldImage(imageUrl: string): Promise<boolean> {
  try {
    const urlPattern = /https:\/\/[^.]+\.s3\.[^.]+\.amazonaws\.com\/(.+?)(\?|$)/;
    const match = imageUrl.match(urlPattern);
    
    if (!match) {
      return false;
    }

    const key = decodeURIComponent(match[1]);
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`  🗑️  Deleted old image: ${key}`);
    return true;
  } catch (error: any) {
    console.error(`  ⚠️  Error deleting old image:`, error.message);
    return false;
  }
}

/**
 * Convert a single image
 */
async function convertImage(imageUrl: string, productId: string): Promise<string | null> {
  // Skip if already WebP
  if (imageUrl.toLowerCase().endsWith('.webp')) {
    console.log(`  ⏭️  Already WebP: ${imageUrl}`);
    stats.skippedImages++;
    return imageUrl;
  }

  try {
    console.log(`  📥 Downloading: ${imageUrl}`);
    
    // Download from S3
    const buffer = await downloadImageFromS3(imageUrl);
    if (!buffer) {
      throw new Error('Failed to download image');
    }

    stats.totalSizeBefore += buffer.length;
    console.log(`  📊 Original size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    // Optimize and convert to WebP
    console.log(`  🔄 Converting to WebP...`);
    const optimized = await optimizeImage(buffer, {
      quality: 85,
      maxWidth: 2048,
      maxHeight: 2048,
      format: 'webp',
      stripMetadata: true,
    });

    stats.totalSizeAfter += optimized.optimizedSize;
    console.log(`  ✅ Optimized size: ${(optimized.optimizedSize / 1024).toFixed(2)} KB (${optimized.savings} savings)`);
    
    if (DRY_RUN) {
      console.log(`  🔍 DRY RUN - Would upload as WebP`);
      stats.convertedImages++;
      return imageUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
    }

    // Upload WebP to S3
    console.log(`  📤 Uploading WebP to S3...`);
    const newUrl = await uploadWebPToS3(optimized.buffer, imageUrl);
    
    if (!newUrl) {
      throw new Error('Failed to upload WebP image');
    }

    console.log(`  ✅ Uploaded: ${newUrl}`);
    
    // Delete old image if requested
    if (DELETE_OLD) {
      await deleteOldImage(imageUrl);
    }
    
    stats.convertedImages++;
    return newUrl;
  } catch (error: any) {
    console.error(`  ❌ Failed to convert image:`, error.message);
    stats.failedImages++;
    stats.errors.push({
      productId,
      imageUrl,
      error: error.message,
    });
    return null;
  }
}

/**
 * Process all products
 */
async function convertAllImages() {
  console.log('\n🚀 Starting image conversion process...\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (preview only)' : '⚡ EXECUTE (will modify database)'}`);
  console.log(`Delete old images: ${DELETE_OLD ? '✅ Yes' : '❌ No'}\n`);

  try {
    // Fetch all products with images
    console.log('📋 Fetching products from database...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
      where: {
        images: {
          isEmpty: false,
        },
      },
    });

    stats.totalProducts = products.length;
    stats.totalImages = products.reduce((sum, p) => sum + p.images.length, 0);
    
    console.log(`\n📊 Found ${products.length} products with ${stats.totalImages} total images\n`);
    console.log('━'.repeat(80));

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n[${i + 1}/${products.length}] 📦 Product: ${product.name} (ID: ${product.id})`);
      console.log(`   Images: ${product.images.length}`);
      
      const newImages: string[] = [];
      
      // Convert each image
      for (const imageUrl of product.images) {
        const newUrl = await convertImage(imageUrl, product.id);
        if (newUrl) {
          newImages.push(newUrl);
        } else {
          // Keep original URL if conversion failed
          newImages.push(imageUrl);
        }
      }

      // Update database
      if (!DRY_RUN && newImages.length > 0) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: { images: newImages },
          });
          console.log(`  💾 Updated database with ${newImages.length} image URLs`);
        } catch (error: any) {
          console.error(`  ❌ Failed to update database:`, error.message);
          stats.errors.push({
            productId: product.id,
            imageUrl: 'database_update',
            error: error.message,
          });
        }
      }
    }

    console.log('\n' + '━'.repeat(80));
    console.log('\n✨ Conversion complete!\n');
    
    // Print summary
    printSummary();

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Print summary statistics
 */
function printSummary() {
  console.log('📊 SUMMARY');
  console.log('━'.repeat(80));
  console.log(`Total products processed:    ${stats.totalProducts}`);
  console.log(`Total images:                ${stats.totalImages}`);
  console.log(`✅ Converted:                ${stats.convertedImages}`);
  console.log(`⏭️  Skipped (already WebP):  ${stats.skippedImages}`);
  console.log(`❌ Failed:                   ${stats.failedImages}`);
  console.log('');
  
  if (stats.totalSizeBefore > 0) {
    const savingsPercent = ((1 - stats.totalSizeAfter / stats.totalSizeBefore) * 100).toFixed(1);
    console.log(`💾 Storage savings:`);
    console.log(`   Before: ${(stats.totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   After:  ${(stats.totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Saved:  ${((stats.totalSizeBefore - stats.totalSizeAfter) / 1024 / 1024).toFixed(2)} MB (${savingsPercent}%)`);
  }
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    stats.errors.forEach((err, i) => {
      console.log(`${i + 1}. Product ${err.productId}: ${err.imageUrl}`);
      console.log(`   Error: ${err.error}`);
    });
  }
  
  if (DRY_RUN) {
    console.log('\n💡 This was a DRY RUN. No changes were made.');
    console.log('   Run with --execute flag to actually convert images:');
    console.log('   npm run convert:images --execute');
  } else {
    console.log('\n✅ All changes have been saved to the database!');
  }
  
  if (!DELETE_OLD && !DRY_RUN) {
    console.log('\n💡 Old images were kept on S3.');
    console.log('   Run with --delete-old flag to remove them:');
    console.log('   npm run convert:images --execute --delete-old');
  }
  
  console.log('━'.repeat(80));
}

// Run the script
convertAllImages()
  .catch(console.error)
  .finally(() => process.exit(0));


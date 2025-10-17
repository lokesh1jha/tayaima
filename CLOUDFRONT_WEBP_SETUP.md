# CloudFront + WebP Conversion Setup Guide

## Part 1: WebP Conversion on Upload

### Step 1: Install Sharp Library

```bash
npm install sharp
```

**Package size**: ~30MB (includes pre-built binaries)
**Performance**: Very fast, native C++ bindings

### Step 2: Update Upload Route

Create a new file: `src/lib/imageOptimizer.ts`

```typescript
import sharp from 'sharp';

export interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  stripMetadata?: boolean;
}

export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<{ buffer: Buffer; format: string; width: number; height: number }> {
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
    
    // Resize if needed (maintain aspect ratio)
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
        exif: {},
        icc: undefined,
        iptc: undefined,
        xmp: undefined
      });
    }

    // Convert to target format
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality, effort: 4 });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, progressive: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9 });
    }

    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      format,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
}

// Generate multiple sizes for responsive images
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
```

### Step 3: Update Upload API

Update `src/app/api/admin/uploads/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStorageProvider, generateStorageKey, validateFile } from "@/lib/storage";
import { optimizeImage } from "@/lib/imageOptimizer";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const form = await req.formData();
    const files = form.getAll("file");
    const prefix = form.get("prefix")?.toString() || 'products';
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const storage = createStorageProvider();
    const urls: string[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      
      // Validate file
      const validation = validateFile(f);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // OPTIMIZE IMAGE TO WEBP
      const optimized = await optimizeImage(buffer, {
        quality: 85,
        maxWidth: 2048,
        maxHeight: 2048,
        format: 'webp',
        stripMetadata: true
      });
      
      // Update filename to .webp
      const originalName = f.name.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const storageKey = generateStorageKey(originalName, prefix);
      
      // Upload optimized image
      const url = await storage.upload(
        optimized.buffer, 
        storageKey, 
        'image/webp'
      );
      
      urls.push(url);

      // Log optimization stats
      console.log(`Optimized ${f.name}:`, {
        originalSize: buffer.length,
        optimizedSize: optimized.buffer.length,
        savings: `${((1 - optimized.buffer.length / buffer.length) * 100).toFixed(1)}%`,
        dimensions: `${optimized.width}x${optimized.height}`
      });
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: "Failed to upload files" }, 
      { status: 500 }
    );
  }
}
```

### Step 4: Update Next.js Config

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    unoptimized: false, // Re-enable for WebP support
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net', // Add CloudFront domain
      },
    ],
  },
};

export default nextConfig;
```

---

## Part 2: CloudFront Setup with Signed URLs

### Step 1: Create CloudFront Distribution

1. **Go to AWS CloudFront Console**
2. **Create Distribution**:
   - Origin Domain: `your-bucket.s3.ap-south-1.amazonaws.com`
   - Origin Access: **Origin Access Control (OAC)** (recommended)
   - Viewer Protocol Policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP Methods: **GET, HEAD**
   - Cache Policy: **CachingOptimized**
   - Compress Objects: **Yes**

3. **Update S3 Bucket Policy** (CloudFront OAC):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT-ID:distribution/DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

### Step 2: Create CloudFront Key Pair

1. **Go to AWS Console** → **Security Credentials** → **CloudFront Key Pairs**
2. **Create New Key Pair**
3. **Download** private key (keep it secure!)
4. **Note** the Key Pair ID

### Step 3: Implement CloudFront Signed URLs

Create `src/lib/cloudFrontSigner.ts`:

```typescript
import { createSign } from 'crypto';

interface CloudFrontSignedUrlOptions {
  url: string;
  keyPairId: string;
  privateKey: string;
  expiresIn?: number; // seconds
}

export function getCloudFrontSignedUrl(options: CloudFrontSignedUrlOptions): string {
  const {
    url,
    keyPairId,
    privateKey,
    expiresIn = 3600
  } = options;

  // Calculate expiration time
  const expireTime = Math.floor(Date.now() / 1000) + expiresIn;

  // Create policy
  const policy = JSON.stringify({
    Statement: [
      {
        Resource: url,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': expireTime
          }
        }
      }
    ]
  });

  // Sign the policy
  const sign = createSign('RSA-SHA1');
  sign.update(policy);
  const signature = sign.sign(privateKey, 'base64');

  // Make URL-safe
  const safeSignature = signature
    .replace(/\+/g, '-')
    .replace(/=/g, '_')
    .replace(/\//g, '~');

  const safePolicy = Buffer.from(policy)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/=/g, '_')
    .replace(/\//g, '~');

  // Return signed URL
  return `${url}?Expires=${expireTime}&Signature=${safeSignature}&Key-Pair-Id=${keyPairId}`;
}
```

### Step 4: Update URL Signer to Use CloudFront

Update `src/lib/urlSigner.ts`:

```typescript
import { getCloudFrontSignedUrl } from './cloudFrontSigner';

const USE_CLOUDFRONT = process.env.USE_CLOUDFRONT === 'true';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN; // e.g., 'd12345.cloudfront.net'
const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID;
const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function signUrl(url: string, expiresIn: number = 3600): Promise<string> {
  if (!url) return '';

  // If using CloudFront
  if (USE_CLOUDFRONT && CLOUDFRONT_DOMAIN && CLOUDFRONT_KEY_PAIR_ID && CLOUDFRONT_PRIVATE_KEY) {
    // Replace S3 URL with CloudFront URL
    const s3Pattern = /https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)/;
    const match = url.match(s3Pattern);
    
    if (match) {
      const [, , , path] = match;
      const cloudFrontUrl = `https://${CLOUDFRONT_DOMAIN}/${path}`;
      
      return getCloudFrontSignedUrl({
        url: cloudFrontUrl,
        keyPairId: CLOUDFRONT_KEY_PAIR_ID,
        privateKey: CLOUDFRONT_PRIVATE_KEY,
        expiresIn
      });
    }
  }

  // Fallback to S3 signed URL
  return getS3SignedUrl(url, expiresIn);
}
```

### Step 5: Environment Variables

Add to `.env` (and Vercel):

```bash
# CloudFront Configuration
USE_CLOUDFRONT=true
CLOUDFRONT_DOMAIN=d12345abcdef.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=APKA1234567890ABCDEF
CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...your key here...\n-----END RSA PRIVATE KEY-----"
```

---

## Cost Comparison

### Without WebP (Current):
- **Image size**: 20 MB per page
- **10,000 visitors/month**: $34.52 (CloudFront) or $24.60 (S3)

### With WebP:
- **Image size**: 6 MB per page (70% reduction)
- **10,000 visitors/month**: $10.36 (CloudFront) or $7.38 (S3)
- **Savings**: ~$24/month at 10,000 visitors

### With WebP + CloudFront Caching (80% hit rate):
- **10,000 visitors/month**: ~$2-3
- **50,000 visitors/month**: ~$10-12
- **100,000 visitors/month**: ~$20-25

---

## Performance Gains

- **Page Load Time**: 1.72s → **0.5-0.8s**
- **Largest Contentful Paint**: 3.66s → **1.5-2s**
- **Image Load Time**: 2-3s → **0.3-0.5s**
- **SEO Score**: 78 → **90+**

---

## Migration Plan

### Phase 1: WebP Conversion (Week 1)
1. Install sharp: `npm install sharp`
2. Update upload API with WebP conversion
3. Test image uploads
4. Deploy to production

### Phase 2: CloudFront Setup (Week 2)
1. Create CloudFront distribution
2. Generate key pair
3. Update environment variables
4. Update URL signer
5. Test signed URLs
6. Deploy to production

### Phase 3: Existing Images (Week 3)
**Option A**: Convert existing images
```bash
# Run a one-time script to convert existing S3 images
node scripts/convert-existing-images.js
```

**Option B**: Lazy conversion (recommended)
- Keep existing images as-is
- Only new uploads are WebP
- Gradually replace images as products are updated

---

## Testing

### Test WebP Upload:
```bash
curl -X POST http://localhost:3000/api/admin/uploads \
  -H "Cookie: your-session-cookie" \
  -F "file=@test-image.jpg" \
  -F "prefix=products"
```

### Test CloudFront Signed URL:
```javascript
// In browser console
fetch('/api/products/123').then(r => r.json()).then(console.log)
// Check that image URLs use CloudFront domain
```

---

## FAQ

**Q: Do I need to convert existing images?**
A: No, you can keep them. New uploads will be WebP automatically.

**Q: Will old browsers support WebP?**
A: Yes, 97%+ browsers support WebP. Next.js Image component has fallbacks.

**Q: Can I disable WebP for specific images?**
A: Yes, add a flag in the upload API to skip optimization if needed.

**Q: What about AVIF format?**
A: AVIF is even better (30% smaller than WebP), but browser support is ~90%. Consider it for Phase 2.

**Q: Will CloudFront work with my current S3 signed URLs?**
A: Yes! You can keep using S3 signed URLs through CloudFront, but CloudFront signed URLs are more efficient.

---

## Monitoring

After deployment, monitor:
1. **CloudFront Metrics** (AWS Console)
   - Cache hit rate (target: >80%)
   - Request count
   - Data transfer

2. **Vercel Analytics**
   - Page load time
   - Core Web Vitals

3. **AWS Billing**
   - CloudFront costs
   - S3 transfer costs

---

## Support

If you need help implementing this:
1. Start with WebP conversion (easier, immediate benefits)
2. Add CloudFront when traffic grows
3. Test thoroughly in development first
4. Monitor costs and performance after deployment


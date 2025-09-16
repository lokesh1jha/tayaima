# 🪣 AWS S3 Setup Guide for TaYaima

## 📋 Prerequisites
- AWS Account
- AWS CLI installed (optional but recommended)
- Basic knowledge of AWS S3 and IAM

## 🔧 Step 1: Create S3 Bucket

### Via AWS Console:
1. Go to AWS S3 Console
2. Click "Create bucket"
3. **Bucket name**: `tayaima` (must be globally unique)
4. **Region**: Choose closest to your users (e.g., `us-east-1`)
5. **Block all public access**: UNCHECK (we need public read access for images)
6. Click "Create bucket"

### Configure Bucket Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tayaima/*"
    }
  ]
}
```

**Important**: Modern S3 buckets have ACLs disabled by default. The application now uses bucket policies instead of ACLs for public access, which is the recommended approach.

## 🔑 Step 2: Create IAM User

### Create User:
1. Go to AWS IAM Console
2. Click "Users" → "Create user"
3. **Username**: `tayaima-s3-uploader`
4. **Access type**: Programmatic access
5. Click "Next"

### Attach Policy:
Create custom policy with these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::tayaima/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::tayaima"
    }
  ]
}
```

## 🌍 Step 3: Environment Variables

Add these to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="tayaima"

# Optional: CloudFront CDN URL (commented out for now)
# AWS_CLOUDFRONT_URL="https://your-distribution.cloudfront.net"
```

## 🚀 Step 4: CloudFront Setup (Optional - Currently Disabled)

### Benefits:
- Faster image loading worldwide
- Better caching
- Custom domain support
- Cost optimization

### Setup:
1. Go to AWS CloudFront Console
2. Click "Create Distribution"
3. **Origin Domain**: Select your S3 bucket
4. **Origin Access**: Use OAC (recommended)
5. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
6. **Caching**: Optimized for caching
7. Click "Create Distribution"

### Update Environment (when ready to enable):
```env
# Uncomment and set when ready to use CloudFront
# AWS_CLOUDFRONT_URL="https://d1234567890.cloudfront.net"
```

**Note**: CloudFront integration is currently commented out in the code. To enable it later, you'll need to uncomment the CDN-related code in `src/lib/s3.ts`.

## 🔄 Step 5: Migration from Local Storage

### Current State:
- Images stored in `/public/uploads/`
- URLs like `/uploads/filename.jpg`

### Migration Options:

#### Option 1: Gradual Migration
- New uploads go to S3
- Keep existing local images
- Update URLs as needed

#### Option 2: Full Migration
```bash
# Create migration script to upload existing images to S3
# Update database URLs from `/uploads/...` to S3 URLs
```

## 🛡️ Security Best Practices

### 1. Bucket Security:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::tayaima",
        "arn:aws:s3:::tayaima/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### 2. CORS Configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://tayaima.store", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 💰 Cost Optimization

### 1. S3 Storage Classes:
- Use **Standard** for frequently accessed images
- Use **Standard-IA** for older product images
- Use **Intelligent Tiering** for automatic optimization

### 2. Lifecycle Policies:
```json
{
  "Rules": [
    {
      "ID": "OptimizeStorage",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## 🔍 Monitoring & Logging

### CloudWatch Metrics:
- Monitor request count
- Track error rates
- Watch storage usage

### S3 Access Logging:
- Enable access logs
- Store in separate bucket
- Analyze usage patterns

## 🚨 Troubleshooting

### Common Issues:

1. **403 Forbidden**:
   - Check bucket policy
   - Verify IAM permissions
   - Ensure public read access

2. **CORS Errors**:
   - Configure CORS policy
   - Check allowed origins

3. **Slow Loading**:
   - Set up CloudFront
   - Optimize image sizes
   - Use proper cache headers

### Testing:
```bash
# Test S3 upload
curl -X POST http://localhost:3000/api/admin/uploads \
  -H "Authorization: Bearer your-admin-token" \
  -F "file=@test-image.jpg"
```

## 📈 Performance Tips

1. **Image Optimization**:
   - Compress images before upload
   - Use appropriate formats (WebP, AVIF)
   - Generate multiple sizes

2. **Caching**:
   - Set proper Cache-Control headers
   - Use CloudFront for global caching
   - Implement browser caching

3. **Loading**:
   - Use lazy loading
   - Implement progressive loading
   - Add loading placeholders

## 🔄 Backup Strategy

1. **Cross-Region Replication**:
   - Set up replication to another region
   - Ensure business continuity

2. **Versioning**:
   - Enable S3 versioning
   - Protect against accidental deletion

3. **Regular Backups**:
   - Schedule automated backups
   - Test restore procedures

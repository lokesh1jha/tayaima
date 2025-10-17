# Image Conversion Guide

## Converting Existing Products to WebP

This guide explains how to convert all your existing product images from JPEG/PNG to WebP format.

---

## 🎯 What This Does

The conversion script will:
1. ✅ Fetch all products from your database
2. ✅ Download each image from S3
3. ✅ Convert to WebP with 70-80% size reduction
4. ✅ Upload optimized WebP versions to S3
5. ✅ Update database with new URLs
6. ✅ Optionally delete old JPEG/PNG files

---

## 🚀 Quick Start

### Step 1: Preview (Dry Run)

**First, always do a dry run to see what will happen:**

```bash
npm run convert:images
```

This will:
- Show you all images that will be converted
- Display size savings for each image
- NOT make any changes to database or S3

### Step 2: Execute Conversion

**When you're ready to convert for real:**

```bash
npm run convert:images:execute
```

This will:
- Convert all images to WebP
- Upload to S3
- Update database
- Keep old images on S3 (as backup)

### Step 3: Delete Old Images (Optional)

**After verifying everything works, delete old images:**

```bash
npm run convert:images:delete-old
```

This will:
- Convert all images to WebP
- Delete old JPEG/PNG files from S3
- Save storage costs

---

## 📋 Command Reference

| Command | Description | Changes DB | Changes S3 |
|---------|-------------|------------|------------|
| `npm run convert:images` | Dry run (preview only) | ❌ No | ❌ No |
| `npm run convert:images:execute` | Convert and keep old images | ✅ Yes | ✅ Upload only |
| `npm run convert:images:delete-old` | Convert and delete old images | ✅ Yes | ✅ Upload + Delete |

---

## 📊 Example Output

```bash
$ npm run convert:images

🚀 Starting image conversion process...

Mode: 🔍 DRY RUN (preview only)
Delete old images: ❌ No

📋 Fetching products from database...

📊 Found 45 products with 127 total images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/45] 📦 Product: Fresh Tomatoes (ID: clx123...)
   Images: 3
  📥 Downloading: https://tayaima.s3.ap-south-1.amazonaws.com/products/tomato-1.jpg
  📊 Original size: 2458.32 KB
  🔄 Converting to WebP...
  ✅ Optimized size: 687.45 KB (72.0% savings)
  🔍 DRY RUN - Would upload as WebP
  
  📥 Downloading: https://tayaima.s3.ap-south-1.amazonaws.com/products/tomato-2.jpg
  📊 Original size: 1892.11 KB
  🔄 Converting to WebP...
  ✅ Optimized size: 523.89 KB (72.3% savings)
  🔍 DRY RUN - Would upload as WebP

[2/45] 📦 Product: Fresh Potatoes (ID: clx456...)
   Images: 2
   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Conversion complete!

📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total products processed:    45
Total images:                127
✅ Converted:                120
⏭️  Skipped (already WebP):  5
❌ Failed:                   2

💾 Storage savings:
   Before: 285.67 MB
   After:  79.23 MB
   Saved:  206.44 MB (72.3%)

💡 This was a DRY RUN. No changes were made.
   Run with --execute flag to actually convert images:
   npm run convert:images:execute
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚠️ Important Notes

### Before Running

1. **Backup Your Database** (recommended):
   ```bash
   pg_dump your_database > backup_before_webp_conversion.sql
   ```

2. **Check S3 Credentials**:
   Make sure your `.env` has:
   ```
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_S3_BUCKET_NAME=your-bucket
   DATABASE_URL=your-database-url
   ```

3. **Verify S3 Permissions**:
   Your AWS user needs:
   - `s3:GetObject` (download)
   - `s3:PutObject` (upload)
   - `s3:DeleteObject` (if using --delete-old)

### During Conversion

- The script processes one product at a time
- It can take 2-5 seconds per image
- For 100 images: ~5-10 minutes total
- You can safely cancel (Ctrl+C) and resume later

### After Conversion

1. **Test Your Website**:
   - Check that product images load correctly
   - Test on multiple browsers
   - Verify mobile view

2. **Monitor for Issues**:
   - Check server logs for 404 errors
   - Monitor S3 costs (should decrease)
   - Check page load speeds (should improve)

---

## 🔧 Troubleshooting

### Issue: "Failed to download image"

**Cause**: S3 URL might be invalid or permissions issue

**Solution**:
```bash
# Check if image exists in S3
aws s3 ls s3://your-bucket/products/
```

### Issue: "Failed to upload WebP"

**Cause**: S3 permissions or network issue

**Solution**:
- Check AWS credentials
- Verify S3 bucket permissions
- Check network connection

### Issue: Script crashes mid-way

**Cause**: Out of memory or network timeout

**Solution**:
1. Script can be safely restarted
2. Already converted images will be skipped
3. Or process in batches (edit script to limit products)

### Issue: Images look different after conversion

**Cause**: Quality settings might be too aggressive

**Solution**:
Edit `scripts/convert-existing-images-to-webp.ts`:
```typescript
const optimized = await optimizeImage(buffer, {
  quality: 90, // Increase from 85 to 90 for better quality
  maxWidth: 2048,
  maxHeight: 2048,
  format: 'webp',
  stripMetadata: true,
});
```

---

## 💡 Pro Tips

### 1. Process in Batches

For large datasets, modify the script to process in batches:

```typescript
// At the top of the script
const BATCH_SIZE = 50;
const BATCH_NUMBER = 1; // Change for each batch

const products = await prisma.product.findMany({
  skip: (BATCH_NUMBER - 1) * BATCH_SIZE,
  take: BATCH_SIZE,
  // ... rest of query
});
```

### 2. Test on Specific Products First

```typescript
// Convert only specific products
const products = await prisma.product.findMany({
  where: {
    id: {
      in: ['product-id-1', 'product-id-2']
    }
  }
});
```

### 3. Skip Already Converted Products

The script automatically skips images that already end in `.webp`

### 4. Monitor Progress

The script logs everything to console. You can save to a file:

```bash
npm run convert:images:execute > conversion-log.txt 2>&1
```

---

## 📈 Expected Results

### Before WebP:
- Page size: ~20 MB
- Load time: 3-4 seconds
- S3 storage: 500 MB (for 100 products)
- Monthly bandwidth cost: $25-35

### After WebP:
- Page size: ~6 MB (70% reduction)
- Load time: 1-1.5 seconds (60% faster)
- S3 storage: 150 MB (70% reduction)
- Monthly bandwidth cost: $7-10 (70% reduction)

---

## 🆘 Need Help?

If something goes wrong:

1. **Check Error Messages**: The script provides detailed error messages
2. **Review Logs**: All errors are collected in the summary
3. **Restore from Backup**: If needed, restore database from backup
4. **Old Images are Kept**: Unless you used `--delete-old`, old images are still on S3

---

## 🔄 Future Uploads

**Good news**: All new uploads will automatically be converted to WebP!

The upload API (`/api/admin/uploads`) now automatically:
- Converts all images to WebP
- Optimizes file size
- Strips metadata
- Uploads to S3

No manual conversion needed for new products! 🎉

---

## ✅ Checklist

- [ ] Backup database
- [ ] Verify AWS credentials
- [ ] Run dry run: `npm run convert:images`
- [ ] Review the preview output
- [ ] Execute conversion: `npm run convert:images:execute`
- [ ] Test website thoroughly
- [ ] Verify images load correctly
- [ ] Check page load speeds
- [ ] (Optional) Delete old images: `npm run convert:images:delete-old`
- [ ] Monitor for any issues
- [ ] Celebrate faster website! 🎉


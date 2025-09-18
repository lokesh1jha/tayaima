import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signUrlsInObject } from "@/lib/urlSigner";
import { createStorageProvider } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { generateSKU } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });
  if (!product) return new NextResponse("Not found", { status: 404 });
  
  // Sign URLs before returning
  const signedProduct = await signUrlsInObject(product, ['images']);
  return NextResponse.json(signedProduct);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, slug, description, images, categoryId, variants, meta } = body || {};

  try {
    // Get current product to compare images for cleanup
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { images: true }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Start a transaction to update product and variants atomically
    const updated = await prisma.$transaction(async (tx) => {
      // Update the product
      const product = await tx.product.update({
        where: { id },
        data: {
          name: name ?? undefined,
          slug: slug ?? undefined,
          description: description ?? undefined,
          images: Array.isArray(images) ? images : undefined,
          categoryId: categoryId === null ? null : categoryId ?? undefined,
          meta: meta === null ? null : meta ?? undefined,
        },
      });

      // Handle variants if provided
      if (Array.isArray(variants)) {
        // Get the product name for SKU generation (use updated name or existing name)
        const productName = name || product.name;
        
        // Get current variants from database
        const currentVariants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true }
        });
        const currentVariantIds = new Set(currentVariants.map(v => v.id));
        
        // Separate existing variants from new ones
        const existingVariants = variants.filter((v: any) => 
          v.id && !v.id.startsWith('temp-') && currentVariantIds.has(v.id)
        );
        const newVariants = variants.filter((v: any) => 
          !v.id || v.id.startsWith('temp-') || !currentVariantIds.has(v.id)
        );
        
        // Get IDs of variants that should remain (from the request)
        const variantsToKeep = new Set(existingVariants.map((v: any) => v.id));
        
        // Find variants to delete (existing in DB but not in request)
        const variantsToDelete = currentVariants.filter(v => !variantsToKeep.has(v.id));
        
        // Only delete variants that are not referenced in orders
        if (variantsToDelete.length > 0) {
          const variantIdsToDelete = variantsToDelete.map(v => v.id);
          
          // Check which variants are referenced in orders
          const referencedVariants = await tx.orderItem.findMany({
            where: { variantId: { in: variantIdsToDelete } },
            select: { variantId: true },
            distinct: ['variantId']
          });
          const referencedVariantIds = new Set(referencedVariants.map(item => item.variantId));
          
          // Only delete variants that are not referenced
          const safeToDeleteIds = variantIdsToDelete.filter(id => !referencedVariantIds.has(id));
          
          if (safeToDeleteIds.length > 0) {
            await tx.productVariant.deleteMany({
              where: { id: { in: safeToDeleteIds } }
            });
          }
        }
        
        // Update existing variants
        for (const variant of existingVariants) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              unit: variant.unit,
              amount: variant.amount,
              price: variant.price,
              stock: variant.stock,
              sku: variant.sku || generateSKU(productName, variant.unit, variant.amount),
            },
          });
        }
        
        // Create new variants
        if (newVariants.length > 0) {
          await tx.productVariant.createMany({
            data: newVariants.map((v: any) => ({
              productId: id,
              unit: v.unit,
              amount: v.amount,
              price: v.price,
              stock: v.stock,
              sku: v.sku || generateSKU(productName, v.unit, v.amount),
            })),
          });
        }
      }

      // Return updated product with variants
      return await tx.product.findUnique({
        where: { id },
        include: { variants: true, category: true },
      });
    });

    // Clean up removed images after successful database update
    if (Array.isArray(images)) {
      const removedImages = currentProduct.images.filter(img => !images.includes(img));
      if (removedImages.length > 0) {
        logger.info('Cleaning up removed images from product update', { 
          productId: id, 
          removedCount: removedImages.length 
        });
        const storage = createStorageProvider();
        
        // Delete removed images in background (don't wait or fail the request)
        Promise.allSettled(removedImages.map(async (imageUrl) => {
          try {
            if (imageUrl && (imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') || imageUrl.startsWith('/uploads/'))) {
              const storageKey = storage.extractKey(imageUrl);
              if (storageKey) {
                await storage.delete(storageKey);
                logger.storage('CLEANUP_SUCCESS', storageKey, { productId: id });
              }
            }
          } catch (error) {
            logger.error('Failed to clean up removed image', error, { imageUrl, productId: id });
          }
        })).then(() => {
          logger.info('Completed cleanup of removed images', { productId: id });
        });
      }
    }

    // Sign URLs before returning
    if (!updated) {
      return NextResponse.json({ error: "Product not found after update" }, { status: 404 });
    }
    const signedProduct = await signUrlsInObject(updated, ['images']);
    return NextResponse.json(signedProduct);
  } catch (e: any) {
    logger.error("Error updating product", e, { productId: id });
    return NextResponse.json({ error: e?.message ?? "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { id: productId } = await params;

  try {
    // First check if product exists and get its images
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    logger.info('Deleting product with images', { 
      productId, 
      productName: product.name, 
      imageCount: product.images.length 
    });

    // Delete associated images from storage
    const storage = createStorageProvider();
    const imageDeletePromises: Promise<void>[] = [];
    let deletedImagesCount = 0;
    let failedImagesCount = 0;

    for (const imageUrl of product.images) {
      if (imageUrl && (imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') || imageUrl.startsWith('/uploads/'))) {
        const deletePromise = (async () => {
          try {
            const storageKey = storage.extractKey(imageUrl);
            if (storageKey) {
              await storage.delete(storageKey);
              deletedImagesCount++;
              logger.storage('DELETE_SUCCESS', storageKey, { productId });
            } else {
              logger.warn('Could not extract key from image URL', { imageUrl, productId });
              failedImagesCount++;
            }
          } catch (error) {
            logger.error('Failed to delete image during product deletion', error, { imageUrl, productId });
            failedImagesCount++;
          }
        })();
        imageDeletePromises.push(deletePromise);
      }
    }

    // Wait for all image deletions to complete (don't fail if some images fail to delete)
    await Promise.allSettled(imageDeletePromises);

    // Delete the product (variants will be cascade deleted automatically)
    await prisma.product.delete({
      where: { id: productId },
    });

    const message = `Product "${product.name}" and ${product.variants.length} variant(s) deleted successfully. Images: ${deletedImagesCount} deleted, ${failedImagesCount} failed.`;
    logger.info('Product deletion completed', { 
      productId, 
      productName: product.name,
      variantsDeleted: product.variants.length,
      imagesDeleted: deletedImagesCount,
      imagesFailed: failedImagesCount 
    });

    return NextResponse.json({ 
      success: true, 
      message,
      details: {
        productName: product.name,
        variantsDeleted: product.variants.length,
        imagesDeleted: deletedImagesCount,
        imagesFailed: failedImagesCount
      }
    });
  } catch (error) {
    logger.error("Error deleting product", error, { productId });
    return new NextResponse("Failed to delete product", { status: 500 });
  }
}

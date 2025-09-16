import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signUrlsInObject } from "@/lib/urlSigner";
import { createStorageProvider } from "@/lib/storage";

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
          meta: meta ?? undefined,
        },
      });

      // Handle variants if provided
      if (Array.isArray(variants)) {
        // Delete existing variants
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        // Create new variants
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any) => ({
              productId: id,
              unit: v.unit,
              amount: v.amount,
              price: v.price,
              stock: v.stock,
              sku: v.sku || null,
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
        console.log(`Cleaning up ${removedImages.length} removed images from product ${id}`);
        const storage = createStorageProvider();
        
        // Delete removed images in background (don't wait or fail the request)
        Promise.allSettled(removedImages.map(async (imageUrl) => {
          try {
            if (imageUrl && (imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') || imageUrl.startsWith('/uploads/'))) {
              const storageKey = storage.extractKey(imageUrl);
              if (storageKey) {
                await storage.delete(storageKey);
                console.log(`Successfully cleaned up removed image: ${storageKey}`);
              }
            }
          } catch (error) {
            console.error(`Failed to clean up removed image ${imageUrl}:`, error);
          }
        })).then(() => {
          console.log(`Completed cleanup of removed images for product ${id}`);
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
    console.error("Error updating product:", e);
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

    console.log(`Deleting product "${product.name}" with ${product.images.length} images`);

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
              console.log(`Successfully deleted image: ${storageKey}`);
            } else {
              console.warn(`Could not extract key from image URL: ${imageUrl}`);
              failedImagesCount++;
            }
          } catch (error) {
            console.error(`Failed to delete image ${imageUrl}:`, error);
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
    console.log(message);

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
    console.error("Error deleting product:", error);
    return new NextResponse("Failed to delete product", { status: 500 });
  }
}

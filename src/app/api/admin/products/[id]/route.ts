import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  return NextResponse.json(product);
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

    return NextResponse.json(updated);
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
    // First check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Delete the product (this will cascade delete variants due to foreign key constraints)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

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
  return NextResponse.json({ product });
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
  const { name, slug, description, images, categoryId } = body || {};

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? undefined,
        slug: slug ?? undefined,
        description: description ?? undefined,
        images: Array.isArray(images) ? images : undefined,
        categoryId: categoryId === null ? null : categoryId ?? undefined,
      },
      include: { variants: true, category: true },
    });
    return NextResponse.json({ product: updated });
  } catch (e: any) {
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

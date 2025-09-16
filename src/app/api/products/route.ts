import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray, signUrlsInObject } from "@/lib/urlSigner";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  const page = Number(url.searchParams.get("page") || 1);
  const offset = (page - 1) * limit;
  const slug = url.searchParams.get("slug");
  const id = url.searchParams.get("id");
  const categoryId = url.searchParams.get("categoryId");

  // If id is provided, return single product by id
  if (id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Sign URLs before returning
    const signedProduct = await signUrlsInObject(product, ['images']);
    return NextResponse.json({ data: [signedProduct] });
  }

  // If slug is provided, return single product
  if (slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Sign URLs before returning
    const signedProduct = await signUrlsInObject(product, ['images']);
    return NextResponse.json({ data: [signedProduct] });
  }

  // Filter by category if provided
  if (categoryId) {
    const products = await prisma.product.findMany({
      where: { categoryId: categoryId },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    
    // Sign URLs before returning
    const signedProducts = await signUrlsInArray(products, ['images']);
    return NextResponse.json({ data: signedProducts });
  }

  // Otherwise return paginated products
  const products = await prisma.product.findMany({
    take: limit,
    skip: offset,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  // Sign URLs before returning
  const signedProducts = await signUrlsInArray(products, ['images']);
  return NextResponse.json({ data: signedProducts });
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ data: [product] });
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

    return NextResponse.json({ data: [product] });
  }

  // Filter by category if provided
  if (categoryId) {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return NextResponse.json({ data: products });
  }

  // Otherwise return paginated products
  const products = await prisma.product.findMany({
    take: limit,
    skip: offset,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: products });
}
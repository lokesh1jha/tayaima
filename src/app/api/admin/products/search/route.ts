import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray } from "@/lib/urlSigner";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("categoryId") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Add search filter if provided (minimum 3 characters)
    if (search && search.trim().length >= 3) {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: search.trim(),
            mode: "insensitive"
          }
        }
      ];
    }

    // Add category filter if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Fetch products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variants: {
          select: {
            id: true,
            unit: true,
            amount: true,
            price: true,
            stock: true,
            sku: true
          }
        }
      },
      orderBy: [
        { createdAt: "desc" }
      ],
      skip: offset,
      take: limit
    });

    // Sign URLs for images
    const signedProducts = await signUrlsInArray(products, ['images']);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: signedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        categoryId
      }
    });

  } catch (error) {
    console.error("Admin products search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
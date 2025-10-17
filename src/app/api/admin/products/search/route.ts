import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray } from "@/lib/urlSigner";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("categoryId") || "";
    const categoryIds = url.searchParams.getAll("categoryId");
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin Products Search Debug:', {
        categoryId,
        categoryIds,
        allParams: Object.fromEntries(url.searchParams.entries())
      });
    }

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
    if (categoryIds.length > 0) {
      // Handle multiple category IDs
      where.categoryId = { in: categoryIds };
    } else if (categoryId) {
      // Handle single category ID (backward compatibility)
      // Check if it contains commas (comma-separated format)
      if (categoryId.includes(',')) {
        const ids = categoryId.split(',').map(id => id.trim()).filter(id => id);
        if (ids.length > 0) {
          where.categoryId = { in: ids };
        }
      } else {
        where.categoryId = categoryId;
      }
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
        categoryId: categoryIds.length > 0 ? categoryIds : categoryId
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
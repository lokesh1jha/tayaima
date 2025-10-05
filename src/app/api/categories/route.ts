import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache for categories (they change infrequently)
let categoriesCache: { data: any; timestamp: number } | null = null;
const CATEGORIES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    // Check cache first
    if (categoriesCache && Date.now() - categoriesCache.timestamp < CATEGORIES_CACHE_TTL) {
      return NextResponse.json({ 
        ...categoriesCache.data, 
        meta: { cached: true, cachedAt: new Date(categoriesCache.timestamp).toISOString() }
      });
    }

    // Fetch from database with parent-child relationships
    const categories = await prisma.category.findMany({ 
      where: { isActive: true },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        parentId: true,
        sortOrder: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            sortOrder: true,
            _count: {
              select: { products: true }
            }
          },
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    const result = { 
      categories,
      meta: { 
        cached: false, 
        total: categories.length,
        fetchedAt: new Date().toISOString()
      }
    };

    // Update cache
    categoriesCache = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


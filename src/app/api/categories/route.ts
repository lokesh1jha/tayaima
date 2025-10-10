import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoriesCache, setCategoriesCache, isCategoriesCacheValid } from "@/lib/categoryCache";

export async function GET() {
  try {
    // Check cache first
    if (isCategoriesCacheValid()) {
      const cache = getCategoriesCache();
      return NextResponse.json({ 
        ...cache!.data, 
        meta: { cached: true, cachedAt: new Date(cache!.timestamp).toISOString() }
      });
    }

    // Fetch only parent categories with their children
    const categories = await prisma.category.findMany({ 
      where: { 
        isActive: true,
        parentId: null // Only fetch parent categories
      },
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
    setCategoriesCache(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


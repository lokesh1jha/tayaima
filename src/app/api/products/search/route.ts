import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray } from "@/lib/urlSigner";

// Cache for search results (they change infrequently)
let searchCache: { [key: string]: { data: any; timestamp: number } } = {};
const SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const limit = Number(url.searchParams.get("limit") || 20);

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        products: [],
        meta: { 
          query: query || "",
          total: 0,
          message: "Query must be at least 3 characters long"
        }
      });
    }

    const searchTerm = query.trim();
    const cacheKey = `search:${searchTerm}:${limit}`;

    // Check cache first
    if (searchCache[cacheKey] && Date.now() - searchCache[cacheKey].timestamp < SEARCH_CACHE_TTL) {
      return NextResponse.json({
        ...searchCache[cacheKey].data,
        meta: { 
          ...searchCache[cacheKey].data.meta,
          cached: true,
          cachedAt: new Date(searchCache[cacheKey].timestamp).toISOString()
        }
      });
    }

    // Search products by name with case-insensitive matching
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive"
        }
      },
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
            stock: true
          }
        }
      },
      orderBy: [
        // Prioritize exact matches first
        { name: "asc" }
      ],
      take: limit
    });

    // Sign URLs for images
    const signedProducts = await signUrlsInArray(products, ['images']);

    const result = {
      products: signedProducts,
      meta: {
        query: searchTerm,
        total: products.length,
        limit,
        cached: false,
        fetchedAt: new Date().toISOString()
      }
    };

    // Update cache
    searchCache[cacheKey] = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Products search error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}

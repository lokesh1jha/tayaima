import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray, signUrlsInObject } from "@/lib/urlSigner";

// Simple in-memory cache for products (consider Redis for production)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: Record<string, any>): string {
  return JSON.stringify(params);
}

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  const page = Number(url.searchParams.get("page") || 1);
  const offset = (page - 1) * limit;
  const slug = url.searchParams.get("slug");
  const id = url.searchParams.get("id");
  const categoryId = url.searchParams.get("categoryId");
  const categoryIds = url.searchParams.getAll("categoryId");
  const includeVariants = url.searchParams.get("includeVariants") === "true";

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Products API Debug:', {
      categoryId,
      categoryIds,
      allParams: Object.fromEntries(url.searchParams.entries())
    });
  }

  try {
    // Create cache key based on request parameters
    const cacheKey = getCacheKey({ limit, page, slug, id, categoryIds, includeVariants });
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    let products: any[];
    let isArray = true;

    // If id is provided, return single product by id
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { 
          variants: includeVariants,
          category: true // Include category for better data
        },
      });

      if (!product) {
        return new NextResponse("Product not found", { status: 404 });
      }

      products = [product];
      isArray = false;
    }
    // If slug is provided, return single product
    else if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { 
          variants: includeVariants,
          category: true
        },
      });

      if (!product) {
        return new NextResponse("Product not found", { status: 404 });
      }

      products = [product];
      isArray = false;
    }
    // Filter by categories if provided
    else if (categoryIds.length > 0 || categoryId) {
      // Get all category IDs to search (including children of parent categories)
      const allCategoryIds = new Set<string>();
      
      // Handle multiple category IDs from getAll
      const idsToProcess = categoryIds.length > 0 ? categoryIds : [];
      
      // Handle single category ID with comma-separated values
      if (categoryId && categoryIds.length === 0) {
        if (categoryId.includes(',')) {
          idsToProcess.push(...categoryId.split(',').map(id => id.trim()).filter(id => id));
        } else {
          idsToProcess.push(categoryId);
        }
      }
      
      for (const catId of idsToProcess) {
        // First, check if this is a parent category (super category)
        const category = await prisma.category.findUnique({
          where: { id: catId }
        });

        if (!category) {
          continue; // Skip invalid categories
        }

        // Check if this category has children (is a parent category)
        const childCategories = await prisma.category.findMany({
          where: { 
            parentId: catId
          },
          select: { id: true }
        });

        // If it's a parent category with children, add all sub-categories
        if (childCategories.length > 0) {
          childCategories.forEach(child => allCategoryIds.add(child.id));
        } else {
          // If it's a leaf category (no children), add it directly
          allCategoryIds.add(catId);
        }
      }

      // Get products from all collected category IDs
      if (allCategoryIds.size > 0) {
        products = await prisma.product.findMany({
          where: { 
            categoryId: { in: Array.from(allCategoryIds) }
          },
          include: { 
            variants: includeVariants,
            category: true
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });
      } else {
        products = [];
      }
    }
    // Otherwise return paginated products
    else {
      products = await prisma.product.findMany({
        take: limit,
        skip: offset,
        include: { 
          variants: includeVariants,
          category: true
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Sign URLs before returning (this is the expensive operation)
    const signedProducts = isArray 
      ? await signUrlsInArray(products, ['images'])
      : await signUrlsInObject(products[0], ['images']);

    const result = { 
      data: isArray ? signedProducts : [signedProducts],
      meta: {
        page,
        limit,
        total: products.length,
        cached: false
      }
    };

    // Cache the result
    setCachedData(cacheKey, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
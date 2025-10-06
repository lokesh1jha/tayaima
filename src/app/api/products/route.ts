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
  const includeVariants = url.searchParams.get("includeVariants") === "true";

  try {
    // Create cache key based on request parameters
    const cacheKey = getCacheKey({ limit, page, slug, id, categoryId, includeVariants });
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    let products;
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
    // Filter by category if provided
    else if (categoryId) {
      // First, check if this is a parent category (super category)
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return new NextResponse("Category not found", { status: 404 });
      }

      // Check if this category has children (is a parent category)
      const childCategories = await prisma.category.findMany({
        where: { 
          parentId: categoryId
        },
        select: { id: true }
      });

      // If it's a parent category with children, get products from all sub-categories
      if (childCategories.length > 0) {
        const childCategoryIds = childCategories.map(child => child.id);
        products = await prisma.product.findMany({
          where: { 
            categoryId: { in: childCategoryIds }
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
        // If it's a leaf category (no children), get products directly assigned to it
        products = await prisma.product.findMany({
          where: { categoryId: categoryId },
          include: { 
            variants: includeVariants,
            category: true
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });
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
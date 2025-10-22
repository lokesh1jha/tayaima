import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signUrlsInArray } from '@/lib/urlSigner';
import { cachedQuery } from '@/lib/cache';

export const revalidate = 900; // 15 minutes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get parent categories
    const categories = await cachedQuery(
      'homepage:categories',
      () => prisma.category.findMany({
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
            },
            orderBy: { sortOrder: "asc" }
          },
        }
      }),
      1800 // 30 minutes
    );

    const parentCategories = categories.filter(cat => !cat.parentId).slice(0, 3);
    
    const categorySections = await Promise.all(
      parentCategories.map(async (category) => {
        // Get child category IDs for this parent
        const childCategoryIds = category.children?.map(child => child.id) || [];
        
        // Cache products per category (15 minute cache)
        const rawProducts = await cachedQuery(
          `homepage:category-products:${category.id}`,
          () => prisma.product.findMany({
            where: {
              OR: [
                { categoryId: category.id }, // Products directly in parent
                { categoryId: { in: childCategoryIds } } // Products in child categories
              ]
            },
            include: { variants: true },
            take: 6, // Reduced from 10 to 6 for better performance
            orderBy: { createdAt: "desc" },
          }),
          900 // 15 minutes
        );
        
        // Sign URLs for category products
        const products = await signUrlsInArray(rawProducts, ['images']);
        return { category, products };
      })
    );

    return NextResponse.json({ sections: categorySections });
  } catch (error) {
    console.error('Error fetching category sections:', error);
    return NextResponse.json({ sections: [] }, { status: 200 });
  }
}


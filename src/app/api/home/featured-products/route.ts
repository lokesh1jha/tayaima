import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signUrlsInArray } from '@/lib/urlSigner';
import { cachedQuery } from '@/lib/cache';

export const revalidate = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawFeaturedProducts = await cachedQuery(
      'homepage:featured-products',
      () => prisma.product.findMany({
        take: 5,
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      }),
      600 // 10 minutes
    );

    // Sign URLs for featured products
    const featuredProducts = await signUrlsInArray(rawFeaturedProducts, ['images']);

    return NextResponse.json({ products: featuredProducts });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}


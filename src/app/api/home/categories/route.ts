import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedQuery } from '@/lib/cache';

export const revalidate = 1800; // 30 minutes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
      }),
      1800 // 30 minutes
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}


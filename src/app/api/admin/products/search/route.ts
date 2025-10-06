import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const limit = Number(url.searchParams.get("limit") || 10);

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
        },
        _count: {
          select: { variants: true }
        }
      },
      orderBy: [
        // Prioritize exact matches first
        { name: "asc" }
      ],
      take: limit
    });

    return NextResponse.json({
      products,
      meta: {
        query: searchTerm,
        total: products.length,
        limit
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

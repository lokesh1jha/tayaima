import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray } from "@/lib/urlSigner";

// GET active banners (public route)
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Sign image URLs
    const signedBanners = await signUrlsInArray(banners, ['imageUrl']);

    return NextResponse.json({ banners: signedBanners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}


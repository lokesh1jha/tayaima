import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray } from "@/lib/urlSigner";

// GET all banners
export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const banners = await prisma.banner.findMany({
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

// POST create new banner
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { imageUrl, title, description, link, sortOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title: title || null,
        description: description || null,
        link: link || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStorageProvider } from "@/lib/storage";
import { signUrlsInObject } from "@/lib/urlSigner";

// GET single banner
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Sign image URL
    const signedBanner = await signUrlsInObject(banner, ['imageUrl']);

    return NextResponse.json({ banner: signedBanner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// PATCH update banner
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { imageUrl, title, description, link, sortOrder, isActive } = body;

    // Get current banner to check if image changed
    const currentBanner = await prisma.banner.findUnique({
      where: { id },
      select: { imageUrl: true }
    });

    if (!currentBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Update banner
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        imageUrl: imageUrl ?? undefined,
        title: title === null ? null : title ?? undefined,
        description: description === null ? null : description ?? undefined,
        link: link === null ? null : link ?? undefined,
        sortOrder: sortOrder ?? undefined,
        isActive: isActive ?? undefined,
      },
    });

    // Delete old image from S3 if image changed
    if (imageUrl && currentBanner.imageUrl !== imageUrl) {
      const oldImageUrl = currentBanner.imageUrl;
      if (oldImageUrl && (oldImageUrl.includes('.s3.') || oldImageUrl.includes('amazonaws.com') || oldImageUrl.startsWith('/uploads/'))) {
        try {
          const storage = createStorageProvider();
          const storageKey = storage.extractKey(oldImageUrl);
          if (storageKey) {
            await storage.delete(storageKey);
            console.log('Deleted old banner image:', storageKey);
          }
        } catch (error) {
          console.error('Failed to delete old banner image:', error);
          // Don't fail the request if image deletion fails
        }
      }
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE banner
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    // Get banner to delete image from S3
    const banner = await prisma.banner.findUnique({
      where: { id },
      select: { imageUrl: true }
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Delete banner from database
    await prisma.banner.delete({
      where: { id },
    });

    // Delete image from S3
    if (banner.imageUrl && (banner.imageUrl.includes('.s3.') || banner.imageUrl.includes('amazonaws.com') || banner.imageUrl.startsWith('/uploads/'))) {
      try {
        const storage = createStorageProvider();
        const storageKey = storage.extractKey(banner.imageUrl);
        if (storageKey) {
          await storage.delete(storageKey);
          console.log('Deleted banner image:', storageKey);
        }
      } catch (error) {
        console.error('Failed to delete banner image:', error);
        // Don't fail the request if image deletion fails
      }
    }

    return NextResponse.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}


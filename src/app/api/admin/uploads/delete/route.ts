import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStorageProvider } from "@/lib/storage";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Initialize storage provider
    const storage = createStorageProvider();
    
    // Extract storage key from URL
    const storageKey = storage.extractKey(url);
    if (!storageKey) {
      return NextResponse.json({ error: "Invalid storage URL" }, { status: 400 });
    }

    // Delete using storage provider
    await storage.delete(storageKey);

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json(
      { error: "Failed to delete image" }, 
      { status: 500 }
    );
  }
}

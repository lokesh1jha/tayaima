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

    console.log('Attempting to delete image with URL:', url);

    // Initialize storage provider
    const storage = createStorageProvider();
    
    // Extract storage key from URL
    const storageKey = storage.extractKey(url);
    console.log('Extracted storage key:', storageKey);
    
    if (!storageKey) {
      console.error('Could not extract storage key from URL:', url);
      return NextResponse.json({ 
        error: `Invalid storage URL format. URL: ${url}` 
      }, { status: 400 });
    }

    // Delete using storage provider
    await storage.delete(storageKey);
    console.log('Successfully deleted from storage:', storageKey);

    return NextResponse.json({ 
      success: true, 
      message: `Image deleted successfully from storage: ${storageKey}` 
    });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json(
      { 
        error: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, 
      { status: 500 }
    );
  }
}

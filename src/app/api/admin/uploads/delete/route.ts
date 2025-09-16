import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStorageProvider } from "@/lib/storage";
import { logger } from "@/lib/logger";

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

    logger.api('DELETE', '/api/admin/uploads/delete', undefined, { url });

    // Initialize storage provider
    const storage = createStorageProvider();
    
    // Extract storage key from URL
    const storageKey = storage.extractKey(url);
    logger.debug('Extracted storage key from URL', { url, storageKey });
    
    if (!storageKey) {
      logger.error('Could not extract storage key from URL', null, { url });
      return NextResponse.json({ 
        error: `Invalid storage URL format. URL: ${url}` 
      }, { status: 400 });
    }

    // Delete using storage provider
    await storage.delete(storageKey);
    logger.storage('DELETE_SUCCESS', storageKey);

    return NextResponse.json({ 
      success: true, 
      message: `Image deleted successfully from storage: ${storageKey}` 
    });
  } catch (error) {
    logger.error('Delete Error in uploads/delete API', error);
    return NextResponse.json(
      { 
        error: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, 
      { status: 500 }
    );
  }
}

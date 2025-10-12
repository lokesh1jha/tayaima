import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStorageProvider, generateStorageKey, validateFile } from "@/lib/storage";
import { signUrls } from "@/lib/urlSigner";

export const runtime = "nodejs";
export const maxDuration = 30; // Allow up to 30 seconds for S3 uploads

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const form = await req.formData();
    const files = form.getAll("file");
    const prefix = form.get("prefix")?.toString() || 'products'; // Allow custom prefix (e.g., 'ad-banner')
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Initialize storage provider
    const storage = createStorageProvider();
    const urls: string[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      
      // Validate file
      const validation = validateFile(f);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate storage key with custom prefix
      const storageKey = generateStorageKey(f.name, prefix);
      
      // Upload using storage provider
      const url = await storage.upload(buffer, storageKey, f.type);
      urls.push(url);
    }

    // Return base URLs (not signed) - they will be signed when displayed
    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: "Failed to upload files" }, 
      { status: 500 }
    );
  }
}



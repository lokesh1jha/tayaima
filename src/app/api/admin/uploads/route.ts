import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("file");
  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const f of files) {
    if (!(f instanceof File)) continue;
    const arrayBuffer = await f.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(f.name) || ".bin";
    const base = path.basename(f.name, ext).replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 32) || "file";
    const unique = `${base}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, unique);
    await fs.writeFile(filePath, buffer);
    urls.push(`/uploads/${unique}`);
  }

  return NextResponse.json({ urls });
}



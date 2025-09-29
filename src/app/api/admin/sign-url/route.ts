import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signUrl } from "@/lib/urlSigner";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const signedUrl = await signUrl(url);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Sign URL Error:', error);
    return NextResponse.json(
      { error: "Failed to sign URL" }, 
      { status: 500 }
    );
  }
}

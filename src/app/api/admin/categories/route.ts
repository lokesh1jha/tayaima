import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { name, slug, description } = await req.json();
    if (!name || !slug) return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    const created = await prisma.category.create({ data: { name, slug, description } });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid data" }, { status: 400 });
  }
}


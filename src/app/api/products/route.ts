import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  const page = Number(url.searchParams.get("page") || 1);
  const offset = (page - 1) * limit;

  const products = await prisma.product.findMany({
    take: limit,
    skip: offset,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: products });
}
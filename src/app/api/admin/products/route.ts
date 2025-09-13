import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  // body: { name, slug, description, images, variants: [{ unit, amount, price, stock, sku }] }
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      images: body.images || [],
      variants: {
        create: (body.variants ?? []).map((v: any) => ({
          unit: v.unit,
          amount: v.amount,
          price: v.price,
          stock: v.stock ?? 0,
          sku: v.sku ?? null,
        })),
      },
      meta: body.meta ?? undefined,
    },
    include: { variants: true },
  });

  return NextResponse.json(product);
}
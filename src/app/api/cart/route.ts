import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ items: [] });

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { variant: true } } },
  });

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(req: Request) {
  const body = await req.json(); // { sessionId, variantId, qty }
  const { sessionId, variantId, qty } = body || {};
  if (!sessionId || !variantId || !qty) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  let cart = await prisma.cart.upsert({
    where: { sessionId },
    create: { sessionId },
    update: {},
  });

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return new NextResponse("Variant not found", { status: 404 });

  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, variantId } });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + qty, unitPrice: variant.price },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity: qty,
        unitPrice: variant.price,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
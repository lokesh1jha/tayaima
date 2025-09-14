import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addToCartSchema, removeFromCartSchema, validateRequestBody } from "@/lib/validations";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ items: [] });

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateRequestBody(addToCartSchema, body);
    const { sessionId, variantId, qty } = validatedData;

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

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    return NextResponse.json(updated ?? { items: [] });
  } catch (error) {
    console.error("Error adding to cart:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateRequestBody(removeFromCartSchema, body);
    const { sessionId, itemId } = validatedData;

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!cart) {
      return new NextResponse("Cart not found", { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    return NextResponse.json(updated ?? { items: [] });
  } catch (error) {
    console.error("Error removing from cart:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}
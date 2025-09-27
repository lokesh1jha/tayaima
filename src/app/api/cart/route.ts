import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addToCartSchema, removeFromCartSchema, validateRequestBody } from "@/lib/validations";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  let cart = null;
  
  if (session?.user?.id) {
    // For authenticated users, verify user exists first
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (user) {
      // Find cart by userId only if user exists
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });
    }
    // If user doesn't exist, cart remains null (empty cart returned)
  } else if (sessionId) {
    // For guest users, find cart by sessionId
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
  }

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateRequestBody(addToCartSchema, body);
    const { sessionId, variantId, qty } = validatedData;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    let cart;
    if (session?.user?.id) {
      // For authenticated users, first verify user exists
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });

      if (!user) {
        return new NextResponse("Session expired. Please log in again.", { status: 401 });
      }

      // Find or create cart for authenticated user
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            sessionId: `user_${session.user.id}`,
            userId: session.user.id,
          },
        });
      }
    } else {
      // For guest users, use sessionId
      cart = await prisma.cart.upsert({
        where: { sessionId },
        create: { sessionId },
        update: {},
      });
    }

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
    // Only log cart errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error adding to cart:", error);
    }
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

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    let cart;
    if (session?.user?.id) {
      // For authenticated users, find cart by userId
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
        include: { items: true },
      });
    } else {
      // For guest users, find cart by sessionId
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });
    }

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
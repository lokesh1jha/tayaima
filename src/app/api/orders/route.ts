import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrderSchema, validateRequestBody } from "@/lib/validations";
import { emailService } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateRequestBody(createOrderSchema, body);
    const { sessionId, name, phone, address, city, pincode, items, paymentMode } = validatedData;

    // Check if user is logged in
    const session = await getServerSession(authOptions) as any;
    const userId = session?.user?.id || null;

    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({ where: { id: { in: variantIds } } });
    const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]));
    let total = 0;
    
    for (const it of items) {
      const v = variantMap[it.variantId];
      if (!v) return new NextResponse("Invalid variant", { status: 400 });
      total += v.price * it.quantity;
    }

    const order = await prisma.order.create({
      data: {
        userId, // Link order to user if logged in
        customerName: name,
        phone,
        address,
        city,
        pincode,
        totalAmount: total,
        paymentMode: paymentMode || "COD",
        items: {
          create: items.map((it) => ({
            variantId: it.variantId,
            quantity: it.quantity,
            unitPrice: variantMap[it.variantId].price,
            total: variantMap[it.variantId].price * it.quantity,
          })),
        },
      },
      include: { 
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // naive stock decrement; consider transactions in production
    for (const it of items) {
      await prisma.productVariant.update({
        where: { id: it.variantId },
        data: { stock: { decrement: it.quantity } },
      });
    }

    if (sessionId) {
      // Delete cart items first, then cart to avoid foreign key constraint violation
      const carts = await prisma.cart.findMany({ where: { sessionId } });
      for (const cart of carts) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
      await prisma.cart.deleteMany({ where: { sessionId } });
    }

    // Send order confirmation email (non-blocking)
    try {
      // Get user email if logged in, otherwise use phone as fallback
      let customerEmail = null;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        customerEmail = user?.email;
      }
      
      // For now, we'll skip email if no user email is available
      // In a real app, you might want to collect email during checkout
      if (customerEmail) {
        await emailService.sendOrderConfirmationEmail(
          customerEmail,
          order.id,
          order.customerName,
          order.totalAmount,
          order.items
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the order
      console.error('Failed to send order confirmation email:', emailError);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
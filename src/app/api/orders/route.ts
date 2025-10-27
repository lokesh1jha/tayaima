import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrderSchema, validateRequestBody } from "@/lib/validations";
import { emailService } from "@/lib/email";
import { notificationService } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateRequestBody(createOrderSchema, body);
    const { sessionId, name, phone, address, city, pincode, items, paymentMode, deliveryMethod } = validatedData;

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
        deliveryMethod: deliveryMethod || "DELIVERY", // Default to DELIVERY if not specified
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
      const orderDetails = {
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        address: order.address,
        city: order.city || undefined,
        pincode: order.pincode || undefined,
        items: order.items.map(item => ({
          productName: item.variant.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const notificationResult = await notificationService.sendNotification(
        orderDetails,
        userId,
        'confirmation'
      );

      if (notificationResult.errors.length > 0) {
        console.warn('Notification errors:', notificationResult.errors);
      }

      // Send admin notification for new order
      try {
        // For pickup orders, email is stored in phone field
        let customerEmail = session?.user?.email || 'N/A';
        let customerPhone = order.phone;
        
        if (order.deliveryMethod === 'PICKUP' && order.phone.includes('@')) {
          customerEmail = order.phone; // Email is in phone field for pickup
          customerPhone = session?.user?.phone || 'Not provided'; // Get actual phone from session if available
        }
        
        await emailService.sendAdminNewOrderNotification(
          order.id,
          order.customerName,
          customerEmail,
          customerPhone,
          order.totalAmount,
          order.deliveryMethod,
          order.address,
          order.city || undefined,
          order.pincode || undefined,
          orderDetails.items
        );
      } catch (adminNotifError) {
        console.error('Failed to send admin notification:', adminNotifError);
      }
    } catch (notificationError) {
      // Log notification error but don't fail the order
      console.error('Failed to send order confirmation notification:', notificationError);
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
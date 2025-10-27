import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: orderId } = await params;

  try {
    const body = await req.json();
    const { reason } = body || {};

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Only allow cancellation if order is still PLACED
    if (order.status !== "PLACED") {
      return new NextResponse("Order cannot be cancelled", { status: 400 });
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "CANCELLED",
        cancellationReason: reason || "Cancelled by customer",
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

    // Restore stock for cancelled items
    for (const item of updatedOrder.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Send user email notification for cancellation (non-blocking)
    try {
      // Get user email (for pickup orders, email is in phone field)
      let userEmail = session?.user?.email;
      if (!userEmail && updatedOrder.deliveryMethod === 'PICKUP' && updatedOrder.phone?.includes('@')) {
        userEmail = updatedOrder.phone;
      }

      if (userEmail) {
        await emailService.sendOrderStatusUpdateEmail(
          userEmail,
          updatedOrder.id,
          updatedOrder.customerName,
          'CANCELLED',
          updatedOrder.items
        );
      }
    } catch (notifError) {
      console.error('Failed to send user cancellation notification:', notifError);
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

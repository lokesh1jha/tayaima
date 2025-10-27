import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateOrderStatusSchema, validateRequestBody } from "@/lib/validations";
import { emailService } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id: orderId } = await params;
    const body = await req.json();
    const validatedData = validateRequestBody(updateOrderStatusSchema, body);
    const { status, cancellationReason } = validatedData;

    // If cancelling, restore stock
    if (status === "CANCELLED") {
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (existingOrder && existingOrder.status !== "CANCELLED") {
        // Restore stock for cancelled items
        for (const item of existingOrder.items) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        cancellationReason: status === "CANCELLED" ? cancellationReason : null,
      },
      include: {
        user: {
          select: { email: true },
        },
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

    // Send user email notification for status updates (non-blocking)
    try {
      // Get user email from order (for pickup orders, email is in phone field)
      let userEmail = order.user?.email;
      if (!userEmail && order.deliveryMethod === 'PICKUP' && order.phone?.includes('@')) {
        userEmail = order.phone;
      }

      if (userEmail) {
        await emailService.sendOrderStatusUpdateEmail(
          userEmail,
          order.id,
          order.customerName,
          status,
          order.items
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the status update
      console.error('Failed to send order status update email:', emailError);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}

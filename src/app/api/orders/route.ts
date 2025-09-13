import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  // { sessionId, name, phone, address, city?, pincode?, items: [{variantId, quantity}] , paymentMode: 'COD' }
  const { sessionId, name, phone, address, city, pincode, items, paymentMode } = body || {};
  if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const variantIds = items.map((i: any) => i.variantId);
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
      customerName: name,
      phone,
      address,
      city,
      pincode,
      totalAmount: total,
      paymentMode: paymentMode || "COD",
      items: {
        create: items.map((it: any) => ({
          variantId: it.variantId,
          quantity: it.quantity,
          unitPrice: variantMap[it.variantId].price,
          total: variantMap[it.variantId].price * it.quantity,
        })),
      },
    },
    include: { items: true },
  });

  // naive stock decrement; consider transactions in production
  for (const it of items) {
    await prisma.productVariant.update({
      where: { id: it.variantId },
      data: { stock: { decrement: it.quantity } },
    });
  }

  if (sessionId) {
    await prisma.cart.deleteMany({ where: { sessionId } });
  }

  return NextResponse.json(order);
}
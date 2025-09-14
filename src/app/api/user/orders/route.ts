import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  
  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}



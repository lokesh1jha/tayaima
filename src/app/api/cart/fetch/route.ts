import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for cart fetch request
const CartFetchSchema = z.object({
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    const { sessionId } = CartFetchSchema.parse(body);
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    let cart = null;
    
    if (session?.user?.id) {
      // For authenticated users, verify user exists first
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });

      if (!user) {
        // User not found - session is stale
        return NextResponse.json(
          { 
            error: 'Session expired. Please log in again.',
            code: 'STALE_SESSION'
          },
          { status: 401 }
        );
      }
      
      // Find cart by userId
      cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });
    } else if (sessionId) {
      // For guest users, find cart by sessionId
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });
    }

    return NextResponse.json(cart ?? { items: [] });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching cart:", error);
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

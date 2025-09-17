import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CartSyncRequest, CartSyncResponse } from '@/types/cart';
import { z } from 'zod';

// Validation schema for cart sync request
const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantUnit: z.string(),
  variantAmount: z.number(),
  price: z.number(),
  quantity: z.number().min(1),
  imageUrl: z.string().optional(),
  maxStock: z.number(),
});

const CartSyncSchema = z.object({
  items: z.array(CartItemSchema),
  total: z.number().min(0),
  itemCount: z.number().min(0),
  lastUpdated: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CartSyncSchema.parse(body);

    const userId = session.user.id;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get user's current cart by userId (find first cart for this user)
      const existingCart = await tx.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      // Create cart if it doesn't exist
      let cart = existingCart;
      if (!cart) {
        cart = await tx.cart.create({
          data: {
            sessionId: `user_${userId}`, // Use userId as sessionId for logged-in users
            userId,
          },
          include: { items: true },
        });
      }

      // Validate that all products and variants exist and have sufficient stock
      const productVariantChecks = await Promise.all(
        validatedData.items.map(async (item) => {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          if (!variant) {
            throw new Error(`Product variant ${item.variantId} not found`);
          }

          if (variant.product.id !== item.productId) {
            throw new Error(`Variant ${item.variantId} does not belong to product ${item.productId}`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${variant.product.name}. Available: ${variant.stock}, Requested: ${item.quantity}`
            );
          }

          return {
            variant,
            requestedQuantity: item.quantity,
          };
        })
      );

      // Clear existing cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Add new cart items
      if (validatedData.items.length > 0) {
        await tx.cartItem.createMany({
          data: validatedData.items.map((item) => ({
            cartId: cart.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        });
      }

      // Get updated cart with items
      const updatedCart = await tx.cart.findUnique({
        where: { id: cart.id },
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

      return updatedCart;
    });

    // Prepare response with updated cart data
    if (!result) {
      throw new Error('Failed to update cart');
    }

    const response: CartSyncResponse = {
      success: true,
      message: 'Cart synced successfully',
      updatedItems: result.items.map((item) => ({
        id: `${item.variant.productId}-${item.variantId}`,
        productId: item.variant.productId,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantUnit: item.variant.unit,
        variantAmount: item.variant.amount,
        price: item.unitPrice,
        quantity: item.quantity,
        imageUrl: item.variant.product.images[0] || undefined,
        maxStock: item.variant.stock,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cart sync error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid cart data',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current cart state
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const cart = await prisma.cart.findFirst({
      where: { userId },
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

    if (!cart) {
      return NextResponse.json({
        success: true,
        items: [],
        total: 0,
        itemCount: 0,
      });
    }

    const total = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const cartData = {
      success: true,
      items: cart.items.map((item) => ({
        id: `${item.variant.productId}-${item.variantId}`,
        productId: item.variant.productId,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantUnit: item.variant.unit,
        variantAmount: item.variant.amount,
        price: item.unitPrice,
        quantity: item.quantity,
        imageUrl: item.variant.product.images[0] || undefined,
        maxStock: item.variant.stock,
      })),
      total,
      itemCount,
      lastUpdated: cart.updatedAt.getTime(),
    };

    return NextResponse.json(cartData);
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

import { z } from "zod";

// Product validation schemas
export const productVariantSchema = z.object({
  unit: z.enum(["PIECE", "KG", "G", "LITER", "ML", "OTHER"]),
  amount: z.number().positive(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  meta: z.record(z.any()).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

// Order validation schemas
export const orderItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

export const createOrderSchema = z.object({
  sessionId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().min(1, "Phone or email is required").max(255), // Can be phone or email for pickup orders
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  paymentMode: z.enum(["COD", "PHONEPE"]).default("COD"),
  deliveryMethod: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  qty: z.number().int().positive("Quantity must be positive"),
});

export const removeFromCartSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
});

// Order status validation
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  cancellationReason: z.string().optional().nullable(),
});

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Admin validation schemas
export const adminSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(255),
  storeDescription: z.string().max(1000).optional(),
  storeEmail: z.string().email("Invalid email address"),
  storePhone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  storeAddress: z.string().min(1, "Address is required").max(500),
  currency: z.enum(["INR", "USD", "EUR"]).default("INR"),
  taxRate: z.number().min(0).max(100),
  shippingCost: z.number().min(0),
  minOrderAmount: z.number().min(0),
});

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}

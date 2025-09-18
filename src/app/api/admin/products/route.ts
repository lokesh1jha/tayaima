import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProductSchema } from "@/lib/validations";
import { z } from "zod";
import { signUrlsInObject } from "@/lib/urlSigner";
import { generateSlug, generateSKU } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createProductSchema.extend({ categoryId: z.string().optional() });
    const data = (parsed as any).parse(body);

    // Generate slug from product name if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      // Add timestamp to make slug unique
      const timestamp = Date.now().toString().slice(-4);
      const uniqueSlug = `${slug}-${timestamp}`;
      
      const product = await prisma.product.create({
        data: {
          name: data.name,
          slug: uniqueSlug,
          description: data.description,
          images: data.images,
          meta: data.meta,
          categoryId: data.categoryId ?? null,
          variants: {
            create: data.variants.map((v: any) => ({
              unit: v.unit,
              amount: v.amount,
              price: v.price,
              stock: v.stock,
              sku: v.sku || generateSKU(data.name, v.unit, v.amount),
            })),
          },
        },
        include: { variants: true, category: true },
      });

      // Sign URLs before returning
      const signedProduct = await signUrlsInObject(product, ['images']);
      return NextResponse.json(signedProduct);
    } else {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          images: data.images,
          meta: data.meta,
          categoryId: data.categoryId ?? null,
          variants: {
            create: data.variants.map((v: any) => ({
              unit: v.unit,
              amount: v.amount,
              price: v.price,
              stock: v.stock,
              sku: v.sku || generateSKU(data.name, v.unit, v.amount),
            })),
          },
        },
        include: { variants: true, category: true },
      });

      // Sign URLs before returning
      const signedProduct = await signUrlsInObject(product, ['images']);
      return NextResponse.json(signedProduct);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Invalid data" }, { status: 400 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify, generateUniqueSlug } from "@/lib/slugify";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ 
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ],
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            sortOrder: true,
            isActive: true,
            _count: {
              select: { products: true }
            }
          },
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: { products: true }
        }
      }
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { 
      name, 
      slug: providedSlug, 
      description, 
      icon, 
      parentId, 
      sortOrder, 
      isActive 
    } = await req.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Generate slug if not provided or auto-generate from name
    let slug = providedSlug?.trim() || slugify(name);
    
    // Ensure slug is unique
    const existingSlugs = await prisma.category.findMany({
      select: { slug: true }
    }).then(categories => categories.map(c => c.slug));
    
    slug = generateUniqueSlug(slug, existingSlugs);

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });
      if (!parentCategory) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
    }

    const created = await prisma.category.create({ 
      data: { 
        name: name.trim(), 
        slug, 
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("Error creating category:", e);
    
    if (e.code === 'P2002') {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }
    
    return NextResponse.json({ error: e?.message ?? "Failed to create category" }, { status: 400 });
  }
}


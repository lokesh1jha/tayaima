import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify, generateUniqueSlug } from "@/lib/slugify";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Generate slug if not provided or auto-generate from name
    let slug = providedSlug?.trim() || slugify(name);
    
    // Ensure slug is unique (excluding current category)
    const existingSlugs = await prisma.category.findMany({
      where: { 
        id: { not: id }
      },
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
      // Prevent setting self as parent
      if (parentId === id) {
        return NextResponse.json({ error: "Category cannot be its own parent" }, { status: 400 });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
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
    
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Error updating category:", e);
    
    if (e.code === 'P2002') {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }
    
    return NextResponse.json({ error: e?.message ?? "Failed to update category" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { id } = await params;
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json({ 
        error: `Cannot delete "${existingCategory.name}" because it has ${existingCategory._count.products} product(s). You need to change the category of these products first before deleting this category.`,
        productCount: existingCategory._count.products,
        canDelete: false
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (e: any) {
    console.error("Error deleting category:", e);
    return NextResponse.json({ error: e?.message ?? "Failed to delete category" }, { status: 400 });
  }
}

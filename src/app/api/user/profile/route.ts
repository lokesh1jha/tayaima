import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id }, 
    select: { id: true, name: true, email: true, phone: true, phoneVerified: true, emailVerified: true } 
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const { name, phone } = body || {};
  
  // Validate input
  if (name && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
  }
  
  if (phone && (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone))) {
    return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
  }
  
  // Build update data
  const updateData: any = {};
  if (name) updateData.name = name.trim();
  if (phone) updateData.phone = phone;
  
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  
  const updated = await prisma.user.update({ 
    where: { id: session.user.id }, 
    data: updateData, 
    select: { id: true, name: true, email: true, phone: true, phoneVerified: true, emailVerified: true } 
  });
  return NextResponse.json({ user: updated });
}



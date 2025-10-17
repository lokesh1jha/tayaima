import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true }
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body ?? {};
  
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }
  
  // Email is now optional, but if provided, check for uniqueness
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }
  }
  
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({ 
    data: { 
      name, 
      email: email || null, // Allow null email
      passwordHash 
    } 
  });
  
  return NextResponse.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    } 
  }, { status: 201 });
}
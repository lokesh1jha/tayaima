import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { validatePhoneNumber, normalizePhoneNumber } from "@/lib/otp";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, createdAt: true }
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body ?? {};

    // Validate required fields
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone number is required" }, { status: 400 });
    }

    // Validate phone number if provided
    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Normalize phone number if provided
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;

    // Check if user already exists
    const existingConditions = [];
    if (email) {
      existingConditions.push({ email });
    }
    if (normalizedPhone) {
      existingConditions.push({ phone: normalizedPhone });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: existingConditions
      }
    });

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
      }
      if (existing.phone === normalizedPhone) {
        return NextResponse.json({ error: "User with this phone number already exists" }, { status: 409 });
      }
    }

    // Create user
    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ 
      data: { 
        name, 
        email: email || null, 
        phone: normalizedPhone,
        passwordHash 
      } 
    });

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        name: user.name 
      } 
    }, { status: 201 });

  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
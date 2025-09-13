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
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}
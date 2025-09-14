import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true } });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const { name } = body || {};
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id: session.user.id }, data: { name: name.trim() }, select: { id: true, name: true, email: true } });
  return NextResponse.json({ user: updated });
}



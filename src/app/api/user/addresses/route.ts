import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const { name, phone, line1, line2, city, state, pincode, isDefault } = body || {};
  if (!line1 || !city) return NextResponse.json({ error: "line1 and city are required" }, { status: 400 });
  const created = await prisma.address.create({
    data: { userId: session.user.id, name, phone, line1, line2, city, state, pincode, isDefault: Boolean(isDefault) },
  });
  return NextResponse.json({ address: created }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const { id, name, phone, line1, line2, city, state, pincode, isDefault } = body || {};
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Ensure the address belongs to the user
  const addr = await prisma.address.findUnique({ where: { id } });
  if (!addr || addr.userId !== session.user.id) return new NextResponse("Not found", { status: 404 });
  const updated = await prisma.address.update({
    where: { id },
    data: { name, phone, line1, line2, city, state, pincode, isDefault: isDefault === undefined ? undefined : Boolean(isDefault) },
  });
  return NextResponse.json({ address: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const { id } = body || {};
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Ensure ownership
  const addr = await prisma.address.findUnique({ where: { id } });
  if (!addr || addr.userId !== session.user.id) return new NextResponse("Not found", { status: 404 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


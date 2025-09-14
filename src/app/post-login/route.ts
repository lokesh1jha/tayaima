import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session && (session.user as any)?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
  return NextResponse.redirect(new URL("/products", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}

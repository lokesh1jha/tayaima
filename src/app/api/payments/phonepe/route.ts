import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.PHONEPE_API_KEY;
  if (!apiKey) {
    return new NextResponse(
      JSON.stringify({ enabled: false, message: "Payment gateway not configured" }),
      { status: 400 }
    );
  }

  // TODO: Implement PhonePe flow
  return NextResponse.json({ enabled: true });
}

export async function GET() {
  const apiKey = process.env.PHONEPE_API_KEY;
  return NextResponse.json({ enabled: !!apiKey });
}
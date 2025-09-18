import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOTPExpired, validatePhoneNumber, normalizePhoneNumber } from "@/lib/otp";
import { z } from "zod";

const verifyOTPSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp } = verifyOTPSchema.parse(body);

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    // Find user with this phone number
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      return NextResponse.json(
        { error: "No OTP request found for this phone number" },
        { status: 400 }
      );
    }

    // Check if OTP exists and matches
    if (!user.phoneOtp || user.phoneOtp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (!user.phoneOtpExpiry || isOTPExpired(user.phoneOtpExpiry)) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // OTP is valid, mark phone as verified and clear OTP
    const updatedUser = await prisma.user.update({
      where: { phone: normalizedPhone },
      data: {
        phoneVerified: new Date(),
        phoneOtp: null,
        phoneOtpExpiry: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        phoneVerified: updatedUser.phoneVerified,
      }
    });

  } catch (error: any) {
    console.error("Verify OTP error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

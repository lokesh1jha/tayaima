import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { phoneSchema } from "@/lib/sms";
import { validateRequestBody } from "@/lib/validations";
import { hash } from "bcryptjs";

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
  name: z.string().min(1, "Name is required").optional(),
  isSignup: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp, name, isSignup } = validateRequestBody(verifyOtpSchema, body);

    const now = new Date();

    // Find the OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone,
        otp,
        expiresAt: {
          gt: now,
        },
        verifiedAt: null, // Not already verified
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      // Increment attempts for failed verification
      await prisma.otpVerification.updateMany({
        where: {
          phone,
          expiresAt: {
            gt: now,
          },
          verifiedAt: null,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        verifiedAt: now,
      },
    });

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (isSignup) {
      if (user) {
        return NextResponse.json(
          { error: "User already exists with this phone number" },
          { status: 400 }
        );
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          phoneVerified: now,
          name: name || `User_${phone.slice(-4)}`, // Default name if not provided
        },
      });
    } else {
      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please sign up first." },
          { status: 404 }
        );
      }

      // Update phone verification timestamp
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          phoneVerified: now,
        },
      });
    }

    // Clean up expired OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: {
        phone,
        expiresAt: {
          lt: now,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: isSignup ? "Account created successfully" : "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

/**
 * TODO: OTP/PHONE AUTHENTICATION API - CURRENTLY DISABLED
 * 
 * This API endpoint handles sending OTP to phone numbers for authentication.
 * It is currently disabled and will be enabled when SMS service is activated.
 * 
 * DO NOT USE THIS ENDPOINT until SMS service is enabled.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { smsService, phoneSchema } from "@/lib/sms";
import { validateRequestBody } from "@/lib/validations";

const sendOtpSchema = z.object({
  phone: phoneSchema,
});

// Rate limiting configuration
const MAX_ATTEMPTS = 3;
const ATTEMPT_WINDOW = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_PERIOD = 30 * 60 * 1000; // 30 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = validateRequestBody(sendOtpSchema, body);

    // Check rate limiting
    const now = new Date();
    const windowStart = new Date(now.getTime() - ATTEMPT_WINDOW);
    const cooldownStart = new Date(now.getTime() - COOLDOWN_PERIOD);

    // Get recent OTP attempts for this phone
    const recentAttempts = await prisma.otpVerification.findMany({
      where: {
        phone,
        createdAt: {
          gte: windowStart,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if user is in cooldown period
    const cooldownAttempts = await prisma.otpVerification.findMany({
      where: {
        phone,
        createdAt: {
          gte: cooldownStart,
        },
        attempts: {
          gte: MAX_ATTEMPTS,
        },
      },
    });

    if (cooldownAttempts.length > 0) {
      return NextResponse.json(
        { 
          error: "Too many attempts. Please wait 30 minutes before requesting a new OTP.",
          cooldownUntil: new Date(cooldownAttempts[0].createdAt.getTime() + COOLDOWN_PERIOD).toISOString(),
        },
        { status: 429 }
      );
    }

    // Check if user has exceeded attempt limit in current window
    const failedAttempts = recentAttempts.filter(attempt => attempt.attempts >= MAX_ATTEMPTS);
    if (failedAttempts.length > 0) {
      return NextResponse.json(
        { 
          error: "Too many attempts. Please wait 30 minutes before requesting a new OTP.",
          cooldownUntil: new Date(failedAttempts[0].createdAt.getTime() + COOLDOWN_PERIOD).toISOString(),
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Clean up expired OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: {
        phone,
        expiresAt: {
          lt: now,
        },
      },
    });

    // Create new OTP record
    const otpRecord = await prisma.otpVerification.create({
      data: {
        phone,
        otp,
        expiresAt,
        attempts: 0,
      },
    });

    // Send SMS
    try {
      await smsService.sendOtp(phone, otp);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Don't fail the request if SMS fails, but log it
      // In production, you might want to queue this for retry
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: expiresAt.toISOString(),
      requestId: otpRecord.id,
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
